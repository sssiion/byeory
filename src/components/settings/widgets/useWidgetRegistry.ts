import { useState, useEffect } from 'react';
import axios from 'axios';
import type { WidgetConfig, WidgetDefinition } from "./type.ts";
import { WIDGET_COMPONENT_MAP } from "./componentMap.ts";

// 백엔드 주소 상수 정의
import { getMyWidgets } from './customwidget/widgetApi.ts';

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
                const headers = getAuthHeaders();

                // 1. 기본 위젯 정의 가져오기 (병렬 처리)
                const [standardRes, customRes] = await Promise.allSettled([
                    axios.get<WidgetDefinition[]>(`${BASE_URL}/api/widgets`, { params, headers }),
                    getMyWidgets() // 2. 커스텀 위젯 가져오기
                ]);


                // 데이터 병합용 객체
                const mergedRegistry: Record<string, WidgetConfig> = {};

                // A. 표준 위젯 처리
                if (standardRes.status === 'fulfilled' && Array.isArray(standardRes.value.data)) {
                    standardRes.value.data.forEach((def) => {
                        const Component = WIDGET_COMPONENT_MAP[def.widgetType];
                        if (Component) {
                            mergedRegistry[def.widgetType] = { ...def, component: Component };
                        }
                    });
                } else {
                    console.error('표준 위젯 로드 실패 또는 데이터 형식 오류');
                }

                // B. 커스텀 위젯 처리 (표준 위젯 기반)
                if (customRes.status === 'fulfilled' && Array.isArray(customRes.value)) {
                    customRes.value.forEach((item: any) => {
                        // 커스텀 위젯의 원본 타입(예: 'todo-list')으로 컴포넌트 찾기
                        const baseType = item.type;
                        const Component = WIDGET_COMPONENT_MAP[baseType];

                        // 컴포넌트가 존재하는 경우에만 등록
                        if (Component) {
                            // 고유 ID 생성 (예: 'custom-123')
                            const customType = `custom-${item.id}`;

                            mergedRegistry[customType] = {
                                id: item.id,
                                widgetType: customType, // 고유 식별자
                                label: item.name || '제목 없음',
                                description: `Custom ${baseType} widget`,
                                category: 'My Saved', // 커스텀 위젯 카테고리 고정
                                keywords: ['custom', baseType],
                                defaultSize: '1x1', // 기본값 (필요 시 layout에서 가져오기)
                                validSizes: [[1, 1], [1, 2], [2, 1], [2, 2]],
                                defaultProps: {
                                    content: item.content, // 저장된 콘텐츠
                                    styles: item.styles    // 저장된 스타일
                                },
                                isSystem: false,
                                thumbnail: undefined, // 썸네일이 있다면 item.thumbnail
                                component: Component,
                            };
                        }
                    });
                }

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