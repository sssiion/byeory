import React, { Suspense } from 'react';
import { useDragLayer } from 'react-dnd';
import { WIDGET_COMPONENT_MAP } from "./componentMap.ts";
// 1. 기존 Registry import 제거하고, ComponentMap을 import 하세요.

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
    let WidgetComponent = WIDGET_COMPONENT_MAP[item.type];

    // 🌟 커스텀 위젯인 경우 (custom-123 등) 맵에 없을 수 있으므로 custom-block으로 대체
    if (!WidgetComponent && (item.type === 'custom-block' || String(item.type).startsWith('custom-'))) {
        WidgetComponent = WIDGET_COMPONENT_MAP['custom-block'];
    }

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
                        /* 드래그 중인 미리보기 */
                        <div style={{
                            // 🌟 캡쳐된 크기(initialWidth)가 있으면 사용하고, 없으면 그리드 단위(w * 25vw or pixel)로 계산
                            width: item.initialWidth ?? (item.w * (window.innerWidth < 768 ? window.innerWidth / 2 : 200)),
                            height: item.initialHeight ?? (item.h * (window.innerWidth < 768 ? window.innerWidth / 2 : 200))
                        }}>
                            <WidgetComponent {...item.props} />
                        </div>
                    ) : (
                        /* 컴포넌트를 못 찾았을 때의 폴백 */
                        <div className="bg-gray-200 p-2 rounded">
                            {item.label || 'Unknown Widget'}
                        </div>
                    )}
                </Suspense>
            </div>
        </div>
    );
};