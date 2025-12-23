import React, { useRef } from 'react';

interface Props {
    id: string;
    x: number; // %
    y: number; // %
    w: number; // %
    h: number; // %
    rotation: number;
    zIndex: number;
    isSelected: boolean;
    readOnly: boolean;
    onSelect: () => void;
    onUpdate: (changes: any) => void;
    children: React.ReactNode;
}

const ResizableItem: React.FC<Props> = ({ id, x, y, w, h, rotation, zIndex, isSelected, readOnly, onSelect, onUpdate, children }) => {

    const isDraggingRef = useRef(false);

    const handleMouseDown = (e: React.MouseEvent, mode: 'drag' | 'resize' | 'rotate') => {
        if (readOnly) return;

        e.stopPropagation();

        const target = e.target as HTMLElement;
        // 입력창(textarea)인 경우 드래그 방지
        const isInput = ['INPUT', 'TEXTAREA'].includes(target.tagName);
        if (isInput) {
            onSelect();
            return;
        }

        e.preventDefault();
        onSelect();

        if (e.button !== 0) return;

        // 1. 부모 컨테이너 크기 정밀 계산 (getBoundingClientRect 사용)
        const element = e.currentTarget as HTMLElement;
        const parent = (element.offsetParent as HTMLElement) || document.body;
        const parentRect = parent.getBoundingClientRect();
        const parentW = parentRect.width;
        const parentH = parentRect.height;

        // 2. [핵심 수정] "화면에 그려진 크기"가 아니라 "저장된 데이터(%)"를 기준으로 시작 픽셀을 계산합니다.
        // 이렇게 해야 클릭 순간에 크기가 튀지 않습니다.
        const startState = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            // 저장된 %를 픽셀로 정확히 환산
            wPx: (w / 100) * parentW,
            hPx: (h / 100) * parentH,
            // 위치도 데이터 기반 환산
            xPx: (x / 100) * parentW,
            yPx: (y / 100) * parentH,
            rotation: rotation,
            parentW,
            parentH
        };

        isDraggingRef.current = false;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startState.mouseX;
            const dy = moveEvent.clientY - startState.mouseY;

            if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                isDraggingRef.current = true;
            }

            if (mode === 'drag') {
                // 이동: (기존위치Px + 이동량Px) / 부모크기 * 100
                const newXPx = startState.xPx + dx;
                const newYPx = startState.yPx + dy;

                onUpdate({
                    x: (newXPx / startState.parentW) * 100,
                    y: (newYPx / startState.parentH) * 100
                });

            } else if (mode === 'resize') {
                // 크기: (기존크기Px + 이동량Px) / 부모크기 * 100
                const newWidthPx = Math.max(30, startState.wPx + dx); // 최소 30px
                const newHeightPx = Math.max(30, startState.hPx + dy);

                onUpdate({
                    w: (newWidthPx / startState.parentW) * 100,
                    h: (newHeightPx / startState.parentH) * 100
                });

            } else if (mode === 'rotate') {
                onUpdate({ rotation: startState.rotation + dx * 0.5 });
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isDraggingRef.current) {
            onSelect();
        }
    };

    return (
        <div
            onMouseDown={(e) => handleMouseDown(e, 'drag')}
            onClick={handleClick}
            className={`absolute group select-none ${isSelected ? 'z-50' : 'cursor-pointer hover:ring-1 hover:ring-indigo-200'}`}
            style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${w}%`,
                height: `${h}%`,
                transform: `rotate(${rotation}deg)`,
                zIndex: isSelected ? 9999 : zIndex,
                touchAction: 'none'
            }}
        >
            <div className={`w-full h-full relative ${isSelected && !readOnly ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}>
                {children}

                {isSelected && !readOnly && (
                    <>
                        {/* 이동 핸들 (좌측 상단) */}
                        <div
                            onMouseDown={(e) => handleMouseDown(e, 'drag')}
                            className="absolute -left-3 -top-3 w-6 h-6 bg-indigo-500 text-white rounded-full cursor-move z-50 shadow-sm flex items-center justify-center text-xs hover:scale-110 transition"
                            title="이동"
                        >
                            ✥
                        </div>
                        {/* 회전 핸들 (상단 중앙) */}
                        <div
                            onMouseDown={(e) => handleMouseDown(e, 'rotate')}
                            className="absolute left-1/2 -top-8 -translate-x-1/2 w-6 h-6 bg-white border-2 border-indigo-500 text-indigo-500 rounded-full flex items-center justify-center cursor-ew-resize shadow-sm text-xs z-50 hover:scale-110 transition"
                            title="회전"
                        >
                            ↻
                        </div>
                        {/* 리사이즈 핸들 (우측 하단) */}
                        <div
                            onMouseDown={(e) => handleMouseDown(e, 'resize')}
                            className="absolute -right-3 -bottom-3 w-6 h-6 bg-white border-2 border-indigo-500 rounded-full cursor-se-resize z-50 shadow-sm flex items-center justify-center text-[8px] text-indigo-500 hover:scale-110 transition"
                            title="크기 조절"
                        >
                            ↔
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResizableItem;