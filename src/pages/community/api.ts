import axios from 'axios';
import type { CommunityResponse, PageResponse, UserProfileBasic } from './types';

const BASE_URL = 'http://localhost:8080/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
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

export const getCommunities = async (page: number, size: number = 10, userId?: number): Promise<PageResponse<CommunityResponse>> => {
    const params: any = { page, size };
    if (userId) {
        params.userId = userId;
    }

    const response = await axios.get(`${BASE_URL}/communities`, {
        params,
        headers: getAuthHeader(), // Include token for security if needed, though mostly public
    });
    return response.data;
};

export const getCommunityDetail = async (communityId: number, userId?: number): Promise<CommunityResponse> => {
    const params: any = {};
    if (userId) {
        params.userId = userId;
    }

    const response = await axios.get(`${BASE_URL}/communities/${communityId}`, {
        params,
        headers: getAuthHeader(),
    });
    return response.data;
};

export const toggleCommunityLike = async (communityId: number, userId: number): Promise<void> => {
    await axios.post(`${BASE_URL}/communities/${communityId}/like`, null, {
        params: { userId },
        headers: getAuthHeader(),
    });
};
