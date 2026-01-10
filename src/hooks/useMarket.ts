import { useCallback, useEffect, useState, useMemo } from 'react';
import { useCredits } from '../context/CreditContext';
import { STICKERS } from '../components/post/constants';

const API_BASE_URL = 'http://localhost:8080/api/market';

export interface MarketItem {
    id: string;
    title: string;
    price: number;
    description: string;
    tags: string[];
    imageUrl: string;
    type: string;
    author: string;
    sellerId?: string;
    status: string;
    createdAt: string;
    salesCount: number;
    referenceId?: string;
    averageRating?: number;
    reviewCount?: number;
    isBackend?: boolean;
    isVirtual?: boolean;
    purchasedAt?: string;
}

// 백엔드 응답을 프론트엔드 모델로 매핑하는 헬퍼 함수
const mapBackendItemToFrontend = (i: any): MarketItem => {
    let content = { description: '', tags: [], imageUrl: '' };
    try {
        if (i.contentJson) {
            content = JSON.parse(i.contentJson);
        }
    } catch (e) {
        console.warn('Failed to parse contentJson for item', i.id);
    }

    return {
        id: String(i.id),
        title: i.name,
        price: i.price,
        description: content.description || '',
        tags: content.tags || [],
        imageUrl: content.imageUrl || '',
        type: i.category,
        author: i.sellerName,
        sellerId: i.sellerId ? String(i.sellerId) : undefined,
        status: i.status,
        createdAt: i.createdAt,
        salesCount: i.salesCount || 0,
        referenceId: i.referenceId,
        averageRating: i.averageRating,
        reviewCount: i.reviewCount,
        purchasedAt: i.transactionDate, // 구매 시점에만 존재
        isBackend: true
    };
};

