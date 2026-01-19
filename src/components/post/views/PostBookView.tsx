import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PostData } from '../types';
import MiniPostViewer from '../../community/components/MiniPostPreview';

interface PostBookViewProps {
    posts: PostData[];
    onClose: () => void;
    startIndex?: number;
}

const PostBookView: React.FC<PostBookViewProps> = ({ posts, onClose, startIndex = 0 }) => {
    const [currentPostIndex, setCurrentPostIndex] = useState(startIndex);
    const [pageIndex, setPageIndex] = useState(0); // ✨ Start at Spread 0 (Page 1-2)
    const [contentHeight, setContentHeight] = useState(0);

    const totalPosts = posts.length;
    const currentPost = posts[currentPostIndex];
    const PAGE_HEIGHT = 930; // Matches Editor

    // ✨ Reset Page Index when Post changes
    React.useEffect(() => {
        setPageIndex(0);
        setContentHeight(0); // Reset height until measured
    }, [currentPostIndex]);

    // ✨ Calculate Total Pages
    // If height is 0 (loading), assume at least 1 page.
    const totalPages = contentHeight ? Math.ceil(contentHeight / PAGE_HEIGHT) : 1;

    const handleNext = () => {
        // Can we go to next spread in CURRENT post?
        // e.g. Spread 0 (Page 1-2). If totalPages 4. 0+2 < 4? Yes -> Go to 2 (Page 3-4).
        if (pageIndex + 2 < totalPages) {
            setPageIndex(prev => prev + 2);
        } else if (currentPostIndex < totalPosts - 1) {
            // Go to Next Post
            setCurrentPostIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        // Can we go to prev spread in CURRENT post?
        if (pageIndex > 0) {
            setPageIndex(prev => prev - 2);
        } else if (currentPostIndex > 0) {
            // Go to Prev Post
            setCurrentPostIndex(prev => prev - 1);
            // Optionally could calculate last page of prev post, but starting at 0 is safer/simpler UX for now
        }
    };

    // ✨ Hidden Measurement Component
    // Renders the full post off-screen to calculate total scrollHeight
    const measureRef = React.useCallback((node: HTMLDivElement | null) => {
        if (node) {
            // Wait for images? Ideally ResizeObserver
            const ro = new ResizeObserver(entries => {
                for (let entry of entries) {
                    // Add small buffer?
                    setContentHeight(entry.contentRect.height);
                }
            });
            ro.observe(node);
            return () => ro.disconnect();
        }
    }, []);

    const PageContent = ({ post, pageOffset }: { post?: PostData, pageOffset: number }) => {
        if (!post) return <div className="w-full h-full bg-[#fdfbf7]"></div>;

        return (
            <div className="w-full h-full bg-white relative overflow-hidden group flex items-start justify-center p-6">
                <div className="w-full h-full relative flex items-start justify-center overflow-hidden">
                    <div style={{
                        width: '800px',
                        height: `${PAGE_HEIGHT}px`,
                        transform: 'scale(0.7)',
                        transformOrigin: 'top center',
                        position: 'absolute',
                        top: `-${pageOffset * PAGE_HEIGHT}px`,
                        transition: 'top 0.3s ease'
                    }}>
                        <MiniPostViewer
                            title={post.title}
                            titleStyles={post.titleStyles || {}}
                            styles={post.styles || {}}
                            blocks={post.blocks || []}
                            stickers={post.stickers || []}
                            floatingTexts={post.floatingTexts || []}
                            floatingImages={post.floatingImages || []}
                            scale={1}
                            minHeight="100%"
                            hideTitle={true} // ✨ Title Hidden
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-50"
            >
                <X size={32} />
            </button>

            {/* ✨ Measurement Sandbox (Hidden) */}
            <div className="absolute opacity-0 pointer-events-none -z-50 overflow-hidden" style={{ width: '800px', height: 'auto', left: 0, top: 0 }}>
                {currentPost && (
                    <div ref={measureRef} className="w-full h-auto">
                        <MiniPostViewer
                            title={currentPost.title}
                            titleStyles={currentPost.titleStyles || {}}
                            styles={currentPost.styles || {}}
                            blocks={currentPost.blocks || []}
                            stickers={currentPost.stickers || []}
                            floatingTexts={currentPost.floatingTexts || []}
                            floatingImages={currentPost.floatingImages || []}
                            scale={1}
                            minHeight="100%"
                            hideTitle={true} // ✨ Title Hidden (Content moves up)
                        />
                    </div>
                )}
            </div>

            {/* Book Container */}
            <div className="relative w-full max-w-6xl aspect-[3/2] flex shadow-2xl rounded-lg overflow-hidden bg-[#fdfbf7]">

                {/* Left Page (Part 1 + Spread) */}
                <div className="w-1/2 h-full relative border-r border-[#e0e0e0] overflow-hidden bg-white">
                    <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-10"></div>
                    <PageContent post={currentPost} pageOffset={pageIndex} />

                    {/* Page Number */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-serif">
                        {pageIndex + 1}
                    </div>
                </div>

                {/* Right Page (Part 2 + Spread) */}
                <div className="w-1/2 h-full relative overflow-hidden bg-white">
                    <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-10"></div>
                    {/* Only render Right Page if it exists? Or render blank? 
                        Ideally render blank if pageIndex + 1 >= totalPages. 
                        But PageContent handles empty post gracefully? 
                        Let's just render it, it will be white space if offset is huge.
                    */}
                    <PageContent post={currentPost} pageOffset={pageIndex + 1} />

                    {/* Page Number */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-serif">
                        {pageIndex + 2}
                    </div>
                </div>

                {/* Navigation Controls */}
                {(currentPostIndex > 0 || pageIndex > 0) && (
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 rounded-full shadow-lg flex items-center justify-center hover:bg-white text-gray-800 z-20 transition-transform hover:scale-110"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}
                {/* Show Next if: More pages in THIS post OR More posts available */}
                {((pageIndex + 2 < totalPages) || (currentPostIndex < totalPosts - 1)) && (
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 rounded-full shadow-lg flex items-center justify-center hover:bg-white text-gray-800 z-20 transition-transform hover:scale-110"
                    >
                        <ChevronRight size={24} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default PostBookView;
