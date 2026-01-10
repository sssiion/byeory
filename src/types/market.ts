export interface MarketItem {
    id: string;
    type: 'sticker' | 'template_widget' | 'template_post';
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    author: string;
    tags: string[];
    averageRating?: number;
    reviewCount?: number;
    createdAt?: string;
    sellerId?: string | number;
    referenceId?: string;
    salesCount?: number;
    isAlreadySelling?: boolean;
}
