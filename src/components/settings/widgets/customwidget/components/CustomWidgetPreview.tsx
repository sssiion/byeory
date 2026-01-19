import React, { useState, useEffect } from 'react';
import type { WidgetBlock, WidgetDecoration, WidgetScene } from '../types';
import BlockRenderer from './BlockRenderer';
import DecorationLayer from './DecorationLayer';

interface CustomWidgetPreviewProps {
    content: {
        children?: WidgetBlock[];
        decorations?: WidgetDecoration[];
        scenes?: WidgetScene[];
    };
    defaultSize?: string;
    style?: React.CSSProperties;
    styles?: React.CSSProperties;
}

const CustomWidgetPreview: React.FC<CustomWidgetPreviewProps> = ({ content, defaultSize = "2x2", style, styles }) => {
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

    const scenes = content.scenes || [];
    const hasScenes = scenes.length > 0;

    useEffect(() => {
        if (!hasScenes || scenes.length <= 1) return;

        const duration = (scenes[currentSceneIndex].duration || 1) * 1000;

        const timer = setTimeout(() => {
            setCurrentSceneIndex((prev) => (prev + 1) % scenes.length);
        }, duration);

        return () => clearTimeout(timer);
    }, [hasScenes, scenes.length, currentSceneIndex, scenes]);

    const blocks = hasScenes ? (scenes[currentSceneIndex].blocks || []) : (content.children || []);
    const decorations = hasScenes ? (scenes[currentSceneIndex].decorations || []) : (content.decorations || []);

    const finalStyle = {
        ...(style || styles),
        backgroundColor: (style?.backgroundColor || styles?.backgroundColor || '#ffffff'),
    };

    return (
        <div
            className="w-full h-full relative overflow-hidden rounded-lg"
            style={finalStyle}
        >
            <DecorationLayer decorations={decorations} />

            <div
                className="absolute inset-0 z-10"
                style={{ overflow: 'hidden' }}
            >
                {blocks.map((block) => {
                    const blkLayout = block.layout || { x: 50, y: 50, w: '100%', h: 'auto' };
                    return (
                        <div
                            key={block.id}
                            className="absolute overflow-hidden rounded bg-transparent"
                            style={{
                                left: `${blkLayout.x}%`,
                                top: `${blkLayout.y}%`,
                                width: typeof blkLayout.w === 'number' ? `${blkLayout.w}px` : blkLayout.w,
                                height: typeof blkLayout.h === 'number' ? `${blkLayout.h}px` : blkLayout.h,
                                transform: `translate(-50%, -50%) rotate(${blkLayout.rotation || 0}deg)`,
                                zIndex: blkLayout.zIndex || 1,
                            }}
                        >
                            <BlockRenderer
                                block={block}
                                selectedBlockId={null}
                                onSelectBlock={() => { }}
                                onRemoveBlock={() => { }}
                                onUpdateBlock={() => { }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CustomWidgetPreview;
