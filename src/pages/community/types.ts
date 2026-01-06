export interface CommunityResponse {
    communityId: number;
    postId: number;
    title: string;
    writerNickname: string;
    viewCount: number;
    likeCount: number;
    isPublic: boolean;
    isLiked: boolean;
    createdAt: string;
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
    id: number;
    content: string;
    writerNickname: string;
    createdAt: string;
    isOwner: boolean; // Computed on frontend or returned from backend if user context is aware
}
