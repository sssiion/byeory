export interface MarketItem {
    id: string;
    type: string; // Broadened from union to string to support 'start_pack' etc.
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    author: string;
    tags: string[];
    averageRating?: number;
    reviewCount?: number;
    createdAt: string;
    sellerId?: string;
    referenceId?: string;
    salesCount: number;
    isAlreadySelling?: boolean;
    status: string; // Added to match useMarket usage
    isVirtual?: boolean;

    // ✨ Optional fields for Custom Widgets
    widgetType?: string;
    content?: any;
    decorations?: any[];
    defaultSize?: string;
    initialTab?: string; // For ItemDetailModal tab state
}
