import React, { useRef } from 'react';

interface Props {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
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
        // 🔹 [핵심] 클릭한 대상이 입력창(textarea, input)인지 확인
        const isInput = ['INPUT', 'TEXTAREA'].includes(target.tagName);

        // 1. 입력창이면: 기본 동작(타이핑, 포커스)을 막지 않음 & 드래그 시작 안 함
        if (isInput) {
            onSelect();
            return; // 여기서 끝냄 (드래그 로직 실행 X)
        }

        // 2. 입력창이 아니면(스티커, 손잡이 등): 드래그 모드 진입 & 기본 동작 방지
        e.preventDefault();
        onSelect();

        if (e.button !== 0) return;

        const startX = e.clientX;
        const startY = e.clientY;
        const startDims = { x, y, w, h, r: rotation };

        isDraggingRef.current = false;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                isDraggingRef.current = true;
            }

            if (mode === 'drag') {
                onUpdate({ x: startDims.x + dx, y: startDims.y + dy });
            } else if (mode === 'resize') {
                onUpdate({ w: Math.max(50, startDims.w + dx), h: Math.max(50, startDims.h + dy) });
            } else if (mode === 'rotate') {
                onUpdate({ rotation: startDims.r + dx * 0.5 });
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
            // 본체 클릭 시: 입력창이 아니면 드래그 시도
            onMouseDown={(e) => handleMouseDown(e, 'drag')}
            onClick={handleClick}
            className={`absolute group select-none ${isSelected ? 'z-50' : 'cursor-pointer hover:ring-1 hover:ring-indigo-200'}`}
            style={{
                left: `${x}px`, top: `${y}px`,
                width: `${w}px`, height: `${h}px`,
                transform: `rotate(${rotation}deg)`,
                zIndex: isSelected ? 9999 : zIndex,
                touchAction: 'none'
            }}
        >
            <div className={`w-full h-full relative ${isSelected && !readOnly ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}>
                {children}

                {/* 컨트롤 핸들 (선택되었을 때만 표시) */}
                {isSelected && !readOnly && (
                    <>
                        {/* ✥ 이동 손잡이 (왼쪽 상단) - 텍스트 입력 중일 때 이걸로 이동 */}
                        <div
                            onMouseDown={(e) => handleMouseDown(e, 'drag')}
                            className="absolute -left-3 -top-3 w-6 h-6 bg-indigo-500 text-white rounded-full cursor-move z-50 shadow-sm flex items-center justify-center text-xs hover:scale-110 transition"
                            title="이동하려면 드래그하세요"
                        >
                            ✥
                        </div>

                        {/* ↻ 회전 핸들 (상단 중앙) */}
                        <div
                            onMouseDown={(e) => handleMouseDown(e, 'rotate')}
                            className="absolute left-1/2 -top-8 -translate-x-1/2 w-6 h-6 bg-white border-2 border-indigo-500 text-indigo-500 rounded-full flex items-center justify-center cursor-ew-resize shadow-sm text-xs z-50 hover:scale-110 transition"
                        >
                            ↻
                        </div>

                        {/* ↔ 리사이즈 핸들 (우측 하단) */}
                        <div
                            onMouseDown={(e) => handleMouseDown(e, 'resize')}
                            className="absolute -right-3 -bottom-3 w-6 h-6 bg-white border-2 border-indigo-500 rounded-full cursor-se-resize z-50 shadow-sm flex items-center justify-center text-[8px] text-indigo-500 hover:scale-110 transition"
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