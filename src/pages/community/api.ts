import axios from 'axios';
import type { CommunityResponse, PageResponse, UserProfileBasic, CommunityMessage } from './types';

const BASE_URL = 'http://localhost:8080/api';
const normalizeTags = (tags: any[]) => {
    if (!tags) return [];
    return tags.map((t: any) => {
        if (typeof t === 'string') return t;
        return t.name || t.tagName || "";
    }).filter((t: string) => t.length > 0);
};
const getAuthHeader = () => {
    let token = localStorage.getItem('accessToken');
    if (token) {
        // Strip quotes if present (common issue with JSON.stringify)
        if (token.startsWith('"') && token.endsWith('"')) {
            token = token.slice(1, -1);
        }
        return { Authorization: `Bearer ${token}` };
    }
    return {};
};

// --- User Helper ---
export const fetchMyProfile = async (): Promise<UserProfileBasic | null> => {
    try {
        const response = await axios.get(`${BASE_URL}/user/profile`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        // If 403/401, likely not logged in or token invalid
        return null;
    }
};

// --- Community APIs ---

export const getCommunities = async (page: number, size: number = 10, userId?: number, hashtag?: string): Promise<PageResponse<CommunityResponse>> => {
    const params: any = { page, size };
    if (userId) {
        params.userId = userId;
    }
    if (hashtag) {
        params.hashtag = hashtag;
    }

    const response = await axios.get(`${BASE_URL}/communities`, {
        params,
        headers: getAuthHeader(), // Include token for security if needed, though mostly public
    });

    // Map hashtags to simple string array if present
    const data = response.data;
    if (data && data.content) {
        data.content = data.content.map((item: any) => ({
            ...item,
            tags: (item.tags || item.hashtags || []).map((t: any) => {
                if (typeof t === 'string') return t;
                return t.name || t.tagName || "";
            }).filter((t: string) => t.length > 0)
        }));
    }
    return data;
};

export const getCommunityDetail = async (postId: number, userId?: number): Promise<CommunityResponse> => {
    const params: any = {};
    if (userId) {
        params.userId = userId;
    }

    const response = await axios.get(`${BASE_URL}/communities/${postId}`, {
        params,
        headers: getAuthHeader(),
    });

    // Map hashtags if present
    const data = response.data;
    if (data) {
        data.tags = (data.tags || data.hashtags || []).map((t: any) => {
            if (typeof t === 'string') return t;
            return t.name || t.tagName || "";
        }).filter((t: string) => t.length > 0);
    }
    return data;
};

export const toggleCommunityLike = async (postId: number, userId: number): Promise<void> => {
    await axios.post(`${BASE_URL}/communities/${postId}/like`, null, {
        params: { userId },
        headers: getAuthHeader(),
    });
};

// --- Message (Comment) APIs ---

export const getCommunityMessages = async (postId: number): Promise<CommunityMessage[]> => {
    const response = await axios.get(`${BASE_URL}/posts/${postId}/messages`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

export const createCommunityMessage = async (postId: number, content: string, userId: number): Promise<CommunityMessage> => {
    try {
        const response = await axios.post(`${BASE_URL}/posts/${postId}/messages`, { content }, {
            params: { userId },
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error: any) {
        console.error("Failed to create message. Status:", error.response?.status, "Data:", error.response?.data);
        throw error;
    }
};

export const deleteCommunityMessage = async (messageId: number): Promise<void> => {
    await axios.delete(`${BASE_URL}/messages/${messageId}`, {
        headers: getAuthHeader(),
    });
};

export const getPostDetail = async (postId: number): Promise<any> => {
    try {
        const response = await axios.get(`${BASE_URL}/posts/${postId}`, {
            headers: getAuthHeader(),
        });
        const p = response.data;
        return {
            ...p,
            id: Number(p.id),
            tags: (p.tags || p.hashtags || []).map((t: any) => {
                if (typeof t === 'string') return t;
                return t.name || t.tag || t.tagName || "";
            }).filter(Boolean),
            floatingTexts: p.floatingTexts || [],
            floatingImages: p.floatingImages || [],
            blocks: p.blocks || [],
            stickers: p.stickers || [],
            titleStyles: p.titleStyles || {},
            isFavorite: p.isFavorite || false,
        };
    } catch (error) {
        console.error("Failed to fetch post detail:", error);
        return null;
    }
};
// 카드 조회용 (조회수 증가 X)
// 1. 카드 상세 조회 (단순 데이터 조회, 조회수 증가 X)
export const getCommunitycardDetail = async (postId: number, userId?: number) => {
    try {
        const params = userId ? { userId } : {};
        const response = await axios.get(`${BASE_URL}/communities/card/${postId}`, {
            params,
            headers: getAuthHeader()
        });

        const data = response.data;
        if (data) {
            data.tags = normalizeTags(data.tags || data.hashtags);
        }
        return data;
    } catch (error) {
        console.error("게시글 상세 조회 실패:", error);
        throw error;
    }
};

// 스크롤 조회수 증가
export const increaseViewCount = async (postId: number) => {
    try {
        await axios.get(`${BASE_URL}/communities/scroll/${postId}`, {
            headers: getAuthHeader()
        });
    } catch (error) {
        console.error("조회수 증가 요청 실패:", error);
    }
};


