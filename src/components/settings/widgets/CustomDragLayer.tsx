import React, { Suspense } from 'react';
import { useDragLayer } from 'react-dnd';
import { WIDGET_COMPONENT_MAP } from "./componentMap.ts";
// 1. 기존 Registry import 제거하고, ComponentMap을 import 하세요.

// Safe direct imports for preview (No dnd-kit dependency)
import DatabaseWidget from './customwidget/components/Rendercomponent/DatabaseWidget';
import MovieTicketWidget from './customwidget/components/Rendercomponent/MovieTicketWidget';
import LinkBookmarkWidget from './customwidget/components/Rendercomponent/LinkBookmarkWidget';

const layerStyles: React.CSSProperties = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
};

function getItemStyles(initialOffset: any, currentOffset: any) {
    if (!initialOffset || !currentOffset) {
        return { display: 'none' };
    }
    let { x, y } = currentOffset;
    const transform = `translate(${x}px, ${y}px)`;
    return {
        transform,
        WebkitTransform: transform,
    };
}

export const CustomDragLayer = () => {
    const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
        initialOffset: monitor.getInitialSourceClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
    }));

    if (!isDragging) {
        return null;
    }

    // 2. item.type(위젯 타입)을 이용해 맵에서 컴포넌트를 찾습니다.
    // (드래그 아이템 구조에 따라 item.type 혹은 item.widgetType 일 수 있음)
    const WidgetComponent = WIDGET_COMPONENT_MAP[item.type];

    // Helper to render custom widget safe preview
    const renderCustomPreview = () => {
        // Direct type match
        if (item.type === 'database') return <DatabaseWidget block={item} onUpdateBlock={() => { }} />;
        if (item.type === 'movie-ticket') return <MovieTicketWidget block={item} onUpdateBlock={() => { }} />;
        if (item.type === 'link-bookmark') return <LinkBookmarkWidget block={item} onUpdateBlock={() => { }} />;

        // Toggle/Accordion/etc - tricky to render safe if they depend on BlockRenderer context?
        // Let's rely on label if complex.

        // If it's a custom-block (composite)
        if (item.type === 'custom-block' && item.content?.children) {
            // Try to see if it's a wrapper around a single known widget
            if (item.content.children.length === 1) {
                const child = item.content.children[0];
                if (child.type === 'database') return <DatabaseWidget block={child} onUpdateBlock={() => { }} />;
                if (child.type === 'movie-ticket') return <MovieTicketWidget block={child} onUpdateBlock={() => { }} />;
                if (child.type === 'link-bookmark') return <LinkBookmarkWidget block={child} onUpdateBlock={() => { }} />;
            }

            // Generic Composite Preview
            return (
                <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-indigo-200 shadow-xl opacity-90 h-full w-full">
                    <span className="font-bold text-indigo-600 text-lg mb-1">{item.label || item.name || 'Custom Widget'}</span>
                    <span className="text-xs text-gray-400">Composite Widget</span>
                </div>
            )
        }

        // Fallback for other custom types not in map
        return (
            <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-indigo-200 shadow-xl opacity-90 h-full w-full">
                <span className="font-bold text-gray-700 text-md">{item.label || item.name || 'Custom Widget'}</span>
                <span className="text-xs text-gray-400">{item.type}</span>
            </div>
        )
    };

    // Check if it's a known custom type or custom-block
    const isCustom = !WidgetComponent && (
        item.type === 'custom-block' ||
        ['database', 'movie-ticket', 'link-bookmark'].includes(item.type) ||
        (typeof item.type === 'string' && item.type.startsWith('custom-'))
    );

    return (
        <div style={layerStyles}>
            <div style={getItemStyles(initialOffset, currentOffset)}>
                {/* 3. Lazy 컴포넌트이므로 Suspense가 필수입니다. */}
                <Suspense fallback={<div className="bg-white/50 w-full h-full" />}>
                    {itemType === 'MENU_ITEM' ? (
                        <div className="flex items-center justify-center bg-[var(--bg-card)] rounded-lg shadow-lg border border-[var(--border-color)] opacity-90"
                            style={{
                                width: item.initialWidth,
                                height: item.initialHeight,
                            }}
                        >
                            <span className="font-bold theme-text-primary text-lg">{item.label}</span>
                        </div>
                    ) : WidgetComponent ? (
                        /* 드래그 중인 미리보기는 보통 스타일을 좀 다르게 주거나 그대로 보여줍니다 */
                        <div style={{
                            width: item.initialWidth || item.w * 100, // 캡처된 크기 사용, 없으면 기존 로직 폴백
                            height: item.initialHeight || item.h * 100
                        }}>
                            <WidgetComponent {...item.props} />
                        </div>
                    ) : isCustom ? (
                        /* Safe Custom Preview */
                        <div style={{
                            width: item.initialWidth || (item.layout?.w ? (typeof item.layout.w === 'number' ? item.layout.w : 200) : 200),
                            height: item.initialHeight || (item.layout?.h ? (typeof item.layout.h === 'number' ? item.layout.h : 100) : 100),
                            fontSize: '12px'
                        }}>
                            {renderCustomPreview()}
                        </div>
                    ) : (
                        /* 컴포넌트를 못 찾았을 때의 폴백 */
                        <div className="bg-gray-200 p-2 rounded">
                            {item.label || item.name || 'Unknown Widget'}
                        </div>
                    )}
                </Suspense>
            </div>
        </div>
    );
};