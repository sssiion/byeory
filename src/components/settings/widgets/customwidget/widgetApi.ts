// src/api/widgetApi.ts
import axios from 'axios';
import type { WidgetBlock } from './types.ts'; // types.ts 경로에 맞게 수정하세요

const API_BASE_URL = 'http://localhost:8080/api/widgets'; // 백엔드 주소

// 임시 유저 ID (로그인 구현 전까지 1번 유저로 고정)
const TEMP_USER_ID = '1';

// --- 1. 위젯 저장하기 ---
export const saveWidget = async (block: WidgetBlock, name: string) => {
    try {
        const response = await axios.post(
            API_BASE_URL,
            {
                name: name,           // 사용자가 입력한 위젯 이름
                type: block.type,     // 위젯 타입 (book-info, movie-ticket 등)
                content: block.content, // 내용 (JSON)
                styles: block.styles,   // 스타일 (JSON)
            },
            {
                headers: { 'X-User-Id': TEMP_USER_ID } // 헤더에 유저 ID 포함
            }
        );
        return response.data;
    } catch (error) {
        console.error('위젯 저장 실패:', error);
        throw error;
    }
};

// --- 2. 내 위젯 목록 가져오기 ---
export const getMyWidgets = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/my`, {
            headers: { 'X-User-Id': TEMP_USER_ID },
            params: { page: 0, size: 100 } // 충분히 많이 가져오기
        });
        // Spring Data JPA의 Page객체 리턴 구조에 따라 .content를 반환
        return response.data.content;
    } catch (error) {
        console.error('위젯 로드 실패:', error);
        return [];
    }
};
// --- 3. (선택) 위젯 삭제하기 ---
export const deleteWidget = async (widgetId: number) => {
    try {
        await axios.delete(`${API_BASE_URL}/${widgetId}`, {
            headers: { 'X-User-Id': TEMP_USER_ID }
        });
    } catch (error) {
        console.error('위젯 삭제 실패:', error);
        throw error;
    }
};
