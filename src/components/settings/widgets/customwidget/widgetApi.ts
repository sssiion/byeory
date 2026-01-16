import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/widgets';
const TEMP_USER_ID = '1'; // 컨트롤러가 요구하므로 유지 (나중엔 이것도 토큰에서 추출 가능)

// 🌟 토큰 가져오는 함수 (로그인 시 저장한 키 이름이 'accessToken'이라고 가정)
const getToken = () => localStorage.getItem('accessToken');

export const getMyWidgets = async () => {
    const token = getToken(); // 토큰 꺼내기

    try {
        const response = await axios.get(`${API_BASE_URL}/my`, {
            headers: {
                // 🌟 1. JWT 토큰 추가 (Bearer 방식)
                'Authorization': `Bearer ${token}`,

                // 🌟 2. 컨트롤러 로직 유지를 위한 User ID (이전과 동일)
                'X-User-Id': TEMP_USER_ID,

                'Content-Type': 'application/json',
            },
            params: {
                page: 0,
                size: 100
            }
        });
        return response.data.content || [];
    } catch (error) {
        console.error('위젯 로드 실패:', error);
        return [];
    }
};

export const deleteWidget = async (id: string) => {
    const token = getToken();
    try {
        await axios.delete(`${API_BASE_URL}/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-User-Id': TEMP_USER_ID,
            }
        });
        return true;
    } catch (error) {
        console.error('위젯 삭제 실패:', error);
        throw error;
    }
};

export const updateWidget = async (id: string, block: any, name: string) => {
    const token = getToken();
    try {
        const response = await axios.put(
            `${API_BASE_URL}/${id}`,
            {
                name: name,
                type: block.type,
                content: block.content,
                styles: block.styles,
                decorations: block.decorations, // 🌟 저장 시 decorations 포함
                thumbnailUrl: block.thumbnailUrl, // ✨ 썸네일 URL 추가
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-User-Id': TEMP_USER_ID,
                    'Content-Type': 'application/json',
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('위젯 수정 실패:', error);
        throw error;
    }
};

// 저장 함수도 동일하게 수정
export const saveWidget = async (block: any, name: string) => {
    const token = getToken();

    try {
        const response = await axios.post(
            API_BASE_URL,
            {
                name: name,
                type: block.type,
                content: block.content,
                styles: block.styles,
                decorations: block.decorations, // 🌟 저장 시 decorations 포함
                thumbnailUrl: block.thumbnailUrl, // ✨ 썸네일 URL 추가
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`, // 🌟 토큰 추가
                    'X-User-Id': TEMP_USER_ID,
                    'Content-Type': 'application/json',
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('위젯 저장 실패:', error);
        throw error;
    }
};