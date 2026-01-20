import React, { useRef, useState, useEffect } from 'react';
import type { FloatingText } from '../../types';

interface Props {
    item: FloatingText;
    scale: number; // Global canvas scale for event correction
    isFocusing: boolean;
    readOnly: boolean;
    onUpdate: (changes: Partial<FloatingText>) => void;
    onSelect: () => void;
}

const StickyNote: React.FC<Props> = ({ item, scale, isFocusing, readOnly, onUpdate, onSelect }) => {
    const [imageRef, setImageRef] = useState<{ w: number, h: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0, containerW: 0, containerH: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Transform Data
    const transform = item.imageTransform || { x: 0, y: 0, scale: 1 };
    const fitMode = item.imageFit || 'cover';

    // Image Load Handler
    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        setImageRef({ w: naturalWidth, h: naturalHeight });
    };

    // Refs for event handlers to avoid dependency loops
    const transformRef = useRef(transform);
    const scaleRef = useRef(scale);
    const imageInfoRef = useRef(imageRef);
    const fitModeRef = useRef(fitMode);

    useEffect(() => {
        transformRef.current = transform;
        scaleRef.current = scale;
        imageInfoRef.current = imageRef;
        fitModeRef.current = fitMode;
    }, [transform, scale, imageRef, fitMode]);

    // Calculate Clamped Transform
    const getClampedTransform = (current: { x: number, y: number, scale: number }, containerW: number, containerH: number) => {
        const s = current.scale;

        // Use refs for calculation to ensure stability if called from event
        // But here we are passed 'current' which is the *proposed* transform
        // We need image dimensions to calculate limits
        const imgInfo = imageInfoRef.current;
        const mode = fitModeRef.current;

        let baseW = containerW;
        let baseH = containerH;

        if (imgInfo) {
            const containerRatio = containerW / containerH;
            const imageRatio = imgInfo.w / imgInfo.h;

            if (mode === 'cover') {
                if (imageRatio > containerRatio) {
                    baseH = containerH;
                    baseW = containerH * imageRatio;
                } else {
                    baseW = containerW;
                    baseH = containerW / imageRatio;
                }
            } else {
                // Contain mode
                if (imageRatio > containerRatio) {
                    baseW = containerW;
                    baseH = containerW / imageRatio;
                } else {
                    baseH = containerH;
                    baseW = containerH * imageRatio;
                }
            }
        }

        const rW = baseW * s;
        const rH = baseH * s;

        let maxX = 0;
        let maxY = 0;

        // Only allow panning if image is larger than container in that dimension
        if (rW > containerW) {
            maxX = (rW - containerW) / 2;
        }
        if (rH > containerH) {
            maxY = (rH - containerH) / 2;
        }

        // Strict clamping (No buffer)
        let { x, y } = current;

        if (x > maxX) x = maxX;
        if (x < -maxX) x = -maxX;
        if (y > maxY) y = maxY;
        if (y < -maxY) y = -maxY;

        return { x, y, scale: s };
    };

    // Panning Handler
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isFocusing) return;
        e.stopPropagation();
        e.preventDefault();
        setIsDragging(true);

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            initialX: transform.x,
            initialY: transform.y,
            containerW: rect.width,
            containerH: rect.height
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !isFocusing) return;
            e.preventDefault();

            const currentScale = scaleRef.current;
            const currentTransform = transformRef.current;

            const dx = (e.clientX - dragStartRef.current.x) / currentScale;
            const dy = (e.clientY - dragStartRef.current.y) / currentScale;

            const targetX = dragStartRef.current.initialX + dx;
            const targetY = dragStartRef.current.initialY + dy;

            const currentContainerW = containerRef.current?.offsetWidth || 200;
            const currentContainerH = containerRef.current?.offsetHeight || 200;

            const clampedClean = getClampedTransform(
                { x: targetX, y: targetY, scale: currentTransform.scale },
                currentContainerW,
                currentContainerH
            );

            onUpdate({ imageTransform: clampedClean });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isFocusing]); // dependency removed for transform/scale


    // Styles reconstruction
    const hasBgImage = !!item.styles.backgroundImage;

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative overflow-hidden"
            style={{ borderRadius: 'inherit' }} // Inherit rounded corners
            onClick={(e) => {
                if (isFocusing) {
                    e.stopPropagation();
                }
            }}
        >
            {/* Background Image Layer */}
            {hasBgImage && (
                <div
                    className={`absolute inset-0 z-0 ${isFocusing ? 'cursor-move' : ''}`}
                    onMouseDown={handleMouseDown}
                >
                    <img
                        src={item.styles.backgroundImage}
                        onLoad={handleImageLoad}
                        alt=""
                        className={`w-full h-full pointer-events-none ${fitMode === 'contain' ? 'object-contain' : 'object-cover'}`}
                        style={{
                            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                            transition: isDragging ? 'none' : 'transform 0.1s'
                        }}
                    />
                </div>
            )}

            {/* Text Layer */}
            <textarea
                value={item.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
                className={`w-full h-full bg-transparent outline-none resize-none p-2 overflow-hidden relative z-10 ${isFocusing ? 'pointer-events-none opacity-50' : 'cursor-text'}`}
                style={{
                    fontFamily: item.styles.fontFamily,
                    fontSize: item.styles.fontSize,
                    fontWeight: item.styles.fontWeight || 'normal',
                    textAlign: item.styles.textAlign as any,
                    color: item.styles.color,
                    backgroundColor: 'transparent',
                    fontStyle: item.styles.fontStyle || 'normal',
                    textDecoration: item.styles.textDecoration || 'none',
                }}
                readOnly={readOnly}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!isFocusing) {
                        onSelect();
                    }
                }}
            />
            {/* If background color is set AND background image is not, show color. 
                Wait, if 'backgroundImage' is in styles, we render img. 
                Does 'backgroundColor' overlay or underlay? 
                Usually `backgroundColor` is behind `backgroundImage`.
                StickyNote root div could have the background color?
            */}
            {!hasBgImage && item.styles.backgroundColor && (
                <div className="absolute inset-0 -z-10" style={{ backgroundColor: item.styles.backgroundColor }} />
            )}
            {/* If BOTH exist (transparent image?), color should be behind image. 
                 The root div logic handles this if we apply style there.
                 But ResizableItem container might control this. 
                 Let's put backgroundColor on the root div of StickyNote.
             */}
        </div>
    );
};

export default StickyNote;
