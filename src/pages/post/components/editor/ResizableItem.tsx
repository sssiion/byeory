import React, { useRef, useState, useEffect } from 'react';

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

const ResizableItem: React.FC<Props> = ({
    x, y, w, h, rotation, zIndex, isSelected, readOnly, onSelect, onUpdate, children
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isRotating, setIsRotating] = useState(false);

    // 드래그 시작 시점의 상태 저장
    const startPos = useRef({
        startX: 0, startY: 0,
        initialX: 0, initialY: 0,
        initialW: 0, initialH: 0,
        initialRotate: 0,
        centerX: 0, centerY: 0 // 회전 중심점
    });

    const handleMouseDown = (e: React.MouseEvent) => {
        if (readOnly) return;
        e.stopPropagation(); // 드래그 시작 시 배경 선택 방지
        onSelect();
        setIsDragging(true);
        startPos.current = {
            ...startPos.current,
            startX: e.clientX,
            startY: e.clientY,
            initialX: x,
            initialY: y
        };
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault(); // 텍스트 선택 등 기본 동작 방지
        setIsResizing(true);
        startPos.current = {
            ...startPos.current,
            startX: e.clientX,
            startY: e.clientY,
            initialW: w,
            initialH: h
        };
    };

    const handleRotateStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsRotating(true);

        // 아이템의 중심점 계산 (회전 각도 계산용)
        const rect = (e.target as HTMLElement).closest('.group')?.getBoundingClientRect();
        if (rect) {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            startPos.current = {
                ...startPos.current,
                centerX, centerY,
                initialRotate: rotation
            };
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const deltaX = e.clientX - startPos.current.startX;
                const deltaY = e.clientY - startPos.current.startY;
                onUpdate({
                    x: startPos.current.initialX + deltaX,
                    y: startPos.current.initialY + deltaY
                });
            } else if (isResizing) {
                const deltaX = e.clientX - startPos.current.startX;
                const deltaY = e.clientY - startPos.current.startY;

                // 가로(w) 뿐만 아니라 세로(h)도 같이 변경되도록 수정
                onUpdate({
                    w: Math.max(30, startPos.current.initialW + deltaX),
                    h: Math.max(30, startPos.current.initialH + deltaY)
                });
            } else if (isRotating) {
                const { centerX, centerY } = startPos.current;
                // 중심점과 현재 마우스 위치 사이의 각도 계산 (atan2)
                const radians = Math.atan2(e.clientY - centerY, e.clientX - centerX);
                const degrees = radians * (180 / Math.PI);

                // 마우스 위치에 따라 직관적으로 회전하도록 +90도 보정
                onUpdate({ rotation: degrees + 90 });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            setIsRotating(false);
        };

        if (isDragging || isResizing || isRotating) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, isRotating, onUpdate]);

    return (
        <div
            className={`absolute select-none group `}
            style={{
                left: `${x}px`,
                top: `${y}px`,
                width: `${w}px`,
                height: `${h}px`, // 높이 값 적용
                transform: `rotate(${rotation}deg)`,
                zIndex: zIndex,
                cursor: readOnly ? 'default' : (isDragging ? 'grabbing' : 'grab'),
                touchAction: 'none' // 모바일 터치 대응
            }}
            onMouseDown={handleMouseDown}
            // 클릭 이벤트가 배경(EditorCanvas)으로 전파되어 '선택 해제' 되는 것을 막음
            onClick={(e) => e.stopPropagation()}
        >
            <div className={`w-full h-full relative ${isSelected && !readOnly ? 'ring-2 ring-indigo-500' : ''}`}>
                {children}

                {isSelected && !readOnly && (
                    <>
                        {/* 크기 조절 핸들 (우측 하단) */}
                        <div
                            onMouseDown={handleResizeStart}
                            className="absolute -bottom-3 -right-3 w-6 h-6 bg-white border-2 border-indigo-500 rounded-full cursor-se-resize z-50 shadow-md hover:scale-110 transition"
                            title="크기 조절"
                        />
                        {/* 회전 핸들 (상단 중앙) */}
                        <div
                            onMouseDown={handleRotateStart}
                            className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-indigo-500 rounded-full cursor-grab z-50 flex items-center justify-center shadow-md hover:bg-indigo-50 hover:scale-110 transition"
                            title="회전"
                        >
                            <span className="text-[10px] font-bold text-indigo-700">↻</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResizableItem;