import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CommunityResponse } from '../types';
import { getCommunities, getCommunityDetail } from '../api';
import CommunityCard from './CommunityCard';
import CommunityDetailModal from './CommunityDetailModal';

interface CommunityFeedProps {
    currentUserId?: number;
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ currentUserId }) => {
    const [posts, setPosts] = useState<CommunityResponse[]>([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedPost, setSelectedPost] = useState<CommunityResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const fetchPosts = async () => {
        if (!hasMore && page > 0) return; // ✨ Prevent fetching if no more data

        setLoading(true);
        try {
            const response = await getCommunities(page, 12, currentUserId); // ✨ Increased page size for grid

            setPosts(prev => {
                const existingIds = new Set(prev.map(p => p.communityId));
                const newPosts = response.content.filter(p => !existingIds.has(p.communityId));
                return [...prev, ...newPosts];
            });

            setHasMore(!response.last);
        } catch (error) {
            console.error("Failed to fetch communities:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [page, currentUserId]);

    useEffect(() => {
        setPosts([]);
        setPage(0);
        setHasMore(true);
    }, [currentUserId]);

    const handleCardClick = async (post: CommunityResponse) => {
        try {
            const detail = await getCommunityDetail(post.communityId, currentUserId);
            setSelectedPost(detail);
            setIsModalOpen(true);

            setPosts(prev => prev.map(p =>
                p.communityId === post.communityId
                    ? { ...p, viewCount: detail.viewCount }
                    : p
            ));
        } catch (error) {
            console.error("Failed to open detail:", error);
        }
    };

    const handleLikeToggle = (newStatus: boolean) => {
        if (!selectedPost) return;
        setPosts(prev => prev.map(p => {
            if (p.communityId === selectedPost.communityId) {
                return {
                    ...p,
                    isLiked: newStatus,
                    likeCount: newStatus ? p.likeCount + 1 : p.likeCount - 1
                };
            }
            return p;
        }));
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                <AnimatePresence>
                    {posts.map((post, index) => {
                        return (
                            <motion.div
                                key={`${post.communityId}-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index % 12 * 0.05 }}
                                layout // ✨ Smooth layout changes
                            >
                                <CommunityCard
                                    data={post}
                                    onClick={() => handleCardClick(post)}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* ✨ Sentinel for Infinite Scroll (Separate from Card) */}
            <div ref={lastElementRef} className="h-4" />

            {loading && (
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                </div>
            )}

            {!loading && !hasMore && posts.length > 0 && (
                <div className="text-center py-8 text-gray-400 opacity-80 text-sm">
                    ✨ 모든 게시글을 확인했습니다
                </div>
            )}

            {!loading && posts.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-xl font-light">아직 등록된 게시글이 없습니다. 첫 글을 작성해보세요!</p>
                </div>
            )}

            {selectedPost && (
                <CommunityDetailModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    data={selectedPost}
                    currentUserId={currentUserId}
                    onLikeToggle={handleLikeToggle}
                />
            )}
        </div>
    );
};

export default CommunityFeed;
