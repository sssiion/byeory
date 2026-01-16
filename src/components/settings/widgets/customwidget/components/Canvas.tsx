import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, Play, Pause, Plus, Trash2, Clock } from 'lucide-react'; // [NEW] Added Image icon
import type { WidgetBlock, WidgetSize, ContainerLocation, WidgetDecoration, WidgetScene } from '../types';
import { getSvgPathFromPoints } from '../utils';
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    pointerWithin,
    useDroppable,
    DragOverlay,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { snapCenterToCursor } from '@dnd-kit/modifiers';

// 저장해두신 SortableBlockItem 임포트
import SortableBlockItem from './Rendercomponent/SortableBlockItem';
import BlockRenderer from './BlockRenderer';

interface Props {
    blocks: WidgetBlock[];
    currentSize: WidgetSize;
    selectedBlockId: string | null;
    onSelectBlock: (id: string | null) => void;
    onRemoveBlock: (id: string) => void;

    activeContainer: ContainerLocation;
    onSetActiveContainer: (loc: ContainerLocation) => void;
    onUpdateBlock: (id: string, updates: any) => void;
    onDragEnd: (event: DragEndEvent) => void;
    onDragOver: (event: DragOverEvent) => void;

    // Decorations
    decorations: WidgetDecoration[];
    selectedDecorationId: string | null;
    onSelectDecoration: (id: string | null) => void;
    updateDecoration: (id: string, updates: Partial<WidgetDecoration>) => void;
    // 🌟 [NEW] 설정 패널 열기 콜백
    onOpenSettings?: () => void;

    // 🌟 [NEW] Scene Props
    scenes?: WidgetScene[];
    currentSceneIndex?: number;
    onAddScene?: () => void;
    onChangeScene?: (index: number) => void;
    onUpdateSceneDuration?: (index: number, duration: number) => void;
    onDeleteScene?: (index: number) => void;
}

