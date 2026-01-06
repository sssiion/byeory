import { useCallback, useEffect, useState } from 'react';
import { useCredits } from '../context/CreditContext';
import { STICKERS } from '../pages/post/constants';


export const useMarket = () => {
    const { credits, refreshCredits, userId } = useCredits();
    const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
    const [sellingItems, setSellingItems] = useState<any[]>([]);
    const [marketItems, setMarketItems] = useState<any[]>([]);
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [sort, setSort] = useState<'popular' | 'latest' | 'price_low' | 'price_high'>('popular');

    const [sellerId, setSellerId] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Function to fetch data from backend
    const refreshMarket = useCallback(async (options: { page?: number, keyword?: string, isLoadMore?: boolean, newSort?: 'popular' | 'latest' | 'price_low' | 'price_high', sellerId?: string | null, isFree?: boolean } = {}) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const targetPage = options.page !== undefined ? options.page : 0;
        const targetKeyword = options.keyword !== undefined ? options.keyword : keyword;
        const targetSort = options.newSort !== undefined ? options.newSort : sort;
        const targetSellerId = options.sellerId !== undefined ? options.sellerId : sellerId;
        const isLoadMore = options.isLoadMore || false;

        if (!isLoadMore) {
            setPage(0);
        }

        try {
            // 1. Fetch Purchased Items
            let backendPurchased: any[] = [];
            const purchasedRes = await fetch('http://localhost:8080/api/market/purchased', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (purchasedRes.ok) {
                const items = await purchasedRes.json();
                backendPurchased = items.map((i: any) => ({
                    id: String(i.id),
                    title: i.name,
                    price: i.price,
                    description: i.contentJson ? JSON.parse(i.contentJson).description : '',
                    tags: i.contentJson ? JSON.parse(i.contentJson).tags : [],
                    imageUrl: i.contentJson ? JSON.parse(i.contentJson).imageUrl : '',
                    type: i.category,
                    author: i.sellerName,
                    purchasedAt: i.transactionDate,
                    status: i.status,
                    createdAt: i.createdAt,
                    salesCount: i.salesCount || 0,
                    averageRating: i.averageRating,
                    reviewCount: i.reviewCount,
                    isBackend: true
                }));
            }

            setPurchasedItems(backendPurchased);

            // 2. Fetch My Selling Items
            const sellingRes = await fetch('http://localhost:8080/api/market/my-items', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (sellingRes.ok) {
                const items = await sellingRes.json();
                const backendSelling = items.map((i: any) => ({
                    id: String(i.id),
                    title: i.name,
                    price: i.price,
                    description: i.contentJson ? JSON.parse(i.contentJson).description : '',
                    tags: i.contentJson ? JSON.parse(i.contentJson).tags : [],
                    imageUrl: i.contentJson ? JSON.parse(i.contentJson).imageUrl : '',
                    type: i.category,
                    author: i.sellerName,
                    status: i.status,
                    createdAt: i.createdAt,
                    salesCount: i.salesCount || 0,
                    referenceId: i.referenceId,
                    averageRating: i.averageRating,
                    reviewCount: i.reviewCount,
                    isBackend: true
                }));
                setSellingItems(backendSelling);
            }

            // 3. Fetch All Market Items
            let sortParam = 'createdAt,desc';
            switch (targetSort) {
                case 'popular': sortParam = 'salesCount,desc'; break;
                case 'latest': sortParam = 'createdAt,desc'; break;
                case 'price_low': sortParam = 'price,asc'; break;
                case 'price_high': sortParam = 'price,desc'; break;
            }

            const query = new URLSearchParams({
                page: String(targetPage),
                size: '12',
                sort: sortParam
            });

            if (targetKeyword) {
                query.append('keyword', targetKeyword);
            }

            if (selectedTags.length > 0) {
                selectedTags.forEach(t => query.append('tags', t));
            }

            console.log("DEBUG: refreshMarket", {
                targetKeyword,
                selectedTags,
                query: query.toString()
            });

            if (targetSellerId) {
                query.append('sellerId', targetSellerId);
            }

            const marketRes = await fetch(`http://localhost:8080/api/market/items?${query.toString()}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (marketRes.ok) {
                const data = await marketRes.json();
                const items = data.content;
                const backendItems = items.map((i: any) => ({
                    id: String(i.id),
                    title: i.name,
                    price: i.price,
                    description: i.contentJson ? JSON.parse(i.contentJson).description : '',
                    tags: i.contentJson ? JSON.parse(i.contentJson).tags : [],
                    imageUrl: i.contentJson ? JSON.parse(i.contentJson).imageUrl : '',
                    type: i.category,
                    author: i.sellerName,
                    sellerId: i.sellerId,
                    status: i.status,
                    createdAt: i.createdAt,
                    salesCount: i.salesCount || 0,
                    referenceId: i.referenceId,
                    averageRating: i.averageRating,
                    reviewCount: i.reviewCount,
                    isBackend: true
                }));

                // Filter out own items logic (optional, but requested behavior is view by seller)
                let finalItems = userId
                    ? backendItems.filter((i: any) => String(i.sellerId) !== String(userId))
                    : backendItems;

                if (targetSellerId && String(targetSellerId) === String(userId)) {
                    // Allow seeing own items if explicitly filtering by self
                    finalItems = backendItems.filter((i: any) => String(i.sellerId) === String(userId));
                }

                if (isLoadMore) {
                    setMarketItems(prev => {
                        const existingIds = new Set(prev.map(p => p.id));
                        const newUnique = finalItems.filter((i: any) => !existingIds.has(i.id));
                        return [...prev, ...newUnique];
                    });
                } else {
                    setMarketItems(finalItems);
                }
                setHasMore(!data.last);
                if (isLoadMore) {
                    setPage(targetPage);
                }
            }
        } catch (e) {
            console.error("Failed to fetch market data", e);
        }
    }, [userId, keyword, sort, sellerId, selectedTags]);

    const loadMore = useCallback(() => {
        if (!hasMore) return;
        refreshMarket({ page: page + 1, isLoadMore: true });
    }, [hasMore, page, refreshMarket]);

    const filterBySeller = useCallback((newSellerId: string | null) => {
        setSellerId(newSellerId);
        setKeyword(''); // Reset keyword when filtering by seller
    }, []);

    const filterByTag = useCallback((tag: string | null) => {
        if (tag === null) {
            setSelectedTags([]);
        } else {
            setSelectedTags(prev => {
                const newTags = prev.includes(tag)
                    ? prev.filter(t => t !== tag)
                    : [...prev, tag];
                return newTags;
            });
        }
        setKeyword('');
    }, []);

    const search = useCallback((kw: string) => {
        setKeyword(kw);
        setSellerId(null);
        setSelectedTags([]);
    }, []);

    const changeSort = useCallback((newSort: 'popular' | 'latest' | 'price_low' | 'price_high') => {
        setSort(newSort);
    }, []);

    useEffect(() => {
        refreshMarket();
    }, [refreshMarket]);

    useEffect(() => {
        // Fetch Wishlist IDs
        const fetchWishlist = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return;
            try {
                const res = await fetch('http://localhost:8080/api/market/wishlist/ids', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const ids = await res.json();
                    setWishlistItems(ids.map(String));
                }
            } catch (e) {
                console.error("Failed to fetch wishlist", e);
            }
        };
        fetchWishlist();
    }, []);

    const isOwned = useCallback((itemId: string) => {
        return purchasedItems.some(item => item.id === String(itemId));
    }, [purchasedItems]);

    const isWishlisted = useCallback((itemId: string) => {
        return wishlistItems.includes(itemId);
    }, [wishlistItems]);

    const toggleWishlist = useCallback(async (itemId: string) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:8080/api/market/wishlist/${itemId}`, {
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

            const response = await fetch('http://localhost:8080/api/market/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                await refreshMarket();
                await refreshCredits();
            } else {
                alert("아이템 등록 실패");
            }
        } catch (e) {
            console.error(e);
            alert("아이템 등록 중 오류 발생");
        }
    }, [refreshMarket, refreshCredits]);

    const updateItem = useCallback(async (itemId: string, itemData: any) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요합니다.');
            return false;
        }

        try {
            const body = {
                name: itemData.title,
                price: itemData.price,
                category: itemData.type,
                // referenceId: itemData.referenceId, // Usually not updated
                contentJson: JSON.stringify({
                    description: itemData.description,
                    tags: itemData.tags,
                    imageUrl: itemData.imageUrl || ''
                })
            };

            const response = await fetch(`http://localhost:8080/api/market/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                // Reload selling items
                const res = await fetch('http://localhost:8080/api/market/my-items', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const items = await res.json();
                    const selling = items.map((i: any) => ({
                        id: String(i.id),
                        title: i.name,
                        price: i.price,
                        description: i.contentJson ? JSON.parse(i.contentJson).description : '',
                        tags: i.contentJson ? JSON.parse(i.contentJson).tags : [],
                        type: i.category,
                        salesCount: i.salesCount,
                        status: i.status,
                        referenceId: i.referenceId
                    }));
                    setSellingItems(selling);
                }
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
    }, []);

    const cancelItem = useCallback(async (itemId: string) => {
        if (!isNaN(Number(itemId))) {
            const token = localStorage.getItem('accessToken');
            if (!token) return;
            try {
                const response = await fetch(`http://localhost:8080/api/market/cancel/${itemId}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    await refreshMarket();
                } else {
                    alert("판매 취소 실패");
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, [refreshMarket]);

    const buyItem = useCallback(async (itemId: string, cost: number) => {
        if (credits < cost) return false;

        const token = localStorage.getItem('accessToken');
        if (!token) return false;

        try {
            const response = await fetch(`http://localhost:8080/api/market/buy/${itemId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                await refreshMarket();
                await refreshCredits();
                return true;
            } else {
                alert("구매 실패 (이미 판매되었거나 오류가 발생했습니다)");
                return false;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
    }, [credits, refreshMarket, refreshCredits]);

    const getPackPrice = useCallback((packId: string, originalPrice: number) => {
        const packStickers = STICKERS.filter(s => s.packId === packId);
        if (packStickers.length === 0) return originalPrice;
        const ownedStickers = packStickers.filter(s => isOwned(s.id));
        const ownedValue = ownedStickers.reduce((sum, s) => sum + (s.price || 0), 0);
        return Math.max(0, originalPrice - ownedValue);
    }, [isOwned]);

    return {
        marketItems,
        purchasedItems,
        sellingItems,
        wishlistItems,
        isOwned,
        isWishlisted,
        toggleWishlist,
        buyItem,
        registerItem,
        cancelItem,
        getPackPrice,
        loadMore,
        search,
        changeSort,
        sort,
        filterBySeller,
        sellerId,
        filterByTag,
        selectedTags,
        hasMore,
        isSearching: !!keyword,
        updateItem,
        refreshMarket
    };
};
