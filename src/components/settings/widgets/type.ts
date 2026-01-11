// types/widget.ts

export interface WidgetLayout {
    x: number;
    y: number;
    w: number;
    h: number;
}
// 🌟 여기 추가! (사용자가 배치한 위젯 인스턴스)
export interface WidgetInstance {
    id: string;       // 개별 위젯의 고유 ID (예: 'w-123')
    type: string;     // 위젯 종류 (예: 'weather', 'todo-list') -> 백엔드의 widgetType과 매칭됨
    props?: any;      // 개별 설정값 (제목, 내용 등)
    layout: WidgetLayout; // 위치 정보
}
// 백엔드 DB에서 받아올 데이터 구조
export interface WidgetDefinition {
    id: number;
    widgetType: string;      // 예: 'weather', 'todo-list'
    label: string;           // 예: '날씨'
    description: string;
    category: string;
    keywords: string[];
    defaultSize: string;     // 예: '2x1'
    validSizes: number[][];  // 예: [[1, 1], [2, 1]]
    defaultProps: Record<string, any>;
    isSystem: boolean;
    thumbnail?: string; // 썸네일 경로
}

// 프론트엔드에서 최종적으로 사용할 구조 (DB 정보 + 실제 컴포넌트)
export interface WidgetConfig extends WidgetDefinition {
    component: React.ComponentType<any>; // Lazy Loaded Component
}