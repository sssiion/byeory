import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
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
        setLoading(true);
        try {
            const response = await getCommunities(page, 10, currentUserId);

            setPosts(prev => {
                // Determine uniqueness by communityId to prevent dupes if StrictMode double-invokes
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
    // Note: Dependent on currentUserId to refetch with correct like status if user logs in late, 
    // but typically user ID is stable. If it changes, we might want to reset the list? 
    // For now simple append logic is safer, but let's reset if ID changes essentially.

    useEffect(() => {
        // If user ID changes (login/logout), reset list
        setPosts([]);
        setPage(0);
        setHasMore(true);
        // fetchPosts will run due to dependency
    }, [currentUserId]);

    const handleCardClick = async (post: CommunityResponse) => {
        try {
            // Fetch fresh details (incl view count increment)
            const detail = await getCommunityDetail(post.communityId, currentUserId);
            setSelectedPost(detail);
            setIsModalOpen(true);

            // Update local view count immediately
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

        // Update the list view to reflect the change made in modal
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
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
                {posts.map((post, index) => {
                    const isLast = index === posts.length - 1;
                    return (
                        <div ref={isLast ? lastElementRef : null} key={`${post.communityId}-${index}`}>
                            <CommunityCard
                                data={post}
                                onClick={() => handleCardClick(post)}
                            />
                        </div>
                    );
                })}
            </div>

            {loading && (
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin theme-text-primary" size={32} />
                </div>
            )}

            {!loading && !hasMore && posts.length > 0 && (
                <div className="text-center py-8 theme-text-secondary opacity-60">
                    모든 게시글을 불러왔습니다.
                </div>
            )}

            {!loading && posts.length === 0 && (
                <div className="text-center py-12 theme-text-secondary">
                    <p className="text-lg">등록된 게시글이 없습니다.</p>
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