export const useMarket = () => {
    const { credits, refreshCredits, userId } = useCredits();

    // 데이터 상태
    const [purchasedItems, setPurchasedItems] = useState<MarketItem[]>([]);
    const [sellingItems, setSellingItems] = useState<MarketItem[]>([]);
    const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);
    const [wishlistDetails, setWishlistDetails] = useState<MarketItem[]>([]);

    // 필터 및 정렬 상태
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [sort, setSort] = useState<'popular' | 'latest' | 'price_low' | 'price_high'>('popular');
    const [totalCount, setTotalCount] = useState(0);
    const [sellerId, setSellerId] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [category, setCategory] = useState<string>('all');
    const [isFree, setIsFree] = useState(false);

    // --- 사용자 데이터 조회 (구매, 판매, 위시리스트) ---
    const fetchUserData = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            // 1. 구매 내역 상세 조회 (팩 포함)
            const purchasedRes = await fetch(`${API_BASE_URL}/purchased`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (purchasedRes.ok) {
                const items = await purchasedRes.json();

                // 팩 상품일 경우, 포함된 가상 스티커들도 목록에 추가
                const expandedItems = items.flatMap((i: any) => {
                    const mainItem = mapBackendItemToFrontend(i);
                    const virtualItems: MarketItem[] = [];

                    if (mainItem.referenceId) {
                        const packContents = STICKERS.filter(s => s.packId === mainItem.referenceId);
                        packContents.forEach(sticker => {
                            virtualItems.push({
                                id: sticker.id,
                                title: sticker.name || '포함된 스티커',
                                imageUrl: sticker.url,
                                price: 0,
                                type: 'sticker',
                                author: mainItem.author,
                                purchasedAt: mainItem.purchasedAt,
                                status: 'OWNED',
                                referenceId: sticker.id,
                                isVirtual: true,
                                description: `${mainItem.title}에 포함됨`,
                                tags: ['Pack Content'],
                                averageRating: mainItem.averageRating,
                                reviewCount: mainItem.reviewCount,
                                createdAt: mainItem.createdAt,
                                salesCount: mainItem.salesCount
                            });
                        });
                    }
                    return [mainItem, ...virtualItems];
                });

                // 가상 아이템과 실제 구매 아이템 중 가상 아이템 우선 (중복 제거)
                const uniqueItems = expandedItems.filter((item: MarketItem, _: number, self: MarketItem[]) => {
                    if (!item.isVirtual && item.referenceId) {
                        const hasVirtual = self.some(other => other.isVirtual && other.referenceId === item.referenceId);
                        if (hasVirtual) return false;
                    }
                    return true;
                });
                setPurchasedItems(uniqueItems);
            }

            // 2. 내 판매 목록 조회
            const sellingRes = await fetch(`${API_BASE_URL}/my-items`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (sellingRes.ok) {
                const items = await sellingRes.json();
                setSellingItems(items.map(mapBackendItemToFrontend));
            }

            // 3. 위시리스트 조회
            const wishRes = await fetch(`${API_BASE_URL}/wishlist`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (wishRes.ok) {
                const items = await wishRes.json();
                const mapped = items.map(mapBackendItemToFrontend);
                setWishlistDetails(mapped);
                setWishlistItems(mapped.map((i: MarketItem) => i.id));
            }

        } catch (e) {
            console.error("Failed to fetch user market data", e);
        }
    }, [userId]);

    // --- 마켓 피드 조회 ---
    const fetchMarketFeed = useCallback(async (isLoadMore = false) => {
        const token = localStorage.getItem('accessToken');

        const targetPage = isLoadMore ? page + 1 : 0;
        if (!isLoadMore) setPage(0);

        let sortParam = 'salesCount,desc';
        if (sort === 'latest') sortParam = 'createdAt,desc';
        if (sort === 'price_low') sortParam = 'price,asc';
        if (sort === 'price_high') sortParam = 'price,desc';

        const query = new URLSearchParams({
            page: String(targetPage),
            size: '12',
            sort: sortParam
        });

        if (keyword) query.append('keyword', keyword);
        if (sellerId) query.append('sellerId', sellerId);
        if (selectedTags.length > 0) selectedTags.forEach(t => query.append('tags', t));
        if (category && category !== 'all') query.append('category', category);
        if (isFree) query.append('isFree', 'true');

        try {
            const res = await fetch(`${API_BASE_URL}/items?${query.toString()}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (res.ok) {
                const data = await res.json();
                let total = data.page?.totalElements ?? data.totalElements ?? 0;

                setTotalCount(total);

                const fetchedItems = data.content.map(mapBackendItemToFrontend);

                // 본인 상품 제외 또는 필터링 로직
                let visibleItems = fetchedItems;
                if (userId) {
                    if (sellerId === String(userId)) {
                        // 내 상점 보기 모드
                        visibleItems = fetchedItems.filter((i: MarketItem) => String(i.sellerId) === String(userId));
                    } else {
                        // 일반 피드 (내 상품 숨김)
                        visibleItems = fetchedItems.filter((i: MarketItem) => String(i.sellerId) !== String(userId));
                    }
                }

                if (isLoadMore) {
                    setMarketItems(prev => {
                        const existingIds = new Set(prev.map(p => p.id));
                        const newUnique = visibleItems.filter((i: MarketItem) => !existingIds.has(i.id));
                        return [...prev, ...newUnique];
                    });
                    setPage(targetPage);
                } else {
                    setMarketItems(visibleItems);
                }
                setHasMore(!data.last);
            }
        } catch (e) {
            console.error("Failed to fetch market feed", e);
        }
    }, [page, sort, keyword, sellerId, selectedTags, category, isFree, userId, sellingItems.length]);


    // --- 초기 로드 및 효과 Hooks ---

    // 1. 사용자 데이터 로드
    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // 2. 피드 데이터 조건 변경 시 로드
    useEffect(() => {
        fetchMarketFeed(false);
    }, [sort, keyword, sellerId, selectedTags, category, isFree]); // page is handled in loadMore 함수에서 처리

    // 통합 새로고침 함수
    const refreshMarket = useCallback(async (options: { isLoadMore?: boolean } = {}) => {
        if (options.isLoadMore) {
            await fetchMarketFeed(true);
        } else {
            await Promise.all([fetchUserData(), fetchMarketFeed(false)]);
        }
    }, [fetchUserData, fetchMarketFeed]);


    // --- 액션 핸들러 ---

    const loadMore = useCallback(() => {
        if (!hasMore) return;
        fetchMarketFeed(true);
    }, [hasMore, fetchMarketFeed]);

    const filterBySeller = useCallback((id: string | null) => {
        setSellerId(id);
        setKeyword('');
        setPage(0);
    }, []);

    const filterByTag = useCallback((tag: string | null) => {
        if (tag === null) setSelectedTags([]);
        else setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
        setKeyword('');
        setPage(0);
    }, []);

    const search = useCallback((kw: string) => {
        setKeyword(kw);
        setSellerId(null);
        setSelectedTags([]);
        setPage(0);
    }, []);

    const buyItem = useCallback(async (itemId: string, cost: number) => {
        if (credits < cost) return false;
        const token = localStorage.getItem('accessToken');
        if (!token) return false;

        try {
            let url = `${API_BASE_URL}/buy/${itemId}`;
            if (isNaN(Number(itemId))) { // 레퍼런스 ID 구매 (팩 등)
                url = `${API_BASE_URL}/buy/ref/${itemId}`;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchUserData(); // 소유권 갱신
                await refreshCredits(); // 크레딧 갱신
                return true;
            } else {
                alert("구매 실패 (이미 판매되었거나 오류가 발생했습니다)");
                return false;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
    }, [credits, refreshCredits, fetchUserData]);

    const toggleWishlist = useCallback(async (itemId: string) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/wishlist/${itemId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setWishlistItems(prev => {
                    if (data.added) return [...prev, String(itemId)];
                    return prev.filter(id => id !== String(itemId));
                });
            }
        } catch (e) {
            console.error("Failed to toggle wishlist", e);
        }
    }, []);

    const registerItem = useCallback(async (item: any) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const payload = {
                name: item.title,
                price: item.price,
                category: item.type || 'sticker',
                contentJson: JSON.stringify({
                    description: item.description,
                    imageUrl: item.imageUrl,
                    tags: item.tags
                }),
                referenceId: item.originalId?.toString() || item.id?.toString()
            };

            const response = await fetch(`${API_BASE_URL}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                await Promise.all([fetchUserData(), fetchMarketFeed(false), refreshCredits()]);
            } else {
                alert("아이템 등록 실패");
            }
        } catch (e) {
            console.error(e);
            alert("아이템 등록 중 오류 발생");
        }
    }, [fetchUserData, fetchMarketFeed, refreshCredits]);

    const updateItem = useCallback(async (itemId: string, itemData: any) => {
        const token = localStorage.getItem('accessToken');
        if (!token) { alert('로그인이 필요합니다.'); return false; }

        try {
            const body = {
                name: itemData.title,
                price: itemData.price,
                category: itemData.type,
                contentJson: JSON.stringify({
                    description: itemData.description,
                    tags: itemData.tags,
                    imageUrl: itemData.imageUrl || ''
                })
            };

            const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                await fetchUserData();
                return true;
            } else {
                const errorText = await response.text();
                alert(`수정 실패: ${errorText}`);
                return false;
            }
        } catch (error) {
            console.error("Failed to update item", error);
            alert('수정 중 오류가 발생했습니다.');
            return false;
        }
    }, [fetchUserData]);

    const cancelItem = useCallback(async (itemId: string) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/cancel/${itemId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                await Promise.all([fetchUserData(), fetchMarketFeed(false)]);
            } else {
                alert("판매 취소 실패");
            }
        } catch (e) {
            console.error(e);
        }
    }, [fetchUserData, fetchMarketFeed]);

    const isOwned = useCallback((itemId: string) => {
        let checkId = String(itemId);
        // 직접 ID 체크
        if (purchasedItems.some(i => i.id === checkId || i.referenceId === checkId)) return true;

        // 팩 포함 여부 체크
        const stickerDef = STICKERS.find(s => s.id === checkId);
        if (stickerDef && stickerDef.packId) {
            const packId = String(stickerDef.packId);
            return purchasedItems.some(i => i.id === packId || i.referenceId === packId);
        }
        return false;
    }, [purchasedItems]);

    const isWishlisted = useCallback((itemId: string) => wishlistItems.includes(String(itemId)), [wishlistItems]);

    const getPackPrice = useCallback((packId: string, originalPrice: number) => {
        const packStickers = STICKERS.filter(s => s.packId === packId);
        if (packStickers.length === 0) return originalPrice;
        const ownedStickers = packStickers.filter(s => isOwned(s.id));
        const ownedValue = ownedStickers.reduce((sum, s) => sum + (s.price || 0), 0);
        return Math.max(0, originalPrice - ownedValue);
    }, [isOwned]);

    const getMarketItem = useCallback(async (itemId: string) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return null;
        try {
            const res = await fetch(`${API_BASE_URL}/items/${itemId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const i = await res.json();
                return mapBackendItemToFrontend(i);
            }
            return null;
        } catch (e) {
            console.error("Failed to fetch market item", e);
            return null;
        }
    }, []);

    return useMemo(() => ({
        // 데이터
        marketItems,
        purchasedItems,
        sellingItems,
        wishlistItems,
        wishlistDetails,
        totalCount,
        hasMore,
        isSearching: !!keyword,

        // 필터 및 검색
        sort,
        changeSort: setSort,
        keyword,
        search,
        sellerId,
        filterBySeller,
        selectedTags,
        filterByTag,
        category,
        filterByCategory: setCategory,
        isFree,
        filterByFree: setIsFree,

        // 액션
        refreshMarket,
        loadMore,
        buyItem,
        registerItem,
        updateItem,
        cancelItem,
        toggleWishlist,

        // 헬퍼
        isOwned,
        isWishlisted,
        getPackPrice,
        getMarketItem
    }), [
        marketItems, purchasedItems, sellingItems, wishlistItems, wishlistDetails,
        totalCount, hasMore, keyword, sort, sellerId, selectedTags, category, isFree,
        refreshMarket, loadMore, buyItem, registerItem, updateItem, cancelItem, toggleWishlist,
        isOwned, isWishlisted, getPackPrice, getMarketItem, search, filterBySeller, filterByTag
    ]);
};
