import React, { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PostData } from '../types';
import MiniPostViewer from '../components/MiniPostPreview';

interface PostBookViewProps {
    posts: PostData[];
    onClose: () => void;
    startIndex?: number;
}

const PostBookView: React.FC<PostBookViewProps> = ({ posts, onClose, startIndex = 0 }) => {
    const [currentPostIndex, setCurrentPostIndex] = useState(startIndex);
    const [pageIndex, setPageIndex] = useState(0); // 0, 2, 4... (Spread index)

    const totalPosts = posts.length;
    const currentPost = posts[currentPostIndex];
    const PAGE_HEIGHT = 930; // Matches Editor

    // ✨ Pagination Logic (User Heuristic: 9 units per page)
    const pages = useMemo(() => {
        if (!currentPost || !currentPost.blocks) return [[]];

        const blocks = currentPost.blocks;
        const PAGE_CAPACITY = 9;
        const resultPages: any[][] = [];
        let currentPage: any[] = [];
        let currentWeight = 0;

        blocks.forEach((block) => {
            let weight = 1; // Default Text/List
            // Heuristic for image weight
            if (block.type && (block.type.startsWith('image') || block.type === 'image-full' || block.type === 'image-double' || block.type === 'image-left' || block.type === 'image-right')) {
                weight = 3;
            }

            // If adding fits?
            if (currentWeight + weight <= PAGE_CAPACITY) {
                currentPage.push(block);
                currentWeight += weight;
            } else {
                // Determine if we should push to next page
                // If it doesn't fit, we finalize current page and start new one
                // Fill remainder of current page with spacers? Not needed if we just render what we have.
                // The user wants "fill the white part". So if we stop here, the rest is white space. Correct.

                resultPages.push(currentPage);
                currentPage = [block];
                currentWeight = weight;
            }

            // Exact fit check
            if (currentWeight === PAGE_CAPACITY) {
                resultPages.push(currentPage);
                currentPage = [];
                currentWeight = 0;
            }
        });

        if (currentPage.length > 0) {
            resultPages.push(currentPage);
        }

        if (resultPages.length === 0) return [[]];
        return resultPages;
    }, [currentPost]);

    // ✨ Filter floating items per page
    const getPageItems = (items: any[], pageIdx: number) => {
        if (!items) return [];
        // Floating items are absolute positioned.
        // We assume 1 Page Height = 1 logical page for floating items (approx).
        // Since we are paging blocks somewhat arbitrarily (9 units), mapping absolute Y to these pages is tricky.
        // HOWEVER, the user edits in a continuous vertical scroll (Editor).
        // If we strictly enforce 9 units = 1 Page, we should ideally map Y coordinates to this.
        // But the editor height might not match 9 units.
        // Let's assume the user places items visually on "Page 1 area", "Page 2 area".
        // Use PAGE_HEIGHT (930px) as the slicer for floating items.

        const startY = pageIdx * PAGE_HEIGHT;
        const endY = (pageIdx + 1) * PAGE_HEIGHT;

        return items.filter(item => {
            const y = Number(item.y ?? item.top ?? 0);
            return y >= startY && y < endY;
        }).map(item => ({
            ...item,
            y: Number(item.y ?? item.top ?? 0) - startY, // Shift to top of page
            top: Number(item.y ?? item.top ?? 0) - startY
        }));
    };

    const totalPages = pages.length;

    // Reset page index on post change
    React.useEffect(() => {
        setPageIndex(0);
    }, [currentPostIndex]);

    const handleNext = () => {
        if (pageIndex + 2 < totalPages) {
            setPageIndex(prev => prev + 2);
        } else if (currentPostIndex < totalPosts - 1) {
            setCurrentPostIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (pageIndex > 0) {
            setPageIndex(prev => prev - 2);
        } else if (currentPostIndex > 0) {
            setCurrentPostIndex(prev => prev - 1);
        }
    };

    const PageContent = ({ post, pageIdx }: { post?: PostData, pageIdx: number }) => {
        if (!post) return <div className="w-full h-full bg-[#fdfbf7]"></div>;

        const pageBlocks = pages[pageIdx] || [];
        // If page doesn't exist (e.g. Right page of last spread), render empty
        if (pageIdx >= pages.length && pageIdx > 0) { // pageIdx 0 always exists structurally but maybe empty data
            // actually pages[pageIdx] handles undefined
        }

        const pageStickers = getPageItems(post.stickers || [], pageIdx);
        const pageFloatingTexts = getPageItems(post.floatingTexts || [], pageIdx);
        const pageFloatingImages = getPageItems(post.floatingImages || [], pageIdx);

        return (
            <div className="w-full h-full bg-white relative overflow-hidden group flex items-start justify-center p-6">
                <div className="w-full h-full relative flex items-start justify-center overflow-hidden">
                    {/* Render Content Scaled */}
                    <div style={{
                        width: '800px',
                        height: `${PAGE_HEIGHT}px`,
                        transform: 'scale(0.7)',
                        transformOrigin: 'top center',
                        position: 'absolute',
                        top: 0,
                    }}>
                        <MiniPostViewer
                            title={post.title}
                            titleStyles={post.titleStyles || {}}
                            styles={post.styles || {}}
                            blocks={pageBlocks}
                            stickers={pageStickers}
                            floatingTexts={pageFloatingTexts}
                            floatingImages={pageFloatingImages}
                            scale={1}
                            minHeight="100%"
                            hideTitle={pageIdx !== 0} // Only show title on Page 1
                            preserveTitleSpace={false}
                            paddingClass="px-24"
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300 overflow-y-auto">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-50"
            >
                <X size={32} />
            </button>

            {/* Book Container */}
            <div className="relative w-full max-w-6xl min-h-[760px] aspect-[3/2] flex shadow-2xl rounded-lg overflow-hidden bg-[#fdfbf7]">

                {/* Left Page */}
                <div className="w-1/2 h-full relative border-r border-[#e0e0e0] overflow-hidden bg-white">
                    <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-10"></div>
                    <PageContent post={currentPost} pageIdx={pageIndex} />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-serif">
                        {pageIndex + 1}
                    </div>
                </div>

                {/* Right Page */}
                <div className="w-1/2 h-full relative overflow-hidden bg-white">
                    <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-10"></div>
                    <PageContent post={currentPost} pageIdx={pageIndex + 1} />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-serif">
                        {pageIndex + 2}
                    </div>
                </div>

                {/* Navigation */}
                {(currentPostIndex > 0 || pageIndex > 0) && (
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 rounded-full shadow-lg flex items-center justify-center hover:bg-white text-gray-800 z-20 transition-transform hover:scale-110"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}
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
