import { useState, useEffect } from 'react';
import axios from 'axios';
import type { WidgetConfig, WidgetDefinition } from "./type.ts";
import { WIDGET_COMPONENT_MAP } from "./componentMap.ts";

// 백엔드 주소 상수 정의
const BASE_URL = 'http://localhost:8080';
const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};
export const useWidgetRegistry = (userId?: number) => {
    const [registry, setRegistry] = useState<Record<string, WidgetConfig>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const fetchWidgets = async () => {
            try {
                const params = userId ? { userId } : {};
                // 헤더 가져오기
                const headers = getAuthHeaders();
                // 전체 URL(Full URL)을 적어줍니다.
                // axios 요청에 headers 포함
                const response = await axios.get<WidgetDefinition[]>(`${BASE_URL}/api/widgets`, {
                    params,
                    headers // 여기에 헤더 추가
                });
                const widgetDefinitions = response.data;

                // 방어 코드 (배열 체크)
                if (!Array.isArray(widgetDefinitions)) {
                    console.error('서버 응답이 배열이 아닙니다:', widgetDefinitions);
                    setRegistry({});
                    setIsLoading(false);
                    return;
                }

                // 데이터 병합 로직
                const mergedRegistry: Record<string, WidgetConfig> = {};

                widgetDefinitions.forEach((def) => {
                    const Component = WIDGET_COMPONENT_MAP[def.widgetType];

                    if (Component) {
                        mergedRegistry[def.widgetType] = {
                            ...def,
                            component: Component,
                        };
                    }
                });

                // 타임머신 / 웰컴 위젯 등 강제 사이즈 설정 (백엔드 반영 전 임시)
                if (mergedRegistry['time-machine']) {
                    // 1x1 사이즈 추가
                    const currentSizes = mergedRegistry['time-machine'].validSizes || [];
                    if (!currentSizes.some(([w, h]) => w === 1 && h === 1)) {
                        mergedRegistry['time-machine'].validSizes = [[1, 1], ...currentSizes];
                    }
                }

                setRegistry(mergedRegistry);
            } catch (err) {
                console.error('Failed to fetch widget definitions:', err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWidgets();
    }, [userId]);

    return { registry, isLoading, error };
};