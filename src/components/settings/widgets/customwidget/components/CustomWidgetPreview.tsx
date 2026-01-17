import React, { useState, useEffect } from 'react';
import type { WidgetBlock, WidgetDecoration, WidgetScene } from '../types';
import BlockRenderer from './BlockRenderer';
import DecorationLayer from './DecorationLayer'; // 🌟 Import DecorationLayer

interface CustomWidgetPreviewProps {
    content: {
        children?: WidgetBlock[];
        decorations?: WidgetDecoration[];
        scenes?: WidgetScene[]; // 🌟 Animation Support
    };
    defaultSize?: string; // "2x2"
    style?: React.CSSProperties;
    styles?: React.CSSProperties;
}

const CustomWidgetPreview: React.FC<CustomWidgetPreviewProps> = ({ content, defaultSize = "2x2", style, styles }) => {
    // 🌟 Animation State
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

    // Check if we have valid scenes
    const scenes = content.scenes || [];
    const hasScenes = scenes.length > 0;

    // 🌟 Timer for Animation
    useEffect(() => {
        if (!hasScenes || scenes.length <= 1) return;

        // Get duration (default 1s if missing)
        const duration = (scenes[currentSceneIndex].duration || 1) * 1000;

        const timer = setTimeout(() => {
            setCurrentSceneIndex((prev) => (prev + 1) % scenes.length);
        }, duration);

        return () => clearTimeout(timer);
    }, [hasScenes, scenes.length, currentSceneIndex, scenes]);

    // 🌟 Derive Content based on Scene or Static props
    const blocks = hasScenes ? (scenes[currentSceneIndex].blocks || []) : (content.children || []);
    const decorations = hasScenes ? (scenes[currentSceneIndex].decorations || []) : (content.decorations || []);

    // Size Parser "2x2" -> { w: 2, h: 2 }
    const [w, h] = defaultSize.split('x').map(Number);
    const size = { w: w || 2, h: h || 2 };

    const finalStyle = {
        ...(style || styles),
        backgroundColor: (style?.backgroundColor || styles?.backgroundColor || '#ffffff'), // Default to white if not set, but respect external style
    };

    return (
        <div
            className="w-full h-full relative overflow-hidden rounded-lg"
            style={finalStyle}
        >
            {/* 1. Decorations Layer (Background) */}
            <DecorationLayer decorations={decorations} />


            {/* 2. Blocks Layer (Foreground) */}
            {/* 🌟 [수정] Grid Layout -> Flex Layout (To match Canvas/List behavior) */}
            <div
                className="absolute inset-0 z-10 flex flex-col gap-1 p-3" // p-3으로 여백 조금 줌
                style={{
                    // gridTemplateColumns 제거 (리스트 형태이므로 불필요)
                    // 필요하다면 overflow-hidden 추가
                    overflow: 'hidden'
                }}
            >
                {blocks.map((block) => (
                    <div
                        key={block.id}
                        className="relative w-full overflow-hidden rounded bg-transparent" // 배경 투명으로 (decorations 보이게), 혹은 필요시 반투명
                    // style 제거 (Grid 아님)
                    >
                        <BlockRenderer
                            block={block}
                            selectedBlockId={null}
                            onSelectBlock={() => { }}
                            onRemoveBlock={() => { }}
                            activeContainer={null as any}
                            onSetActiveContainer={() => { }}
                            onUpdateBlock={() => { }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomWidgetPreview;
