import React, { useState, useEffect } from 'react';
import { X, Heart, Eye } from 'lucide-react';
import type { CommunityResponse } from '../types';
import { toggleCommunityLike } from '../api';

interface CommunityDetailModalProps {
    data: CommunityResponse;
    isOpen: boolean;
    onClose: () => void;
    currentUserId?: number;
    onLikeToggle: (newStatus: boolean) => void;
}

const CommunityDetailModal: React.FC<CommunityDetailModalProps> = ({
    data,
    isOpen,
    onClose,
    currentUserId,
    onLikeToggle
}) => {
    const [likeState, setLikeState] = useState({
        isLiked: data.isLiked,
        count: data.likeCount
    });

    // Reset state when data changes
    useEffect(() => {
        setLikeState({
            isLiked: data.isLiked,
            count: data.likeCount
        });
    }, [data]);

    if (!isOpen) return null;

    const handleLikeClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUserId) {
            alert("로그인이 필요한 서비스입니다.");
            return;
        }

        // Optimistic Update
        const newIsLiked = !likeState.isLiked;
        const newCount = newIsLiked ? likeState.count + 1 : likeState.count - 1;

        setLikeState({ isLiked: newIsLiked, count: newCount });
        onLikeToggle(newIsLiked); // Notify parent for sync

        try {
            await toggleCommunityLike(data.communityId, currentUserId);
        } catch (error) {
            // Revert on error
            setLikeState({ isLiked: !newIsLiked, count: likeState.count });
            onLikeToggle(!newIsLiked);
            console.error("Failed to toggle like:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto theme-bg-modal rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b theme-border theme-bg-header backdrop-blur-md rounded-t-3xl text-white">
                    <h2 className="text-xl font-bold truncate pr-8 theme-text-primary">
                        {data.title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-black/5 transition-colors theme-icon"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 space-y-6">
                    {/* Meta Info */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
                                {data.writerNickname.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold theme-text-primary">{data.writerNickname}</p>
                                <p className="text-xs theme-text-secondary opacity-70">
                                    {new Date(data.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="min-h-[200px] theme-text-primary whitespace-pre-wrap leading-relaxed opacity-90">
                        <div className="p-4 theme-bg-card-secondary rounded-xl">
                            {/* Placeholder for actual content if API provided it, but checking spec Response only gives title/metadata. 
                                Assuming 'title' functions as content or additional fetch needed? 
                                Re-reading: "postId: 원본 게시글 PK (상세 내용 조회 시 필요)"
                                This implies we might need to fetch the *Post* content separately or it's embedded?
                                For now displaying title detailedly or if there's no body field in response, we use title.
                            */}
                            <p className="text-lg font-medium">{data.title}</p>
                            <div className="mt-8 text-sm theme-text-secondary text-center p-4 border border-dashed rounded-lg theme-border">
                                게시글 상세 내용은 Post 도메인과 연동이 필요할 수 있습니다. <br />
                                (현재 CommunityResponse에 본문 필드 부재)
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-6 border-t theme-border">
                        <button
                            onClick={handleLikeClick}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 font-medium ${likeState.isLiked
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600'
                                : 'theme-bg-card border theme-border theme-text-primary hover:bg-black/5'
                                }`}
                        >
                            <Heart
                                size={20}
                                className={likeState.isLiked ? 'fill-current' : ''}
                            />
                            <span>좋아요 {likeState.count}</span>
                        </button>

                        <div className="flex items-center gap-2 px-4 py-2 theme-text-secondary">
                            <Eye size={20} />
                            <span>{data.viewCount} 읽음</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityDetailModal;
