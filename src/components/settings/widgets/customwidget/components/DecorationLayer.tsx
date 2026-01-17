
import React from 'react';
import type { WidgetDecoration } from '../types';
import { getSvgPathFromPoints } from '../utils';


interface DecorationLayerProps {
    decorations?: WidgetDecoration[];
}

const DecorationLayer: React.FC<DecorationLayerProps> = ({ decorations = [] }) => {
    if (!decorations || decorations.length === 0) return null;

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[inherit]">
            {/* 🌟 Global Animation Styles */}
            <style>
                {`
                    @keyframes spin { 0% { transform: translate(-50%, -50%) rotate(0deg); } 100% { transform: translate(-50%, -50%) rotate(360deg); } }
                    @keyframes pulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.1); } }
                    @keyframes bounce { 0%, 100% { transform: translate(-50%, -50%); } 50% { transform: translate(-50%, -60%); } }
                    @keyframes float { 0% { transform: translate(-50%, -50%); } 50% { transform: translate(-50%, -55%); } 100% { transform: translate(-50%, -50%); } }
                    @keyframes wiggle { 0%, 100% { transform: translate(-50%, -50%) rotate(-3deg); } 50% { transform: translate(-50%, -50%) rotate(3deg); } }
                `}
            </style>
            {decorations.map((deco) => {
                // 🌟 Data recovery for corrupted 'type'
                let safeType: string = deco.type;
                if (typeof safeType === 'object' && (safeType as any).type) {
                    safeType = (safeType as any).type;
                }

                // Basic validation
                if (!['blob', 'text', 'circle', 'square', 'star', 'shape'].includes(safeType)) {
                    // return null; // Or render nothing for unknown types
                }

                return (
                    <div
                        key={deco.id}
                        className="absolute"
                        style={{
                            left: `${deco.x}%`,
                            top: `${deco.y}%`,
                            width: `${deco.w}px`,
                            height: `${deco.h}px`,
                            transform: `translate(-50%, -50%) rotate(${deco.rotation || 0}deg)`,
                            opacity: deco.opacity,
                            zIndex: deco.zIndex || 0,
                            // 🌟 Animation Implementation
                            animationName: deco.animation?.type,
                            animationDuration: `${deco.animation?.duration || 3}s`,
                            animationIterationCount: 'infinite',
                            animationTimingFunction: 'ease-in-out',
                            animationDelay: `${deco.animation?.delay || 0}s`,
                            // 🌟 CSS Transition for Smooth Movement between Scenes
                            transition: 'all 0.5s ease-in-out',
                        }}
                    >
                        {safeType === 'blob' && !deco.mediaType && !deco.imageUrl ? (
                            // Pure Color Blob (SVG) - Keep existing logic for best anti-aliasing on color blobs
                            <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                                <path
                                    d={getSvgPathFromPoints(deco.points || [], 0.5, true)}
                                    fill={deco.color}
                                />
                            </svg>
                        ) : (
                            // Image/Video or Shape - Use HTML Div for easy video masking
                            // NOTE: Blob video needs clip-path: path(...). We need to normalize points to 0-100% for CSS clip-path?
                            // Actually clip-path: path() accepts pixel values usually. Since we used viewbox 0 0 100 100, we might need relative clip-path or scale.
                            // To be safe and simple: For now, let's keep the DIV background for Image/Shape and add Video child.
                            // For Blob Video, it is tricky. Let's use Mask Image if possible or ForeignObject.
                            // Let's rely on standard styles for now.
                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: (deco.mediaType === 'video' || deco.imageUrl) ? undefined : deco.color,
                                    // Image Background (if image)
                                    backgroundImage: (deco.mediaType !== 'video' && deco.imageUrl) ? `url(${deco.imageUrl})` : undefined,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderRadius: (safeType === 'circle' || (safeType === 'shape' && (deco as any).shapeType === 'circle')) ? '50%' :
                                        (safeType === 'square' || (safeType === 'shape' && (deco as any).shapeType === 'square')) ? '4px' : '0%',
                                    clipPath: (safeType === 'star' || (safeType === 'shape' && (deco as any).shapeType === 'star'))
                                        ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                                        : (safeType === 'blob' && deco.points)
                                            ? `path('${getSvgPathFromPoints(deco.points, 0.5, true).replace(/,/g, ' ')}')` // CSS clip-path path() support
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
                                            // Start from designated time
                                            if (deco.videoStartTime) e.currentTarget.currentTime = deco.videoStartTime;
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </div> // End of decoration div
                );
            })}
        </div>
    );
};

export default DecorationLayer;
