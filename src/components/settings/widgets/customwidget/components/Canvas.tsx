import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, Play, Pause, Plus, Trash2, Clock } from 'lucide-react';
import type { WidgetBlock, WidgetSize, WidgetDecoration, WidgetScene } from '../types';
import { getSvgPathFromPoints } from '../utils';
import DraggableBlockItem from './Rendercomponent/DraggableBlockItem';

interface Props {
    blocks: WidgetBlock[];
    currentSize: WidgetSize;
    selectedBlockId: string | null;
    onSelectBlock: (id: string | null) => void;
    onRemoveBlock: (id: string) => void;
    onUpdateBlock: (id: string, updates: any) => void;
    decorations: WidgetDecoration[];
    selectedDecorationId: string | null;
    onSelectDecoration: (id: string | null) => void;
    updateDecoration: (id: string, updates: Partial<WidgetDecoration>) => void;
    onOpenSettings?: () => void;
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
        onUpdateBlock,
        decorations,
        selectedDecorationId,
        onSelectDecoration,
        updateDecoration,
        onOpenSettings,
        scenes,
        currentSceneIndex = 0,
        onAddScene,
        onChangeScene,
        onUpdateSceneDuration,
        onDeleteScene
    } = props;

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

    const blockDragRef = useRef<{
        id: string | null;
        startX: number;
        startY: number;
        initialX: number;
        initialY: number;
    }>({ id: null, startX: 0, startY: 0, initialX: 50, initialY: 50 });

    const handleBlockMouseDown = (e: React.MouseEvent, block: WidgetBlock) => {
        e.stopPropagation();
        onSelectBlock(block.id);

        const layout = block.layout || { x: 50, y: 50, w: 100, h: 'auto', rotation: 0, zIndex: 1 };

        blockDragRef.current = {
            id: block.id,
            startX: e.clientX,
            startY: e.clientY,
            initialX: typeof layout.x === 'number' ? layout.x : 50,
            initialY: typeof layout.y === 'number' ? layout.y : 50,
        };

        window.addEventListener('mousemove', handleBlockMouseMove);
        window.addEventListener('mouseup', handleBlockMouseUp);
    };

    const handleBlockMouseMove = (e: MouseEvent) => {
        if (!blockDragRef.current.id) return;

        const { startX, startY, initialX, initialY, id } = blockDragRef.current;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        const canvasW = currentSize.w || 1;
        const canvasH = currentSize.h || 1;

        const deltaXPercent = (deltaX / canvasW) * 100;
        const deltaYPercent = (deltaY / canvasH) * 100;

        const currentBlock = blocks.find(b => b.id === id);
        if (!currentBlock) return;

        onUpdateBlock(id, {
            layout: {
                ...currentBlock.layout,
                x: initialX + deltaXPercent,
                y: initialY + deltaYPercent,
            }
        });
    };

    const handleBlockMouseUp = () => {
        blockDragRef.current.id = null;
        window.removeEventListener('mousemove', handleBlockMouseMove);
        window.removeEventListener('mouseup', handleBlockMouseUp);
    };

    const dragRef = useRef<{
        id: string | null;
        startX: number;
        startY: number;
        initialDecoX: number;
        initialDecoY: number;
    }>({ id: null, startX: 0, startY: 0, initialDecoX: 50, initialDecoY: 50 });

    const handleDecoMouseDown = (e: React.MouseEvent, deco: WidgetDecoration) => {
        e.stopPropagation();
        e.preventDefault();
        onSelectDecoration(deco.id);

        dragRef.current = {
            id: deco.id,
            startX: e.clientX,
            startY: e.clientY,
            initialDecoX: deco.x,
            initialDecoY: deco.y,
        };

        window.addEventListener('mousemove', handleDecoMouseMove);
        window.addEventListener('mouseup', handleDecoMouseUp);
    };

    const handleDecoMouseMove = (e: MouseEvent) => {
        if (!dragRef.current.id) return;
        const { startX, startY, initialDecoX, initialDecoY, id } = dragRef.current;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const width = currentSize.w || 1;
        const height = currentSize.h || 1;
        const deltaXPercent = (deltaX / width) * 100;
        const deltaYPercent = (deltaY / height) * 100;
        updateDecoration(id, { x: initialDecoX + deltaXPercent, y: initialDecoY + deltaYPercent });
    };

    const handleDecoMouseUp = () => {
        dragRef.current.id = null;
        window.removeEventListener('mousemove', handleDecoMouseMove);
        window.removeEventListener('mouseup', handleDecoMouseUp);
    };

    const resizeRef = useRef<{
        id: string | null;
        startX: number;
        startY: number;
        initialW: number;
        initialH: number;
        initialX: number;
        initialY: number;
        handle: string;
    }>({ id: null, startX: 0, startY: 0, initialW: 0, initialH: 0, initialX: 0, initialY: 0, handle: '' });

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
        const canvasW = currentSize.w || 1;
        const canvasH = currentSize.h || 1;

        let newW = initialW;
        let newH = initialH;
        let newX = initialX;
        let newY = initialY;

        switch (handle) {
            case 'se':
                newW = initialW + deltaX;
                newH = initialH + deltaY;
                newX = initialX + ((deltaX / 2) / canvasW * 100);
                newY = initialY + ((deltaY / 2) / canvasH * 100);
                break;
            case 'sw':
                newW = initialW - deltaX;
                newH = initialH + deltaY;
                newX = initialX + ((deltaX / 2) / canvasW * 100);
                newY = initialY + ((deltaY / 2) / canvasH * 100);
                break;
            case 'ne':
                newW = initialW + deltaX;
                newH = initialH - deltaY;
                newX = initialX + ((deltaX / 2) / canvasW * 100);
                newY = initialY + ((deltaY / 2) / canvasH * 100);
                break;
            case 'nw':
                newW = initialW - deltaX;
                newH = initialH - deltaY;
                newX = initialX + ((deltaX / 2) / canvasW * 100);
                newY = initialY + ((deltaY / 2) / canvasH * 100);
                break;
        }

        if (newW < 20) newW = 20;
        if (newH < 20) newH = 20;

        updateDecoration(id, { w: newW, h: newH, x: newX, y: newY });
    };

    const handleResizeMouseUp = () => {
        resizeRef.current.id = null;
        window.removeEventListener('mousemove', handleResizeMouseMove);
        window.removeEventListener('mouseup', handleResizeMouseUp);
    };

    const blobRef = useRef<{ id: string, index: number } | null>(null);
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
        const rad = -(deco.rotation || 0) * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const dx = (e.clientX - canvasRect.left) - ((deco.x / 100) * canvasRect.width);
        const dy = (e.clientY - canvasRect.top) - ((deco.y / 100) * canvasRect.height);

        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        const newPoints = [...deco.points];
        newPoints[index] = {
            x: ((localX + deco.w / 2) / deco.w) * 100,
            y: ((localY + deco.h / 2) / deco.h) * 100
        };

        updateDecoration(id, { points: newPoints });
    };

    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleDecoMouseMove);
            window.removeEventListener('mouseup', handleDecoMouseUp);
            window.removeEventListener('mousemove', handleResizeMouseMove);
            window.removeEventListener('mouseup', handleResizeMouseUp);
            window.removeEventListener('mousemove', handlePointDrag);
            window.removeEventListener('mouseup', handlePointMouseUp);
            window.removeEventListener('mousemove', handleBlockMouseMove);
            window.removeEventListener('mouseup', handleBlockMouseUp);
        };
    }, []);

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
        const rad = -(deco.rotation || 0) * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const dx = (e.clientX - canvasRect.left) - ((deco.x / 100) * canvasRect.width);
        const dy = (e.clientY - canvasRect.top) - ((deco.y / 100) * canvasRect.height);

        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        const newPoint = {
            x: ((localX + deco.w / 2) / deco.w) * 100,
            y: ((localY + deco.h / 2) / deco.h) * 100
        };

        let minDist = Infinity;
        let insertIdx = 0;
        for (let i = 0; i < deco.points.length; i++) {
            const p1 = deco.points[i];
            const p2 = deco.points[(i + 1) % deco.points.length];
            const d = (Math.hypot(p1.x - newPoint.x, p1.y - newPoint.y) + Math.hypot(p2.x - newPoint.x, p2.y - newPoint.y)) - Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (d < minDist) { minDist = d; insertIdx = i + 1; }
        }

        const newPoints = [...deco.points];
        newPoints.splice(insertIdx, 0, newPoint);
        updateDecoration(deco.id, { points: newPoints });
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
                    }}
                    onClick={() => {
                        onSelectBlock(null);
                        onSelectDecoration(null);
                    }}
                >
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
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
                            let safeType = deco.type;
                            if (typeof safeType === 'object' && (safeType as any).type) safeType = (safeType as any).type;

                            return (
                                <div
                                    key={deco.id}
                                    onMouseDown={(e) => handleDecoMouseDown(e, deco)}
                                    onClick={(e) => e.stopPropagation()}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        if (onOpenSettings) onOpenSettings();
                                    }}
                                    className={`absolute transition-all duration-300 ease-out cursor-pointer pointer-events-auto ${selectedDecorationId === deco.id ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:ring-1 hover:ring-indigo-300'}`}
                                    style={{
                                        left: `${deco.x}%`,
                                        top: `${deco.y}%`,
                                        width: `${deco.w}px`,
                                        height: `${deco.h}px`,
                                        backgroundColor: deco.imageUrl ? undefined : ((safeType === 'circle' || safeType === 'square') ? deco.color : undefined),
                                        backgroundImage: (deco.imageUrl && safeType !== 'blob') ? `url(${deco.imageUrl})` : undefined,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        borderRadius: safeType === 'circle' ? '50%' : safeType === 'square' ? '10%' : '0%',
                                        transform: `translate(-50%, -50%) rotate(${deco.rotation || 0}deg)`,
                                        opacity: deco.opacity,
                                        zIndex: deco.zIndex || 0,
                                        animationName: deco.animation?.type,
                                        animationDuration: `${deco.animation?.duration || 3}s`,
                                        animationIterationCount: 'infinite',
                                        animationTimingFunction: 'ease-in-out',
                                        animationDelay: `${deco.animation?.delay || 0}s`,
                                    }}
                                >
                                    {safeType === 'blob' && !deco.mediaType && !deco.imageUrl ? (
                                        <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                                            <path
                                                d={getSvgPathFromPoints(deco.points || [], 0.5, true)}
                                                fill={deco.color}
                                                fillOpacity={0.8}
                                                stroke={selectedDecorationId === deco.id ? "rgba(99, 102, 241, 0.5)" : "none"}
                                                strokeWidth="1"
                                                className="pointer-events-none"
                                            />
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
                                        <div
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                backgroundColor: (deco.mediaType === 'video' || deco.imageUrl) ? undefined : deco.color,
                                                backgroundImage: (deco.mediaType !== 'video' && deco.imageUrl && safeType !== 'blob') ? `url(${deco.imageUrl})` : undefined,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                borderRadius: safeType === 'circle' ? '50%' : safeType === 'square' ? '10%' : '0%',
                                                clipPath: (safeType === 'star')
                                                    ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                                                    : (safeType === 'blob' && deco.points)
                                                        ? `path('${getSvgPathFromPoints(deco.points, 0.5, true).replace(/,/g, ' ')}')`
                                                        : undefined
                                            }}
                                        >
                                            {deco.mediaType === 'video' && deco.videoUrl && (
                                                <video
                                                    src={deco.videoUrl}
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            )}
                                            {deco.mediaType !== 'video' && deco.imageUrl && safeType === 'blob' && (
                                                <img src={deco.imageUrl} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    )}

                                    {selectedDecorationId === deco.id && deco.points && deco.points.map((p, idx) => (
                                        <div
                                            key={idx}
                                            onMouseDown={(e) => startPointDrag(e, deco.id, idx)}
                                            className="absolute w-3 h-3 bg-white border border-indigo-500 rounded-full cursor-grab active:cursor-grabbing hover:bg-indigo-100 z-50 shadow-sm"
                                            style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
                                        />
                                    ))}

                                    {selectedDecorationId === deco.id && (
                                        <>
                                            <div onMouseDown={(e) => handleResizeMouseDown(e, deco, 'nw')} className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border border-indigo-500 rounded-full cursor-nw-resize z-50" />
                                            <div onMouseDown={(e) => handleResizeMouseDown(e, deco, 'ne')} className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border border-indigo-500 rounded-full cursor-ne-resize z-50" />
                                            <div onMouseDown={(e) => handleResizeMouseDown(e, deco, 'sw')} className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border border-indigo-500 rounded-full cursor-sw-resize z-50" />
                                            <div onMouseDown={(e) => handleResizeMouseDown(e, deco, 'se')} className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border border-indigo-500 rounded-full cursor-se-resize z-50" />
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex-1 min-h-full relative z-20" style={{ pointerEvents: 'none' }}>
                        {blocks.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] absolute inset-0" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                                <Smartphone size={40} className="mb-3 opacity-10" />
                                <p className="text-sm font-semibold opacity-20 max-md:hidden">좌측에서 기능 선택</p>
                                <p className="text-sm font-semibold opacity-20 md:hidden">아래에서 기능 선택</p>
                            </div>
                        ) : (
                            blocks.map((block) => (
                                <DraggableBlockItem
                                    key={block.id}
                                    block={block}
                                    layout={block.layout || { x: 50, y: 50, w: 100, h: 'auto', rotation: 0, zIndex: 1 }}
                                    selectedBlockId={selectedBlockId}
                                    onSelectBlock={onSelectBlock}
                                    onRemoveBlock={onRemoveBlock}
                                    onUpdateBlock={onUpdateBlock}
                                    onMouseDown={(e) => handleBlockMouseDown(e, block)}
                                    onOpenSettings={onOpenSettings}
                                />
                            ))
                        )}
                    </div>
                </div>

                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--bg-card-secondary)] px-4 py-1.5 rounded-full border border-[var(--border-color)] opacity-0 group-hover/canvas:opacity-100 transition-opacity">
                    <span>WIDTH {currentSize.w}px</span>
                    <span className="text-[var(--text-secondary)]">|</span>
                    <span>HEIGHT {currentSize.h}px</span>
                </div>

                {scenes && (
                    <div className="mt-4 w-full max-w-[500px] flex flex-col gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-2 shadow-sm z-10 transition-all absolute bottom-4 left-1/2 -translate-x-1/2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1">
                                <Clock size={12} /> ANIMATION TIMELINE
                            </span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsPlaying(!isPlaying)} className={`p-1.5 rounded hover:bg-[var(--bg-card-secondary)] transition-colors ${isPlaying ? 'text-indigo-500' : 'text-[var(--text-primary)]'}`}>
                                    {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                                </button>
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
                                    onClick={() => { onChangeScene?.(idx); setIsPlaying(false); }}
                                    className={`flex-shrink-0 w-16 h-12 rounded border cursor-pointer relative group flex flex-col items-center justify-center gap-1 transition-all ${currentSceneIndex === idx ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500' : 'border-[var(--border-color)] hover:border-[var(--text-secondary)] bg-[var(--bg-site)]'}`}
                                >
                                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">Frame {idx + 1}</span>
                                    {scenes.length > 1 && currentSceneIndex === idx && (
                                        <button onClick={(e) => { e.stopPropagation(); onDeleteScene?.(idx); }} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={8} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button onClick={() => { onAddScene?.(); setIsPlaying(false); }} className="flex-shrink-0 w-8 h-12 rounded border border-dashed border-[var(--border-color)] hover:border-indigo-500 hover:text-indigo-500 flex items-center justify-center transition-colors text-[var(--text-secondary)]">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default Canvas;