const Canvas: React.FC<Props> = (props) => {
    const {
        blocks,
        currentSize,
        selectedBlockId,
        onSelectBlock,
        onRemoveBlock,
        activeContainer,
        onSetActiveContainer,
        onUpdateBlock,
        onDragEnd,
        onDragOver,
        // Decorations
        decorations,
        selectedDecorationId,
        onSelectDecoration,
        updateDecoration, // [NEW] Needed for drag
        onOpenSettings, // 🌟 [NEW]
        // Scene Props
        scenes,
        currentSceneIndex = 0,
        onAddScene,
        onChangeScene,
        onUpdateSceneDuration,
        onDeleteScene
    } = props;

    // 🌟 Playback State
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (isPlaying && scenes && scenes.length > 1) {
            const currentDuration = scenes[currentSceneIndex].duration || 1;
            timer = setTimeout(() => {
                const nextIndex = (currentSceneIndex + 1) % scenes.length;
                onChangeScene?.(nextIndex);
            }, currentDuration * 1000);
        }
        return () => clearTimeout(timer);
    }, [isPlaying, scenes, currentSceneIndex, onChangeScene]);

    const [activeId, setActiveId] = useState<string | null>(null);

    // 🌟 Helper to find active block for DragOverlay
    const findBlock = (id: string, items: WidgetBlock[]): WidgetBlock | undefined => {
        for (const item of items) {
            if (item.id === id) return item;
            if (item.type === 'columns' && item.content.layout) {
                for (const col of item.content.layout) {
                    const found = findBlock(id, col);
                    if (found) return found;
                }
            }
            if (item.type === 'custom-block' && item.content.children) {
                const found = findBlock(id, item.content.children);
                if (found) return found;
            }
        }
        return undefined;
    };

    // 🌟 데코레이션 드래그 로직
    const dragRef = useRef<{
        id: string | null;
        startX: number;
        startY: number;
        initialDecoX: number;
        initialDecoY: number;
    }>({ id: null, startX: 0, startY: 0, initialDecoX: 0, initialDecoY: 0 });

    const handleDecoMouseDown = (e: React.MouseEvent, deco: WidgetDecoration) => {
        e.stopPropagation();
        e.preventDefault(); // 텍스트 선택 등 방지
        onSelectDecoration(deco.id); // 드래그 시작 시 선택

        dragRef.current = {
            id: deco.id,
            startX: e.clientX,
            startY: e.clientY,
            initialDecoX: deco.x,
            initialDecoY: deco.y,
        };

        // 전역 이벤트 리스너 등록
        window.addEventListener('mousemove', handleDecoMouseMove);
        window.addEventListener('mouseup', handleDecoMouseUp);
    };

    const handleDecoMouseMove = (e: MouseEvent) => {
        if (!dragRef.current.id) return;

        const { startX, startY, initialDecoX, initialDecoY, id } = dragRef.current;

        // 델타 계산 (픽셀)
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        // 픽셀 -> 퍼센트 변환
        // currentSize.w가 0이면 1로 방어
        const width = currentSize.w || 1;
        const height = currentSize.h || 1;

        const deltaXPercent = (deltaX / width) * 100;
        const deltaYPercent = (deltaY / height) * 100;

        // 새 위치 계산
        const newX = initialDecoX + deltaXPercent;
        const newY = initialDecoY + deltaYPercent;

        // 업데이트 (실시간)
        updateDecoration(id, { x: newX, y: newY });
    };

    const handleDecoMouseUp = () => {
        dragRef.current.id = null;
        window.removeEventListener('mousemove', handleDecoMouseMove);
        window.removeEventListener('mouseup', handleDecoMouseUp);
    };

    // 🌟 리사이즈 로직
    const resizeRef = useRef<{
        id: string | null;
        startX: number;
        startY: number;
        initialW: number;
        initialH: number;
        initialX: number;
        initialY: number;
        rotation: number; // [NEW]
        handle: string; // 'se', 'sw', 'ne', 'nw'
    }>({ id: null, startX: 0, startY: 0, initialW: 0, initialH: 0, initialX: 0, initialY: 0, rotation: 0, handle: '' });

    const handleResizeMouseDown = (e: React.MouseEvent, deco: WidgetDecoration, handle: string) => {
        e.stopPropagation();
        e.preventDefault();

        resizeRef.current = {
            id: deco.id,
            startX: e.clientX,
            startY: e.clientY,
            initialW: deco.w,
            initialH: deco.h,
            initialX: deco.x,
            initialY: deco.y,
            rotation: deco.rotation || 0, // [NEW] Capture rotation
            handle,
        };

        window.addEventListener('mousemove', handleResizeMouseMove);
        window.addEventListener('mouseup', handleResizeMouseUp);
    };

    const handleResizeMouseMove = (e: MouseEvent) => {
        if (!resizeRef.current.id) return;

        const { startX, startY, initialW, initialH, initialX, initialY, handle, id } = resizeRef.current;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        // 캔버스 크기 (퍼센트 계산용)
        const canvasW = currentSize.w || 1;
        const canvasH = currentSize.h || 1;

        let newW = initialW;
        let newH = initialH;
        let newX = initialX; // %
        let newY = initialY; // %

        // 대칭 리사이징 (중심 유지 X, 코너 기준) 
        // X, Y값 계산은 픽셀 변화를 %로 변환하여 적용해야 함.
        // 여기서는 간단히 'se' (우하단) 기준만 먼저 생각하고, 다른 방향은 부호 반대

        switch (handle) {
            case 'se': // 우하단
                newW = initialW + deltaX;
                newH = initialH + deltaY;
                // 중심점 이동: 너비가 커진 만큼 중심은 우측(X+)으로, 높이가 커진 만큼 하단(Y+)으로 절반만큼 이동
                newX = initialX + ((deltaX / 2) / canvasW * 100);
                newY = initialY + ((deltaY / 2) / canvasH * 100);
                break;
            case 'sw': // 좌하단
                newW = initialW - deltaX;
                newH = initialH + deltaY;
                newX = initialX + ((deltaX / 2) / canvasW * 100); // deltaX가 음수면 커짐 -> 중심은 좌측(X-)이어야 하는데.. 식 재검토
                // 좌측으로 드래그(deltaX < 0) -> 너비 증가 -> 중심은 좌측 이동
                newX = initialX + ((deltaX / 2) / canvasW * 100);
                newY = initialY + ((deltaY / 2) / canvasH * 100);
                break;
            case 'ne': // 우상단
                newW = initialW + deltaX;
                newH = initialH - deltaY;
                newX = initialX + ((deltaX / 2) / canvasW * 100);
                newY = initialY + ((deltaY / 2) / canvasH * 100);
                break;
            case 'nw': // 좌상단
                newW = initialW - deltaX;
                newH = initialH - deltaY;
                newX = initialX + ((deltaX / 2) / canvasW * 100);
                newY = initialY + ((deltaY / 2) / canvasH * 100);
                break;
        }

        // 최소 크기 제한
        if (newW < 20) newW = 20;
        if (newH < 20) newH = 20;

        updateDecoration(id, { w: newW, h: newH, x: newX, y: newY });
    };

    const handleResizeMouseUp = () => {
        resizeRef.current.id = null;
        window.removeEventListener('mousemove', handleResizeMouseMove);
        window.removeEventListener('mouseup', handleResizeMouseUp);
    };

    // 🌟 Blob Point Dragging Logic
    const blobRef = useRef<{ id: string, index: number } | null>(null);









    // Need to improve this. For now, let's just scaffold.
    // Actually, we can pass a ref to the canvas container.
    const canvasRef = useRef<HTMLDivElement>(null);

    const handlePointMouseUp = () => {
        blobRef.current = null;
        window.removeEventListener('mousemove', handlePointDrag);
        window.removeEventListener('mouseup', handlePointMouseUp);
    };

    const handlePointDrag = (e: MouseEvent) => {
        if (!blobRef.current || !canvasRef.current) return;
        const { id, index } = blobRef.current;
        const deco = decorations.find(d => d.id === id);
        if (!deco || !deco.points) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - canvasRect.left;
        const mouseY = e.clientY - canvasRect.top;

        // Canvas Scale? Assuming 1:1 for now or handled by strict sizing.

        // Decoration Rect in Canvas (px)
        const decoCenterX = (deco.x / 100) * canvasRect.width;
        const decoCenterY = (deco.y / 100) * canvasRect.height;



        // Local Mouse inside Decoration (px)
        // Need to handle Rotation!
        // Rotate point (mouseX, mouseY) around (decoCenterX, decoCenterY) by -rotation.
        const rad = -(deco.rotation || 0) * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const dx = mouseX - decoCenterX;
        const dy = mouseY - decoCenterY;

        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        // Now shiftOrigin to Top-Left of unrotated box
        // Unrotated coords range: [-w/2, w/2] -> [0, w]
        const pxX = localX + (deco.w / 2);
        const pxY = localY + (deco.h / 2);

        // Convert to Normalized 0-100
        let normX = (pxX / deco.w) * 100;
        let normY = (pxY / deco.h) * 100;

        // Clamp? Maybe allow outside slightly? Organic shapes can go wild.

        const newPoints = [...deco.points];
        newPoints[index] = { x: normX, y: normY };

        updateDecoration(id, { points: newPoints });
    };

    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleDecoMouseMove);
            window.removeEventListener('mouseup', handleDecoMouseUp);
            window.removeEventListener('mousemove', handleResizeMouseMove);
            window.removeEventListener('mouseup', handleResizeMouseUp);
            // Cleanup blob
            window.removeEventListener('mousemove', handlePointDrag);
            window.removeEventListener('mouseup', handlePointMouseUp);
        };
    }, []);

    // Helper to start drag
    const startPointDrag = (e: React.MouseEvent, decoId: string, index: number) => {
        e.stopPropagation();
        e.preventDefault();
        blobRef.current = { id: decoId, index };
        window.addEventListener('mousemove', handlePointDrag);
        window.addEventListener('mouseup', handlePointMouseUp);
    };

    const handlePathClick = (e: React.MouseEvent, deco: WidgetDecoration) => {
        if (!deco.points || !canvasRef.current) return;
        e.stopPropagation();

        const canvasRect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - canvasRect.left;
        const mouseY = e.clientY - canvasRect.top;

        // Decoration Center
        const decoCenterX = (deco.x / 100) * canvasRect.width;
        const decoCenterY = (deco.y / 100) * canvasRect.height;

        // Rotate Global Mouse to Local
        const rad = -(deco.rotation || 0) * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const dx = mouseX - decoCenterX;
        const dy = mouseY - decoCenterY;

        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        // Shift origin
        const pxX = localX + (deco.w / 2);
        const pxY = localY + (deco.h / 2);

        const newPoint = {
            x: (pxX / deco.w) * 100,
            y: (pxY / deco.h) * 100
        };

        // Find nearest segment to insert
        let minDist = Infinity;
        let insertIdx = 0;

        const pts = deco.points;
        for (let i = 0; i < pts.length; i++) {
            const p1 = pts[i];
            const p2 = pts[(i + 1) % pts.length]; // Closed loop

            // Projected distance to line segment p1-p2?
            // Simple heuristic available: Insert between the two points that are closest to newPoint? 
            // Or closest mid-point projection?

            // Let's use distance to segment p1-p2
            // Since it's a spline, the actual curve is complex, but segment distance is okay approximation for UX

            // Just find index where (dist(p1, new) + dist(new, p2)) - dist(p1, p2) is minimal?
            // This is "Ellipse" logic.
            const d1 = Math.hypot(p1.x - newPoint.x, p1.y - newPoint.y);
            const d2 = Math.hypot(p2.x - newPoint.x, p2.y - newPoint.y);
            const d12 = Math.hypot(p1.x - p2.x, p1.y - p2.y);

            const extraDist = (d1 + d2) - d12;
            if (extraDist < minDist) {
                minDist = extraDist;
                insertIdx = i + 1;
            }
        }

        const newPoints = [...pts];
        newPoints.splice(insertIdx, 0, newPoint);
        updateDecoration(deco.id, { points: newPoints });
    };

    const activeBlock = activeId ? findBlock(activeId, blocks) : null;

    // Calculate preview dimensions
    const getPreviewStyle = () => {
        if (!activeBlock) return {};
        const layout = activeBlock.layout || { w: '100%', h: 'auto' };

        let width = '200px'; // fallback
        if (typeof layout.w === 'string' && layout.w.endsWith('%')) {
            const percent = parseFloat(layout.w);
            width = `${(currentSize.w * percent) / 100}px`;
        } else if (typeof layout.w === 'number') {
            width = `${layout.w}px`;
        } else {
            width = layout.w as string;
        }

        let height = '100px';
        // h가 auto면 대략적인 높이 설정, px이면 그대로 사용
        if (layout.h === 'auto') height = '150px';
        else if (typeof layout.h === 'string' && layout.h.endsWith('%')) {
            const percent = parseFloat(layout.h);
            height = `${(currentSize.h * percent) / 100}px`;
        } else {
            height = layout.h as string;
        }

        return { width, height };
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    const { setNodeRef } = useDroppable({
        id: 'ROOT',
        data: { containerId: 'ROOT', isContainer: true },
    });

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEndLocal = (event: DragEndEvent) => {
        setActiveId(null);
        onDragEnd(event);
    };

    return (
        <main className="flex-1 bg-[var(--bg-primary)] relative flex flex-col items-center pt-12 p-4 overflow-auto gap-1">
            <div className="relative group/canvas w-full max-w-full flex justify-center flex-1 ">
                <div
                    ref={canvasRef}
                    id="canvas-boundary"
                    className="bg-[var(--bg-card)] rounded-[24px] shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden relative transition-all duration-500 flex flex-col ring-[12px] ring-gray-900 border border-[var(--border-color)]"
                    style={{
                        width: `${currentSize.w}px`,
                        height: `${currentSize.h}px`,
                        flexShrink: 0,
                        padding: '0px',
                    }}
                    onClick={() => {
                        onSelectBlock(null);
                        onSetActiveContainer(null);
                        // onSelectDecoration(null); // 이건 배경 클릭 시 해제할지 말지 선택
                    }}
                >
                    {/* 🌟 0. 배경 데코레이션 레이어 */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                        {/* 🌟 Animation Keyframes (Same as DecorationLayer) */}
                        <style>
                            {`
                                @keyframes spin { 0% { transform: translate(-50%, -50%) rotate(0deg); } 100% { transform: translate(-50%, -50%) rotate(360deg); } }
                                @keyframes pulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.1); } }
                                @keyframes bounce { 0%, 100% { transform: translate(-50%, -50%); } 50% { transform: translate(-50%, -60%); } }
                                @keyframes float { 0% { transform: translate(-50%, -50%); } 50% { transform: translate(-50%, -55%); } 100% { transform: translate(-50%, -50%); } }
                                @keyframes wiggle { 0%, 100% { transform: translate(-50%, -50%) rotate(-3deg); } 50% { transform: translate(-50%, -50%) rotate(3deg); } }
                            `}
                        </style>
                        {decorations?.map(deco => {
                            // 🌟 Data recovery for corrupted 'type' (due to previous bug)
                            let safeType = deco.type;
                            if (typeof safeType === 'object' && (safeType as any).type) {
                                safeType = (safeType as any).type;
                            }

                            return (
                                <div
                                    key={deco.id}
                                    onMouseDown={(e) => handleDecoMouseDown(e, deco)}
                                    onClick={(e) => e.stopPropagation()}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        // 🌟 더블 클릭 시 설정 열기
                                        if (onOpenSettings) onOpenSettings();
                                    }}
                                    className={`absolute transition-all duration-300 ease-out cursor-pointer pointer-events-auto ${selectedDecorationId === deco.id ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:ring-1 hover:ring-indigo-300'}`}
                                    style={{
                                        left: `${deco.x}%`,
                                        top: `${deco.y}%`,
                                        width: `${deco.w}px`,
                                        height: `${deco.h}px`,
                                        // 🌟 [NEW] Image Background for basic shapes
                                        backgroundColor: deco.imageUrl ? undefined : ((safeType === 'circle' || safeType === 'square') ? deco.color : undefined),
                                        backgroundImage: (deco.imageUrl && safeType !== 'blob') ? `url(${deco.imageUrl})` : undefined,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        borderRadius: safeType === 'circle' ? '50%' : safeType === 'square' ? '10%' : '0%',
                                        transform: `translate(-50%, -50%) rotate(${deco.rotation || 0}deg)`,
                                        opacity: deco.opacity,
                                        zIndex: deco.zIndex || 0,
                                        // 🌟 Animation Implementation (Canvas View)
                                        animationName: deco.animation?.type,
                                        animationDuration: `${deco.animation?.duration || 3}s`,
                                        animationIterationCount: 'infinite',
                                        animationTimingFunction: 'ease-in-out',
                                        animationDelay: `${deco.animation?.delay || 0}s`,
                                    }}
                                >
                                    {/* 🌟 Unified Rendering for Video/Image/Color */}
                                    {safeType === 'blob' && !deco.mediaType && !deco.imageUrl ? (
                                        // Pure Color Blob (SVG for better editing/hitbox)
                                        <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                                            <path
                                                d={getSvgPathFromPoints(deco.points || [], 0.5, true)}
                                                fill={deco.color}
                                                fillOpacity={0.8}
                                                stroke={selectedDecorationId === deco.id ? "rgba(99, 102, 241, 0.5)" : "none"}
                                                strokeWidth="1"
                                                className="pointer-events-none"
                                            />
                                            {/* Hitbox */}
                                            <path
                                                d={getSvgPathFromPoints(deco.points || [], 0.5, true)}
                                                fill="transparent"
                                                stroke="transparent"
                                                strokeWidth="15"
                                                className="cursor-crosshair pointer-events-auto"
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onClick={(e) => handlePathClick(e, deco)}
                                            />
                                        </svg>
                                    ) : (
                                        // Image/Video/Basic Shape
                                        <div
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                backgroundColor: (deco.mediaType === 'video' || deco.imageUrl) ? undefined : deco.color,
                                                // Image Background
                                                backgroundImage: (deco.mediaType !== 'video' && deco.imageUrl && safeType !== 'blob') ? `url(${deco.imageUrl})` : undefined,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                borderRadius: safeType === 'circle' ? '50%' : safeType === 'square' ? '10%' : '0%',
                                                // Blob clip-path for Canvas (using path from points)
                                                clipPath: (safeType === 'star')
                                                    ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                                                    : (safeType === 'blob' && deco.points)
                                                        ? `path('${getSvgPathFromPoints(deco.points, 0.5, true).replace(/,/g, ' ')}')`
                                                        : undefined
                                            }}
                                        >
                                            {/* 🌟 Video Element */}
                                            {deco.mediaType === 'video' && deco.videoUrl && (
                                                <video
                                                    src={deco.videoUrl}
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onTimeUpdate={(e) => {
                                                        const vid = e.currentTarget;
                                                        const start = deco.videoStartTime || 0;
                                                        const end = deco.videoEndTime || 0;
                                                        if (end > 0 && vid.currentTime >= end) {
                                                            vid.currentTime = start;
                                                        }
                                                    }}
                                                    onLoadedMetadata={(e) => {
                                                        if (deco.videoStartTime) e.currentTarget.currentTime = deco.videoStartTime;
                                                    }}
                                                />
                                            )}
                                            {/* 🌟 Blob Image in Div */}
                                            {deco.mediaType !== 'video' && deco.imageUrl && safeType === 'blob' && (
                                                <img
                                                    src={deco.imageUrl}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                    )}
                                    {/* Control Points & Handles follow */}

                                    {/* 3. Control Points (Only when selected) */}
                                    {selectedDecorationId === deco.id && deco.points && deco.points.map((p, idx) => (
                                        <div
                                            key={idx}
                                            onMouseDown={(e) => startPointDrag(e, deco.id, idx)}
                                            onDoubleClick={(e) => {
                                                e.stopPropagation();
                                                if (deco.points && deco.points.length > 3) {
                                                    const newPoints = [...deco.points];
                                                    newPoints.splice(idx, 1);
                                                    updateDecoration(deco.id, { points: newPoints });
                                                }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="absolute w-3 h-3 bg-white border border-indigo-500 rounded-full cursor-grab active:cursor-grabbing hover:bg-indigo-100 z-50 shadow-sm"
                                            style={{
                                                left: `${p.x}%`,
                                                top: `${p.y}%`,
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                        />
                                    ))}

                                    {/* 🌟 리사이즈 핸들 (선택 시에만 표시) */}
                                    {selectedDecorationId === deco.id && (
                                        <>
                                            {/* NW */}
                                            <div
                                                onMouseDown={(e) => handleResizeMouseDown(e, deco, 'nw')}
                                                className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border border-indigo-500 rounded-full cursor-nw-resize z-50 hover:bg-indigo-100"
                                            />
                                            {/* NE */}
                                            <div
                                                onMouseDown={(e) => handleResizeMouseDown(e, deco, 'ne')}
                                                className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border border-indigo-500 rounded-full cursor-ne-resize z-50 hover:bg-indigo-100"
                                            />
                                            {/* SW */}
                                            <div
                                                onMouseDown={(e) => handleResizeMouseDown(e, deco, 'sw')}
                                                className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border border-indigo-500 rounded-full cursor-sw-resize z-50 hover:bg-indigo-100"
                                            />
                                            {/* SE */}
                                            <div
                                                onMouseDown={(e) => handleResizeMouseDown(e, deco, 'se')}
                                                className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border border-indigo-500 rounded-full cursor-se-resize z-50 hover:bg-indigo-100"
                                            />
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={pointerWithin}
                        onDragStart={handleDragStart} // ✨ Connect handleDragStart
                        onDragEnd={handleDragEndLocal} // ✨ Connect handleDragEndLocal
                        onDragOver={onDragOver} // ✨ Connect onDragOver prop
                    >
                        {/* 🌟 pointerEvents를 인라인 스타일로 강제 적용하여 클릭 투과 보장 */}
                        <div
                            ref={setNodeRef}
                            className={`flex-1 flex flex-col gap-0 min-h-full relative z-20`}
                            style={{ pointerEvents: activeId ? 'auto' : 'none' }}
                        >
                            {blocks.length === 0 ? (
                                <div
                                    className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)]"
                                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                                >
                                    <Smartphone size={40} className="mb-3 opacity-10" />
                                    <p className="text-sm font-semibold opacity-20 max-md:hidden">좌측에서 기능 선택</p>
                                    <p className="text-sm font-semibold opacity-20 md:hidden">아래에서 기능 선택</p>
                                </div>
                            ) : (
                                <SortableContext
                                    items={blocks.map((b) => b.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {blocks.map((block) => (
                                        <div key={block.id} className="" style={{ pointerEvents: 'auto' }}>
                                            <SortableBlockItem
                                                block={block}
                                                selectedBlockId={selectedBlockId}
                                                onSelectBlock={onSelectBlock}
                                                onRemoveBlock={onRemoveBlock}
                                                activeContainer={activeContainer}
                                                onSetActiveContainer={onSetActiveContainer}
                                                onUpdateBlock={onUpdateBlock}
                                                onOpenSettings={onOpenSettings} // 🌟 [NEW] 전달
                                            />
                                        </div>
                                    ))}
                                </SortableContext>
                            )}
                        </div>

                        {/* 🌟 드래그 오버레이: 실제 블록 모양 렌더링 */}
                        <DragOverlay modifiers={[snapCenterToCursor]} zIndex={1000} dropAnimation={null}>
                            {activeBlock ? (
                                <div
                                    className="rounded-lg shadow-2xl opacity-90 overflow-hidden bg-white ring-2 ring-indigo-500 ring-offset-2"
                                    style={getPreviewStyle()}
                                >
                                    <BlockRenderer
                                        block={activeBlock}
                                        selectedBlockId={null}
                                        onSelectBlock={() => { }}
                                        onRemoveBlock={() => { }}
                                        activeContainer={null}
                                        onSetActiveContainer={() => { }}
                                        onUpdateBlock={() => { }}
                                    />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>


                {/* 하단 사이즈 표시 바닥 정보 */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--bg-card-secondary)] px-4 py-1.5 rounded-full border border-[var(--border-color)] opacity-0 group-hover/canvas:opacity-100 transition-opacity">
                    <span>WIDTH {currentSize.w}px</span>
                    <span className="text-[var(--text-secondary)]">|</span>
                    <span>HEIGHT {currentSize.h}px</span>
                </div>
                {/* 🌟 [NEW] Scene Timeline Bar */}
                {
                    scenes && (
                        <div className="mt-4 w-full max-w-[500px] flex flex-col gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-2 shadow-sm z-10 transition-all absolute bottom-4 left-1/2 -translate-x-1/2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1">
                                    <Clock size={12} /> ANIMATION TIMELINE
                                </span>
                                <div className="flex items-center gap-2">
                                    {/* Play/Pause */}
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className={`p-1.5 rounded hover:bg-[var(--bg-card-secondary)] transition-colors ${isPlaying ? 'text-indigo-500' : 'text-[var(--text-primary)]'}`}
                                        title={isPlaying ? "Pause" : "Play"}
                                    >
                                        {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                                    </button>
                                    {/* Duration Input */}
                                    <div className="flex items-center gap-1 bg-[var(--bg-site)] px-2 py-1 rounded text-[10px] border border-[var(--border-color)]">
                                        <span className="text-[var(--text-secondary)]">Duration:</span>
                                        <input
                                            type="number"
                                            min="0.1"
                                            step="0.1"
                                            value={scenes[currentSceneIndex]?.duration || 1}
                                            onChange={(e) => onUpdateSceneDuration?.(currentSceneIndex, parseFloat(e.target.value))}
                                            className="w-8 bg-transparent text-right outline-none font-bold"
                                        />
                                        <span className="text-[var(--text-secondary)]">s</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                                {scenes.map((scene, idx) => (
                                    <div
                                        key={scene.id}
                                        onClick={() => {
                                            onChangeScene?.(idx);
                                            setIsPlaying(false); // Pause on manual selection
                                        }}
                                        className={`
                                    flex-shrink-0 w-16 h-12 rounded border cursor-pointer relative group flex flex-col items-center justify-center gap-1 transition-all
                                    ${currentSceneIndex === idx
                                                ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                                                : 'border-[var(--border-color)] hover:border-[var(--text-secondary)] bg-[var(--bg-site)]'
                                            }
                                `}
                                    >
                                        <span className="text-[10px] font-bold text-[var(--text-secondary)]">Frame {idx + 1}</span>
                                        {scenes.length > 1 && currentSceneIndex === idx && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteScene?.(idx);
                                                }}
                                                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                                                title="Delete Frame"
                                            >
                                                <Trash2 size={8} />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {/* Add Scene Button */}
                                <button
                                    onClick={() => {
                                        onAddScene?.();
                                        setIsPlaying(false);
                                    }}
                                    className="flex-shrink-0 w-8 h-12 rounded border border-dashed border-[var(--border-color)] hover:border-indigo-500 hover:text-indigo-500 flex items-center justify-center transition-colors text-[var(--text-secondary)]"
                                    title="Duplicate Current Frame"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    )
                }
            </div >
        </main >
    );
};

export default Canvas;
