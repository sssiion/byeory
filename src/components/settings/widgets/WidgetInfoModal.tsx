import React from 'react';
import { X, Plus } from 'lucide-react';
import BlockRenderer from "./customwidget/components/BlockRenderer.tsx";
import { type WidgetBlock } from "./customwidget/types.ts";

// Helper function (Duplicated from WidgetGallery, can be moved to utils if desired, but small enough here)
const renderWidgetPreview = (widgetData: any) => {
    const block: WidgetBlock = {
        id: String(widgetData.id || 'preview'),
        type: widgetData.type,
        content: widgetData.content || {},
        styles: widgetData.styles || {}
    };

    return (
        <div className="w-full h-full overflow-hidden transform scale-95 origin-center pointer-events-none">
            <BlockRenderer
                block={block}
                selectedBlockId={null}
                onSelectBlock={() => { }}
                onRemoveBlock={() => { }}
                activeContainer={null as any}
                onSetActiveContainer={() => { }}
                onUpdateBlock={() => { }}
            />
        </div>
    );
};

export interface WidgetInfoProps {
    widget: {
        type: string;
        label: string;
        category: string;
        description?: string;
        defaultSize?: string;
        validSizes?: number[][]; // Added validSizes
        isSaved?: boolean;
        data?: any;
    };
    onClose: () => void;
    onAction?: () => void; // Optional action button (e.g., "Add")
    actionLabel?: string;
    showAction?: boolean;
}

const CATEGORY_TRANSLATIONS: Record<string, string> = {
    'My Saved': '📂 내 보관함 (Saved)',
    'System': '시스템',
    'Data & Logic': '데이터 & 로직',
    'Diary & Emotion': '다이어리 & 감정',
    'Utility': '유틸리티',
    'Decoration': '꾸미기',
    'Collection': '수집품',
    'Interactive': '인터랙티브',
    'Tool': '도구',
    'Global': '글로벌 효과',
    'Uncategorized': '기타',
};

export const WidgetInfoModal: React.FC<WidgetInfoProps> = ({
    widget,
    onClose,
    onAction,
    actionLabel = "위젯 추가하기",
    showAction = true
}) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-[var(--bg-modal)] rounded-2xl shadow-xl border border-[var(--border-color)] p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{widget.label}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-[var(--bg-card-secondary)] text-[var(--icon-color)]">
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="aspect-video bg-[var(--bg-card-secondary)] rounded-lg flex items-center justify-center overflow-hidden border border-[var(--border-color)] p-2">
                        {widget.isSaved ? (
                            <div className="w-full h-full transform scale-95 flex items-center justify-center">
                                {renderWidgetPreview(widget.data)}
                            </div>
                        ) : (
                            <img
                                src={`/thumbnails/${widget.type}.png`}
                                className="w-full h-full object-contain"
                                alt={widget.label}
                                onError={(e) => e.currentTarget.style.display = 'none'}
                            />
                        )}
                    </div>

                    <div className="text-sm text-[var(--text-secondary)] px-1">
                        {widget.description}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-[var(--bg-card-secondary)] rounded-lg p-2.5">
                            <span className="text-[10px] text-[var(--text-secondary)] block mb-0.5">Category</span>
                            <span className="text-xs font-medium text-[var(--text-primary)]">
                                {CATEGORY_TRANSLATIONS[widget.category] || widget.category}
                            </span>
                        </div>
                        <div className="bg-[var(--bg-card-secondary)] rounded-lg p-2.5">
                            <span className="text-[10px] text-[var(--text-secondary)] block mb-0.5">
                                {widget.isSaved ? "Saved Date" : "Available Sizes"}
                            </span>

                            {widget.isSaved ? (
                                <span className="text-xs font-medium text-[var(--text-primary)] font-mono">
                                    {typeof widget.description === 'string' ? widget.description.replace('저장된 날짜: ', '') : '-'}
                                </span>
                            ) : (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {(widget.validSizes || [[1, 1]]).map(([w, h], idx) => (
                                        <span
                                            key={idx}
                                            className="px-1.5 py-0.5 bg-[var(--bg-card)] text-[var(--btn-bg)] rounded border border-[var(--border-color)] text-[10px] font-bold shadow-sm"
                                        >
                                            {w}x{h}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {showAction && onAction && (
                        <button
                            onClick={() => {
                                onAction();
                                onClose();
                            }}
                            className="w-full py-2.5 rounded-xl bg-[var(--btn-bg)] hover:bg-[var(--btn-hover)] text-[var(--btn-text)] font-medium text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={16} /> {actionLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
