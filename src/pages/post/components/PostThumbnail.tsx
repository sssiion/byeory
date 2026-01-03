
import React from 'react';
import type { PostData } from '../types';
import EditorCanvas from './editor/EditorCanvas';

interface Props {
    post: PostData;
    width?: number; // Container width in px (e.g. card width)
    height?: number; // Container height in px
}

const PostThumbnail: React.FC<Props> = ({ post, width = 300, height = 300 }) => {
    // Determine scale factor
    // EditorCanvas standard width is 800px.
    // We want to fit 800px into `width`.
    const baseWidth = 800;
    const scale = width / baseWidth;

    // We need to pass dummy handlers since it's read-only
    const noop = () => { };

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: '#ffffff' // base background
            }}
            className="pointer-events-none select-none" // Disable interaction
        >
            <div
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: `${baseWidth}px`,
                    // Height should be enough to cover the aspect ratio. 
                    // If height is provided, we map it back to unscaled height.
                    height: `${height / scale}px`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}
            >
                {/* 
                    EditorCanvas expects full editor props. 
                    We provide the post data and defaults for the rest.
                */}
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
                />
            </div>
        </div>
    );
};

export default PostThumbnail;
