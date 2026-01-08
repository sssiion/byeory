import React from 'react';
import type { Block, FloatingImage, FloatingText, Sticker } from "../../post/types.ts";

interface MiniPostViewerProps {
    title: string;
    titleStyles: Record<string, any>;
    styles?: Record<string, any>; // ✨ Add paper styles prop
    blocks?: Block[];
    stickers?: Sticker[];
    floatingTexts?: FloatingText[];
    floatingImages?: FloatingImage[];
    scale?: number;
    minHeight?: string;
}

const MiniPostViewer: React.FC<MiniPostViewerProps> = ({
    title,
    titleStyles = {},
    styles = {}, // ✨ Default empty styles
    blocks = [],
    stickers = [],
    floatingTexts = [],
    floatingImages = [],
    scale = 0.4,
    minHeight = 'auto'
}) => {
    const ORIGINAL_WIDTH = 800; // 에디터 기준 너비

    const getSafeStyle = (item: any, defaultSize = 150) => {
        const x = item.x ?? item.left ?? 0;
        const y = item.y ?? item.top ?? 0;
        const width = item.w ?? item.width ?? defaultSize;
        const height = item.h ?? item.height ?? 'auto';

        return {
            position: 'absolute' as const,
            left: typeof x === 'number' ? `${x}px` : x,
            top: typeof y === 'number' ? `${y}px` : y,
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            transform: `rotate(${item.rotation || 0}deg)`,
            zIndex: item.zIndex || 10,
            opacity: item.opacity ?? 1,
        };
    };

    return (
        <div
            // ✨ overflow-hidden 제거: 부모(CommunityCard)에서 스크롤 처리
            className="origin-top-left bg-white shadow-sm relative select-none"
            style={{
                width: `${ORIGINAL_WIDTH}px`,
                minHeight: minHeight,
                height: 'auto',
                zoom: scale,
                ...styles, // ✨ Apply paper styles (background, etc.)
                position: 'relative', // Ensure relative positioning for absolute children
            }}
        >
            {/* ✨ 스타일 태그 추가: 제목 흐르기 애니메이션 */}
            <style>{`
                @keyframes post-marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .title-marquee {
                    display: inline-block;
                    white-space: nowrap !important;
                    animation: post-marquee 12s linear infinite;
                    will-change: transform;
                    padding-right: 50px;
                }
            `}</style>

            {/* 제목 영역은 글자가 흐르므로 overflow-hidden 유지 */}
            <div
                className="p-8 pb-4 border-b border-gray-100 mb-8 overflow-hidden whitespace-nowrap"
                style={{ backgroundColor: titleStyles.backgroundColor || 'transparent' }}
            >
                {/* h1에 animate 클래스 적용 */}
                <h1 className="title-marquee" style={{
                    fontSize: titleStyles.fontSize || '36px',
                    fontWeight: titleStyles.fontWeight || 'bold',
                    color: titleStyles.color || '#1a1a1a',
                    fontFamily: titleStyles.fontFamily || 'sans-serif',
                    textAlign: titleStyles.textAlign || 'left',
                    lineHeight: 1.4,
                    // wordBreak: 'keep-all' // 흐르는 효과를 위해 제거하거나 무시됨
                }}>
                    {title || "제목 없음"}
                </h1>
            </div>

            {/* 본문 블록 */}
            <div className="px-12 pb-20 space-y-6 relative z-0">
                {blocks.map((block, index) => {
                    const textStyle = {
                        fontFamily: block.styles?.fontFamily || 'sans-serif',
                        fontSize: block.styles?.fontSize || '18px',
                        fontWeight: block.styles?.fontWeight || 'normal',
                        textAlign: block.styles?.textAlign as any || 'left',
                        color: block.styles?.color || '#333',
                        backgroundColor: block.styles?.backgroundColor || 'transparent',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                    };

                    const imgHeight = block.styles?.imageHeight || '350px';
                    const imgFit = block.imageFit || 'cover';

                    return (
                        <div key={`block-${block.id || 'none'}-${index}`} className="relative">
                            {block.type === 'image-full' && (
                                <div className="space-y-3">
                                    {block.imageUrl && (
                                        <img src={block.imageUrl} className="w-full rounded-lg bg-gray-100" style={{ height: imgHeight, objectFit: imgFit }} alt="" />
                                    )}
                                    {block.text && <div style={textStyle}>{block.text}</div>}
                                </div>
                            )}

                            {block.type === 'image-double' && (
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        {block.imageUrl && <img src={block.imageUrl} className="w-1/2 rounded-lg bg-gray-100" style={{ height: imgHeight, objectFit: imgFit }} alt="" />}
                                        {block.imageUrl2 && <img src={block.imageUrl2} className="w-1/2 rounded-lg bg-gray-100" style={{ height: imgHeight, objectFit: imgFit }} alt="" />}
                                    </div>
                                    {block.text && <div style={textStyle}>{block.text}</div>}
                                </div>
                            )}

                            {(block.type === 'image-left' || block.type === 'image-right') && (
                                <div className={`flex gap-6 items-start ${block.type === 'image-right' ? 'flex-row-reverse' : ''}`}>
                                    {block.imageUrl && (
                                        <img src={block.imageUrl} className="w-1/2 rounded-lg bg-gray-100 flex-shrink-0" style={{ height: imgHeight, objectFit: imgFit }} alt="" />
                                    )}
                                    <div className="flex-1 min-w-0 pt-1" style={textStyle}>{block.text}</div>
                                </div>
                            )}

                            {block.type === 'paragraph' && (
                                <div style={{ ...textStyle, padding: block.styles?.backgroundColor ? '12px' : '0', borderRadius: '4px' }}>
                                    {block.text || <span className="opacity-0">Empty</span>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 3. 자유 배치 요소들 */}
            {stickers.map((stk, index) => (
                <img
                    key={`stk-${stk.id || 'none'}-${index}`}
                    src={stk.url}
                    style={{
                        ...getSafeStyle(stk, 120),
                        pointerEvents: 'none'
                    }}
                    alt="sticker"
                />
            ))}

            {floatingImages.map((img, index) => (
                <img
                    key={`img-${img.id || 'none'}-${index}`}
                    src={img.url}
                    style={{
                        ...getSafeStyle(img, 200),
                        objectFit: 'cover',
                        borderRadius: '8px',
                        pointerEvents: 'none'
                    }}
                    alt="floating"
                />
            ))}

            {floatingTexts.map((txt, index) => (
                <div
                    key={`txt-${txt.id || 'none'}-${index}`}
                    style={{
                        ...getSafeStyle(txt, 200),
                        padding: '8px',
                        fontFamily: txt.styles?.fontFamily,
                        fontSize: txt.styles?.fontSize || '16px',
                        fontWeight: txt.styles?.fontWeight || 'normal',
                        color: txt.styles?.color || '#000',
                        backgroundColor: txt.styles?.backgroundColor || 'transparent',
                        textAlign: txt.styles?.textAlign as any || 'left',
                        fontStyle: txt.styles?.fontStyle || 'normal',
                        textDecoration: txt.styles?.textDecoration || 'none',
                        whiteSpace: 'pre-wrap',
                        overflow: 'hidden',
                        wordBreak: 'break-word'
                    }}
                >
                    {txt.text}
                </div>
            ))}
        </div>
    );
};

export default MiniPostViewer;