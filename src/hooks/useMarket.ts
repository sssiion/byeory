import { useCallback, useEffect, useState } from 'react';
import { useCredits } from '../context/CreditContext';
import { STICKERS } from '../pages/post/constants';

export const useMarket = () => {
    const { credits, spendCredits } = useCredits(); // Using addCredits for consistency/refresh
    const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
    const [sellingItems, setSellingItems] = useState<any[]>([]);
    const [marketItems, setMarketItems] = useState<any[]>([]); // All items on sale (from backend)
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);

    // Function to fetch data from backend
    const refreshMarket = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            // 1. Fetch Purchased Items
            const purchasedRes = await fetch('http://localhost:8080/api/market/purchased', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (purchasedRes.ok) {
                const items = await purchasedRes.json();
                const backendIds = items.map((i: any) => String(i.id));
                const localIds = JSON.parse(localStorage.getItem('market_purchased_items') || '[]');
                const merged = Array.from(new Set([...backendIds, ...localIds]));
                setPurchasedItems(merged as string[]);
            }

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
                    isBackend: true
                }));
                setSellingItems(backendSelling);
            }

            // 3. Fetch All Market Items (For browsing)
            const marketRes = await fetch('http://localhost:8080/api/market/items', {
                // No auth header needed for public market? Or yes? Controller code didn't force it but good practice.
                // Actually my controller implementation likely requires auth if I put @AuthenticationPrincipal.
                // Checked controller: getAllOnSaleItems does NOT have @AuthenticationPrincipal, so public access is fine.
                // But let's send token if available.
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (marketRes.ok) {
                const items = await marketRes.json();
                const backendItems = items.map((i: any) => ({
                    id: String(i.id),
                    title: i.name,
                    price: i.price,
                    description: i.contentJson ? JSON.parse(i.contentJson).description : '',
                    tags: i.contentJson ? JSON.parse(i.contentJson).tags : [],
                    imageUrl: i.contentJson ? JSON.parse(i.contentJson).imageUrl : '',
                    type: i.category,
                    author: i.sellerName,
                    isBackend: true
                }));
                setMarketItems(backendItems);
            }

        } catch (e) {
            console.error("Failed to fetch market data", e);
        }
    }, []);

    useEffect(() => {
        // Initial Load: Load local then refresh from server
        const savedPurchased = JSON.parse(localStorage.getItem('market_purchased_items') || '[]');
        setPurchasedItems(savedPurchased);

        const savedWishlist = localStorage.getItem('market_wishlist_items');
        if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist));

        refreshMarket();
    }, [refreshMarket]);

    const isOwned = useCallback((itemId: string) => {
        return purchasedItems.includes(String(itemId));
    }, [purchasedItems]);

    const isWishlisted = useCallback((itemId: string) => {
        return wishlistItems.includes(itemId);
    }, [wishlistItems]);

    const toggleWishlist = useCallback((itemId: string) => {
        const newItem = wishlistItems.includes(itemId)
            ? wishlistItems.filter(id => id !== itemId)
            : [...wishlistItems, itemId];

        setWishlistItems(newItem);
        localStorage.setItem('market_wishlist_items', JSON.stringify(newItem));
    }, [wishlistItems]);

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
                })
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
            } else {
                alert("아이템 등록 실패");
            }
        } catch (e) {
            console.error(e);
            alert("아이템 등록 중 오류 발생");
        }
    }, [refreshMarket]);

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

    const buyItem = useCallback(async (itemId: string, cost: number, additionalIds: string[] = []) => {
        if (credits < cost) return false;

        // Check if numeric ID -> Backend Buy
        if (!isNaN(Number(itemId))) {
            const token = localStorage.getItem('accessToken');
            if (!token) return false;

            try {
                const response = await fetch(`http://localhost:8080/api/market/buy/${itemId}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    // Success
                    await refreshMarket();
                    // Also force refresh credits in context
                    // We can't directly call refreshCredits from Context here easily without exposing it,
                    // but refreshMarket updates purchasedItems.
                    // CreditContext should ideally auto-refresh or we trigger it.
                    // The simple hack: add 0 credits to trigger refresh? No that calls API.
                    // We rely on the fact that next route change or interval will update credits,
                    // OR we can optimistically deduct.
                    return true;
                } else {
                    alert("구매 실패 (이미 판매되었거나 오류가 발생했습니다)");
                    return false;
                }
            } catch (e) {
                console.error(e);
                return false;
            }
        } else {
            // Legacy LocalStorage Buy
            if (spendCredits(cost)) {
                const newPurchased = [...purchasedItems, itemId, ...additionalIds];
                const unique = Array.from(new Set(newPurchased));
                setPurchasedItems(unique as string[]);
                localStorage.setItem('market_purchased_items', JSON.stringify(unique));
                return true;
            }
        }
        return false;
    }, [credits, spendCredits, purchasedItems, refreshMarket]);

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
        getPackPrice
    };
};
