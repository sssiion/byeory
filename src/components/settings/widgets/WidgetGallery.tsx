import {useWidgetRegistry} from "./useWidgetRegistry.ts";
import type {WidgetConfig} from "./type.ts";

// MainPage에서 넘겨주는 props 이름(onSelect, onEdit)과 일치시킵니다.
interface WidgetGalleryProps {
    onSelect: (widgetType: string) => void; // 문자열(ID)을 넘기도록 수정
    onEdit?: (data: WidgetConfig) => void;           // MainPage에서 onEdit도 넘겨주고 있으므로 추가
}

export const WidgetGallery = ({ onSelect, onEdit }: WidgetGalleryProps) => {
    // 훅을 통해 DB에서 위젯 정보를 가져옴
    const { registry, isLoading, error } = useWidgetRegistry();

    if (isLoading) {
        return <div className="p-4 text-center text-gray-500">위젯 목록을 불러오는 중...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">위젯 목록 로딩 실패</div>;
    }

    // registry 객체를 배열로 변환
    const widgets = Object.values(registry);

    return (
        <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 overflow-y-auto custom-scrollbar h-full pb-20">
            {widgets.map((widget) => (
                <div
                    key={widget.widgetType}
                    className="border border-[var(--border-color)] rounded-xl p-4 cursor-pointer hover:bg-[var(--bg-card-secondary)] transition-all hover:scale-[1.02] active:scale-95 bg-[var(--bg-card)] shadow-sm group"
                    onClick={() => {
                        // 🌟 중요: 객체 전체가 아니라 'widgetType'(문자열)만 넘겨야 MainPage의 addWidget이 정상 작동함
                        onSelect(widget.widgetType);
                    }}
                >
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-[var(--text-primary)]">{widget.label}</h3>

                        {/* 편집 가능한 위젯인 경우 Edit 버튼 표시 (onEdit이 있을 때만) */}
                        {onEdit && !widget.isSystem && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // 부모 클릭 방지
                                    onEdit(widget);
                                }}
                                className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-gray-600"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2 h-10">
                        {widget.description}
                    </p>

                    <div className="flex gap-2 text-xs flex-wrap">
                        <span className="px-2 py-1 bg-[var(--bg-card-secondary)] rounded text-[var(--text-secondary)] border border-[var(--border-color)]">
                            {widget.category}
                        </span>
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100 font-medium">
                            {widget.defaultSize}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};