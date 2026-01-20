
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { PostData } from '../types';
import MiniPostViewer from '../components/MiniPostPreview';
import AlbumBook from '../components/albumCover/AlbumBook'; // ✨ Added Import

interface Props {
    post?: PostData;
    album?: any; // ✨ Support Album Data
    onAnimationComplete: () => void;
    onClose: () => void; // To return to grid if user clicks background
    isLoading?: boolean; // If content is being fetched
}

type AnimationState = 'ZOOMING' | 'IDLE_CLOSED' | 'OPENING' | 'COMPLETED';

const BookOpeningOverlay: React.FC<Props> = ({ post, album, onAnimationComplete, onClose, isLoading = false }) => {
    const [status, setStatus] = useState<AnimationState>('ZOOMING');

    // Zoom duration
    useEffect(() => {
        const timer = setTimeout(() => {
            setStatus('IDLE_CLOSED');
        }, 800); // Match layoutId transition duration
        return () => clearTimeout(timer);
    }, []);

    const handleBookClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (status === 'IDLE_CLOSED' && !isLoading) {
            setStatus('OPENING');
            // Trigger completion after animation
            setTimeout(() => {
                setStatus('COMPLETED');
                onAnimationComplete();
            }, 1000); // Open animation duration
        }
    };

    if (status === 'COMPLETED') return null;

    // Helper to extract first page of content for right page preview
    const firstPageBlocks = post?.blocks ? post.blocks.slice(0, 5) : []; // Simple approximation

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative"
                style={{
                    // When closed: 520px (COVER ONLY)
                    // When open: 1040px (COVER + CONTENT)
                    width: status === 'OPENING' ? '1040px' : '520px',
                    height: '760px',
                    transition: 'width 1s ease-in-out',
                    perspective: '2000px',
                    transformStyle: 'preserve-3d'
                }}
            >
                {/* 1. THE BOOK WRAPPER */}
                <motion.div
                    className="w-full h-full relative"
                    layoutId={`album-cover-${album?.id || post?.id}`}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    onClick={handleBookClick}
                    style={{
                        transformStyle: 'preserve-3d',
                        cursor: (status === 'IDLE_CLOSED' && !isLoading) ? 'pointer' : 'default'
                    }}
                >
                    {/* === FRONT COVER (Rotates Open) === */}
                    <motion.div
                        className="absolute top-0 bottom-0 left-0 w-[520px] h-full z-20 origin-left"
                        style={{
                            transformStyle: 'preserve-3d',
                            backfaceVisibility: 'visible', // We want to see the back (Inside Left)
                        }}
                        animate={status === 'OPENING' ? {
                            rotateY: -180,
                        } : {
                            rotateY: 0
                        }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                    >
                        {/* FRONT FACE: Album Art */}
                        <div
                            className="absolute inset-0 w-full h-full bg-white rounded-r-lg shadow-2xl overflow-hidden flex flex-col"
                            style={{ backfaceVisibility: 'hidden' }} // Front only
                        >
                            {/* ✨ Album Cover or Post Cover */}
                            {album ? (
                                <AlbumBook
                                    title={album.name}
                                    tag={album.tag}
                                    count={album.count}
                                    config={album.coverConfig}
                                    className="w-full h-full shadow-none"
                                />
                            ) : (
                                <div className="absolute inset-0 w-full h-full flex flex-col">
                                    {(post?.blocks && post.blocks.find(b => b.type.startsWith('image'))?.imageUrl) ? (
                                        <div className="h-2/3 w-full overflow-hidden relative">
                                            <img
                                                src={post.blocks.find(b => b.type.startsWith('image'))?.imageUrl}
                                                alt="Cover"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/10" />
                                        </div>
                                    ) : (
                                        <div className="h-2/3 w-full bg-[#f0f0f0] flex items-center justify-center">
                                            <span className="text-6xl opacity-20">📖</span>
                                        </div>
                                    )}
                                    <div className="flex-1 bg-white p-8 flex flex-col justify-center items-center text-center relative">
                                        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none" />
                                        <h1 className="text-3xl font-bold text-gray-800 mb-4 line-clamp-3 font-serif" style={post?.titleStyles}>
                                            {post?.title}
                                        </h1>
                                        <div className="w-16 h-1 bg-gray-800 mb-4" />
                                        <p className="text-sm text-gray-500 font-serif">
                                            {post?.date || new Date().toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Loading Overlay */}
                            {isLoading && status === 'IDLE_CLOSED' && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
                                    <div className="text-4xl animate-bounce">⏳</div>
                                </div>
                            )}

                            {/* Click Hint */}
                            {!isLoading && status === 'IDLE_CLOSED' && (
                                <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none opacity-0 animate-[fade-in_1s_ease-out_1s_forwards]">
                                    <span className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md">
                                        Click to open
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* BACK FACE: Inside Left Page (White Paper with Content) */}
                        <div
                            className="absolute inset-0 w-full h-full bg-white rounded-l-lg shadow-inner flex flex-col overflow-hidden transform rotate-y-180"
                            style={{
                                backfaceVisibility: 'hidden', // Back only
                                backgroundColor: '#ffffff', // ✨ Ensuring White
                                zIndex: 1
                            }}
                        >
                            {/* Inner Page Shadow */}
                            <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-20" />

                            {/* ✨ Inside Cover Content */}
                            <div className="flex-1 p-12 flex flex-col relative z-10">
                                {album ? (
                                    // if Album, show Title Page style
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <div className="w-16 h-16 mb-6 opacity-20">
                                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-800 font-serif mb-2">{album.name}</h2>
                                        {/* <p className="text-sm text-gray-500 font-serif">{album.count}</p> */}
                                    </div>
                                ) : (
                                    // If Post, show Post Start
                                    post?.blocks && (
                                        <div className="w-full h-full overflow-hidden opacity-80" style={{ transform: 'scale(0.9)', transformOrigin: 'center' }}>
                                            <MiniPostViewer
                                                title={post.title}
                                                titleStyles={post.titleStyles || {}}
                                                blocks={firstPageBlocks}
                                                hideTitle={false} // Show Title on Inside Cover? Maybe yes for "Title Page" effect
                                                scale={0.8}
                                                paddingClass="px-0"
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </motion.div>


                    {/* === RIGHT PAGE (Content - Initially Hidden Behind Cover) === */}
                    <div
                        className="absolute top-0 right-0 w-[520px] h-full bg-white rounded-r-lg z-10 overflow-hidden"
                        style={{
                            // In closed state, this sits BEHIND the cover.
                            // We position it 'absolute right-0' relative to the 1040px container, 
                            // but initially container is 520px... wait.

                            // Better geometry:
                            // If Closed: container is 520px. Cover is at 0. Right Page should be at 0 too (hidden behind).
                            // If Open: container is 1040px. Cover (rotated) is at -520px visually?
                            // Let's stick to "One to Two" logic proposed.

                            left: status === 'OPENING' ? '520px' : '0px',
                            // When closed, it's at 0 (behind cover). When open, it shifts to right side?
                            // OR, simpler: Always at 'left: 50%' if we had a wide container. 

                            // Let's rely on Flex/Grid behavior or precise absolute pos?
                            // Container width adapts 520 -> 1040.
                            // Cover is 'left: 0', width 520.
                            // Right Page needs to be 'left: 520' when open.
                        }}
                    >
                        {/* We only show this content when opening starts/finishes.
                             Or it can exist but be covered.
                         */}
                        <div className="w-full h-full bg-[#fdfbf7] relative shadow-xl">
                            {/* Inner Page Shadow */}
                            <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-20" />

                            {/* Mini Preview of Content (Skeleton or First Page) */}
                            <div className="w-full h-full opacity-0 animate-[fade-in_0.5s_ease-in_0.5s_forwards] p-12 overflow-hidden">
                                {/* Only render content if we have it */}
                                {post?.blocks && post.blocks.length > 0 && (
                                    <MiniPostViewer
                                        title={post.title} // Will be hidden by hideTitle
                                        titleStyles={post.titleStyles || {}}
                                        blocks={firstPageBlocks}
                                        hideTitle={true} // NO TITLE
                                        scale={0.8}
                                        paddingClass="px-0"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* === SPINE (3D Bar) === */}
                    <div
                        className="absolute top-0 bottom-0 left-0 w-4 bg-gray-200 z-0 origin-left"
                        style={{
                            transform: 'rotateY(-90deg) translateX(-2px)', // Push back slightly
                            // Only visible when rotating
                        }}
                    ></div>

                </motion.div>
            </div>
        </div>
    );
};

export default BookOpeningOverlay;
