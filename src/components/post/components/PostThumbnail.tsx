
import React, { useRef, useState, useEffect } from 'react';
import type { PostData } from '../types';
import EditorCanvas from './editor/EditorCanvas';

interface Props {
    post: PostData;
    width?: number; // Fallback or initial width
    height?: number; // Container height (unused for scaling, but kept for interface)
}

const PostThumbnail: React.FC<Props> = ({ post, width = 300, height = 300 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const baseWidth = 800;

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const currentWidth = containerRef.current.clientWidth;
                // Avoid DBZ or zero-scale issues
                if (currentWidth > 0) {
                    setScale(currentWidth / baseWidth);
                }
            }
        };

        // Initial calc
        updateScale();

        const observer = new ResizeObserver(() => {
            updateScale();
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Dummy handler for read-only
    const noop = () => { };

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: '#ffffff'
            }}
            className="pointer-events-none select-none"
        >
            <div
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: `${baseWidth}px`,
                    height: `${baseWidth}px`, // Ensure it takes up space, height will be cut off by parent overflow anyway
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    // If we want centering, we could do:
                    // left: '50%', transform: `translateX(-50%) scale(${scale})`, transformOrigin: 'top center'
                    // But standard scaling strategy:
                    // If we match width exactly (which ResizeObserver does), top-left is fine.
                }}
            >
                <EditorCanvas
                    title={post.title}
                    setTitle={noop}
                    titleStyles={post.titleStyles || {
                        fontSize: '30px',
                        fontWeight: 'bold',
                        fontFamily: "'Noto Sans KR', sans-serif",
                        color: '#000000',
                        textAlign: 'left'
                    }}
                    paperStyles={post.styles || {}}
                    viewMode="read"
                    blocks={post.blocks || []}
                    setBlocks={noop}
                    stickers={post.stickers || []}
                    floatingTexts={post.floatingTexts || []}
                    floatingImages={post.floatingImages || []}
                    selectedId={null}
                    selectedType={null}
                    onSelect={noop}
                    onUpdate={noop}
                    onDelete={noop}
                    onBlockImageUpload={noop}
                    onBackgroundClick={noop}
                    hideTitle={true} // ✨ Hide redundant title
                />
            </div>
        </div>
    );
};

export default PostThumbnail;
