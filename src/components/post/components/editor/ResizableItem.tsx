import React, { useRef, useState, useEffect } from 'react';
import { Move } from 'lucide-react'; // ✨ Import Move Icon

interface Props {
    id: string;
    x: number | string;
    y: number | string;
    w: number | string;
    h: number | string;
    rotation: number;
    zIndex: number;
    isSelected: boolean;
    readOnly: boolean;
    onSelect: (isMulti?: boolean) => void;
    onUpdate: (changes: any) => void;
    onDoubleClick?: () => void; // ✨ Double Click Support
    opacity?: number;
    children: React.ReactNode;
}

const ResizableItem: React.FC<Props> = ({
    id, x, y, w, h, rotation, zIndex, opacity = 1, isSelected, readOnly, onSelect, onUpdate, onDoubleClick, children
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    // 드래그 시작 시점의 상태 저장
    const startPos = useRef({
        startX: 0, startY: 0,
        initialX: 0, initialY: 0,
        initialW: 0, initialH: 0,
        initialRotate: 0,
        centerX: 0, centerY: 0 // 회전 중심점
    });

    // ✨ Modified: Only trigger drag from the Move Handle
    const handleMoveStart = (e: React.MouseEvent) => {
        if (readOnly) return;

        // ✨ Check if the target is an interactive element (e.g., input, textarea, button)
        const target = e.target as HTMLElement;
        if (['textarea', 'input', 'button', 'select'].includes(target.tagName.toLowerCase())) {
            return;
        }

        e.stopPropagation();
        e.preventDefault();
        onSelect(e.shiftKey); // ✨ Pass shift key
        setIsDragging(true);

        const currentX = elementRef.current?.offsetLeft || 0;
        const currentY = elementRef.current?.offsetTop || 0;

        startPos.current = {
            ...startPos.current,
            startX: e.clientX,
            startY: e.clientY,
            initialX: currentX,
            initialY: currentY
        };
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);

        const currentW = elementRef.current?.offsetWidth || 0;
        const currentH = elementRef.current?.offsetHeight || 0;

        startPos.current = {
            ...startPos.current,
            startX: e.clientX,
            startY: e.clientY,
            initialW: currentW,
            initialH: currentH
        };
    };

    const handleRotateStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsRotating(true);

        const rect = elementRef.current?.getBoundingClientRect();
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

                onUpdate({
                    w: Math.max(30, startPos.current.initialW + deltaX),
                    h: Math.max(30, startPos.current.initialH + deltaY)
                });
            } else if (isRotating) {
                const { centerX, centerY } = startPos.current;
                const radians = Math.atan2(e.clientY - centerY, e.clientX - centerX);
                const degrees = radians * (180 / Math.PI);
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
            ref={elementRef}
            id={id} // ✨ Added ID for selection logic
            className={`absolute group`}
            style={{
                left: typeof x === 'number' ? `${x}px` : x,
                top: typeof y === 'number' ? `${y}px` : y,
                width: typeof w === 'number' ? `${w}px` : w,
                height: typeof h === 'number' ? `${h}px` : h,
                transform: `rotate(${rotation}deg)`,
                zIndex: zIndex,
                opacity: opacity, // ✨ Apply Opacity
                // ✨ Changed cursor logic: default for content, grabbing only when dragging
                cursor: readOnly ? 'default' : 'default',
                touchAction: 'none'
            }}
            // ✨ Body Drag Enabled
            onMouseDown={handleMoveStart}
            // ✨ Click selects the item, but doesn't start drag
            onClick={(e) => {
                // If dragging happened, drag handler handled everything.
                // We keep this just in case click didn't trigger drag (e.g. filtered element)
                // but if filtered element (button), we probably want native click.

                // If it wasn't filtered, handleMoveStart stopped propagation.
                // So this onClick only fires if handleMoveStart allowed it bubbling?
                // No, handleMoveStart calls stopPropagation.
                // So this onClick is dead code for draggable items?
                // Let's keep it safe:
                e.stopPropagation();
                onSelect(e.shiftKey);
            }}
        >
            <div className={`w-full h-full relative ${isSelected && !readOnly ? 'ring-2 ring-indigo-500' : ''}`}>
                {/* ✨ Enable pointer events for children */}
                <div className="w-full h-full pointer-events-auto">
                    {children}
                </div>

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
                            className="absolute -top-8 left-1/2 -translate-x-[20px] w-6 h-6 bg-white border-2 border-indigo-500 rounded-full cursor-grab z-50 flex items-center justify-center shadow-md hover:bg-indigo-50 hover:scale-110 transition"
                            title="회전"
                        >
                            <span className="text-[10px] font-bold text-indigo-700">↻</span>
                        </div>

                        {/* ✨ 이동 핸들 (회전 핸들 옆) */}
                        <div
                            onMouseDown={handleMoveStart}
                            className="absolute -top-8 left-1/2 translate-x-[6px] w-6 h-6 bg-indigo-500 text-white border-2 border-indigo-500 rounded-full cursor-move z-50 flex items-center justify-center shadow-md hover:bg-indigo-600 hover:scale-110 transition"
                            title="이동"
                        >
                            <Move size={12} strokeWidth={3} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResizableItem;