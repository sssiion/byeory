export interface CommunityResponse {
    communityId: number; // Same as postId, kept for compatibility if needed, but postId is primary
    postId: number;
    title: string;
    writerNickname: string;
    viewCount: number;
    likeCount: number;
    isPublic: boolean;
    isLiked: boolean;
    createdAt: string;
    commentCount?: number;
    blocks?: any[];
    stickers?: any[];
    floatingTexts?: any[];
    floatingImages?: any[];
    titleStyles?: Record<string, any>;
    tags?: string[];
}

export interface PageResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface UserProfileBasic {
    id: number;
    nickname: string;
    // Add other fields if necessary for profile fetching
}

export interface CommunityMessage {
    messageId: number;
    postId: number;
    userId: number;
    nickname: string;
    content: string;
    createdAt: string;
    // Derived or specific to frontend usage
    isOwner?: boolean;
}
