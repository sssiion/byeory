import { useCallback, useEffect, useState } from 'react';
import { useCredits } from '../context/CreditContext';
import { STICKERS } from '../pages/post/constants';

export const useMarket = () => {
    const { credits, spendCredits } = useCredits();
    const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
    const [sellingItems, setSellingItems] = useState<any[]>([]);
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);

    useEffect(() => {
        const savedPurchased = localStorage.getItem('market_purchased_items');
        if (savedPurchased) setPurchasedItems(JSON.parse(savedPurchased));

        const savedSelling = localStorage.getItem('market_selling_items');
        if (savedSelling) setSellingItems(JSON.parse(savedSelling));

        const savedWishlist = localStorage.getItem('market_wishlist_items');
        if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist));
    }, []);

    const isOwned = useCallback((itemId: string) => {
        return purchasedItems.includes(itemId);
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

    const registerItem = useCallback((item: any) => {
        const newSelling = [...sellingItems, item];
        setSellingItems(newSelling);
        localStorage.setItem('market_selling_items', JSON.stringify(newSelling));
    }, [sellingItems]);

    const cancelItem = useCallback((itemId: string) => {
        const newSelling = sellingItems.filter(i => i.id !== itemId);
        setSellingItems(newSelling);
        localStorage.setItem('market_selling_items', JSON.stringify(newSelling));
    }, [sellingItems]);

    const buyItem = useCallback((itemId: string, cost: number, additionalIds: string[] = []) => {
        if (credits < cost) return false;

        if (spendCredits(cost)) {
            const newPurchased = [...purchasedItems, itemId, ...additionalIds];
            // Remove duplicates just in case
            const unique = Array.from(new Set(newPurchased));

            setPurchasedItems(unique);
            localStorage.setItem('market_purchased_items', JSON.stringify(unique));
            return true;
        }
        return false;
    }, [credits, spendCredits, purchasedItems]);

    const getPackPrice = useCallback((packId: string, originalPrice: number) => {
        // Find all sub-items (stickers) that belong to this pack
        const packStickers = STICKERS.filter(s => s.packId === packId);
        if (packStickers.length === 0) return originalPrice;

        // Calculate value of owned items
        const ownedStickers = packStickers.filter(s => isOwned(s.id));
        const ownedValue = ownedStickers.reduce((sum, s) => sum + (s.price || 0), 0);

        // Discount logic: Subtract owned value from pack price
        // Minimum price is 0
        return Math.max(0, originalPrice - ownedValue);
    }, [isOwned]);

    return {
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
