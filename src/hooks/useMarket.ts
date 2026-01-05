import { useCallback, useEffect, useState } from 'react';
import { useCredits } from '../context/CreditContext';
import { STICKERS } from '../pages/post/constants';


export const useMarket = () => {
    const { credits, refreshCredits, userId } = useCredits(); // Using refreshCredits, userId
    const [purchasedItems, setPurchasedItems] = useState<any[]>([]); // Store full objects now
    const [sellingItems, setSellingItems] = useState<any[]>([]);
    const [marketItems, setMarketItems] = useState<any[]>([]); // All items on sale (from backend)
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [sort, setSort] = useState<'popular' | 'latest' | 'price_low' | 'price_high'>('popular');

    // Function to fetch data from backend
    const refreshMarket = useCallback(async (options: { page?: number, keyword?: string, isLoadMore?: boolean, newSort?: 'popular' | 'latest' | 'price_low' | 'price_high' } = {}) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const targetPage = options.page !== undefined ? options.page : 0;
        const targetKeyword = options.keyword !== undefined ? options.keyword : keyword;
        const targetSort = options.newSort !== undefined ? options.newSort : sort; // Use passed sort or state
        const isLoadMore = options.isLoadMore || false;

        if (!isLoadMore) {
            setPage(0); // Reset page on fresh load
        }

        try {
            // 1. Fetch Purchased Items (Only on initial load or if needed? Keep simpler for now, always fetch)
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

            // 3. Fetch All Market Items (For browsing)
            let sortParam = 'createdAt,desc';
            switch (targetSort) {
                case 'popular': sortParam = 'salesCount,desc'; break; // Now supported by @Formula
                case 'latest': sortParam = 'createdAt,desc'; break;
                case 'price_low': sortParam = 'price,asc'; break;
                case 'price_high': sortParam = 'price,desc'; break;
            }

            const query = new URLSearchParams({
                page: String(targetPage),
                size: '12',
                sort: sortParam
            });
            if (targetKeyword) query.append('keyword', targetKeyword);

            const marketRes = await fetch(`http://localhost:8080/api/market/items?${query.toString()}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (marketRes.ok) {
                const data = await marketRes.json();
                const items = data.content; // Page response
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

                // Filter out own items
                const filteredItems = userId
                    ? backendItems.filter((i: any) => String(i.sellerId) !== String(userId))
                    : backendItems;

                if (isLoadMore) {
                    setMarketItems(prev => {
                        // Avoid duplicates
                        const existingIds = new Set(prev.map(p => p.id));
                        const newUnique = filteredItems.filter((i: any) => !existingIds.has(i.id));
                        return [...prev, ...newUnique];
                    });
                } else {
                    setMarketItems(filteredItems);
                }
                setHasMore(!data.last);
                if (isLoadMore) {
                    setPage(targetPage);
                }
            }

        } catch (e) {
            console.error("Failed to fetch market data", e);
        }
    }, [userId, keyword, sort]);

    const loadMore = useCallback(() => {
        if (!hasMore) return;
        refreshMarket({ page: page + 1, isLoadMore: true });
    }, [hasMore, page, refreshMarket]);

    const search = useCallback((kw: string) => {
        setKeyword(kw);
        refreshMarket({ page: 0, keyword: kw, isLoadMore: false });
    }, [refreshMarket]);

    const changeSort = useCallback((newSort: 'popular' | 'latest' | 'price_low' | 'price_high') => {
        setSort(newSort);
        refreshMarket({ page: 0, newSort: newSort, isLoadMore: false });
    }, [refreshMarket]);

    useEffect(() => {
        refreshMarket();

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
    }, []); // Initial load only, then controlled by refreshMarket dependencies

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

    const cancelItem = useCallback(async (itemId: string) => {
        // check if it's a backend item (numeric ID)
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
                await refreshCredits(); // Force refresh credits
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
        hasMore,
        isSearching: !!keyword
    };
};

