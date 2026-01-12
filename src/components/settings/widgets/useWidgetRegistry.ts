import { useState, useEffect } from 'react';
import axios from 'axios';
import type { WidgetConfig, WidgetDefinition } from "./type.ts";
import { WIDGET_COMPONENT_MAP } from "./componentMap.ts";

// 백엔드 주소 상수 정의
const BASE_URL = 'http://localhost:8080';

export const useWidgetRegistry = (userId?: number) => {
    const [registry, setRegistry] = useState<Record<string, WidgetConfig>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchWidgets = async () => {
            try {
                const params = userId ? { userId } : {};
<<<<<<< Updated upstream
                // 헤더 가져오기
                const headers = getAuthHeaders();
                // 전체 URL(Full URL)을 적어줍니다.
                // axios 요청에 headers 포함
                const response = await axios.get<WidgetDefinition[]>(`${BASE_URL}/api/widgets`, {
                    params,
                    headers // 여기에 헤더 추가
                });
                const widgetDefinitions = response.data;
=======
                const token = localStorage.getItem('accessToken');
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // widgetApi.ts와 동일하게
                    'X-User-Id': '1' // Temp ID
                };
>>>>>>> Stashed changes

                // 1. 시스템 위젯 (기존 로직)
                const sysReq = axios.get<WidgetDefinition[]>(`${BASE_URL}/api/widgets`, { params, headers }).catch(() => ({ data: [] }));

                // 2. 커스텀 위젯 (내 보관함) - 토큰이 있을 때만 요청
                let myReq;
                if (token) {
                    myReq = axios.get<any>(`${BASE_URL}/api/widgets/my`, {
                        headers,
                        params: { page: 0, size: 100 }
                    }).catch(() => ({ data: { content: [] } }));
                } else {
                    myReq = Promise.resolve({ data: { content: [] } });
                }

                const [sysRes, myRes] = await Promise.all([sysReq, myReq]);

                const widgetDefinitions = Array.isArray(sysRes.data) ? sysRes.data : [];
                const myWidgets = myRes.data?.content || [];

                const mergedRegistry: Record<string, WidgetConfig> = {};

                // 시스템 위젯 등록
                widgetDefinitions.forEach((def) => {
                    const Component = WIDGET_COMPONENT_MAP[def.widgetType];
                    if (Component) {
                        mergedRegistry[def.widgetType] = {
                            ...def,
                            component: Component,
                        };
                    }
                });

<<<<<<< Updated upstream
                // 타임머신 / 웰컴 위젯 등 강제 사이즈 설정 (백엔드 반영 전 임시)
                if (mergedRegistry['time-machine']) {
                    // 1x1 사이즈 추가
                    const currentSizes = mergedRegistry['time-machine'].validSizes || [];
                    if (!currentSizes.some(([w, h]) => w === 1 && h === 1)) {
                        mergedRegistry['time-machine'].validSizes = [[1, 1], ...currentSizes];
                    }
                }
=======
                // 🌟 커스텀 위젯 등록 (동적 키 생성)
                // WIDGET_COMPONENT_MAP['custom-block'] 활용
                const CustomWrapper = WIDGET_COMPONENT_MAP['custom-block'];

                myWidgets.forEach((w: any) => {
                    const uniqueKey = `custom-${w.id}`;
                    mergedRegistry[uniqueKey] = {
                        id: w.id,
                        widgetType: uniqueKey, // 고유 키
                        label: w.name,
                        description: `Custom Widget (${w.type})`,
                        category: 'My Saved',
                        keywords: ['custom', 'saved'],
                        defaultSize: w.defaultSize || '2x2', // 저장된 사이즈 사용
                        validSizes: [[1, 1], [1, 2], [2, 1], [2, 2], [2, 3], [3, 2], [4, 2]],
                        isSystem: false,
                        defaultProps: {
                            type: w.type, // 내부 실제 타입 (예: columns, text...)
                            content: w.content,
                            styles: w.styles
                        },
                        component: CustomWrapper || WIDGET_COMPONENT_MAP['custom-block'] // Wrapper 컴포넌트 연결
                    };
                });
>>>>>>> Stashed changes

                setRegistry(mergedRegistry);
            } catch (err) {
                console.error('Failed to fetch widget definitions:', err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWidgets();
    }, [userId, refreshTrigger]);

    return { registry, isLoading, error, refresh: () => setRefreshTrigger(prev => prev + 1) };
};