import React, { useMemo } from 'react';
import { Heart, Eye, MessageCircle } from 'lucide-react';
import type { CommunityResponse } from '../types';

interface CommunityCardProps {
    data: CommunityResponse;
    onClick: () => void;
}

const getGradient = (id: number) => {
    const gradients = [
        'bg-gradient-to-br from-pink-500/20 via-rose-400/20 to-orange-400/20',
        'bg-gradient-to-br from-violet-500/20 via-purple-400/20 to-indigo-400/20',
        'bg-gradient-to-br from-cyan-400/20 via-blue-400/20 to-indigo-500/20',
        'bg-gradient-to-br from-emerald-400/20 via-teal-400/20 to-cyan-500/20',
        'bg-gradient-to-br from-orange-400/20 via-amber-400/20 to-yellow-400/20',
        'bg-gradient-to-br from-fuchsia-400/20 via-purple-400/20 to-pink-500/20'
    ];
    return gradients[id % gradients.length];
};

const CommunityCard: React.FC<CommunityCardProps> = ({ data, onClick }) => {
    const gradientClass = useMemo(() => getGradient(data.postId), [data.postId]);
    const tags = data.tags || [];

    return (
        <div
            onClick={onClick}
            className="group break-inside-avoid bg-[var(--bg-card)] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 mb-6 border border-[var(--border-color)]/60"
        >
            {/* Image / Thumbnail Area */}
            <div className={`w-full aspect-[4/3] relative overflow-hidden ${gradientClass}`}>
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.1) 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                }} />

                {/* Center Content Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center p-6">
                    <h3 className="text-xl font-bold text-black/10 mix-blend-overlay text-center line-clamp-3 select-none">
                        {data.title}
                    </h3>
                </div>
            </div>

            {/* Info Area */}
            <div className="p-4 space-y-3">
                {/* Title & User */}
                <div>
                    <h4 className="font-bold text-[var(--text-primary)] text-lg leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1">
                        {data.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                        <span className="font-medium hover:text-[var(--text-primary)] transition-colors">{data.writerNickname}</span>
                        <span>{new Date(data.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {tags.slice(0, 4).map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs font-medium hover:text-indigo-500 transition-colors">
                                #{tag}
                            </span>
                        ))}
                        {tags.length > 4 && (
                            <span className="text-xs text-[var(--text-secondary)] self-center">+{tags.length - 4}</span>
                        )}
                    </div>
                )}

                {/* Stats Footer */}
                <div className="flex items-center justify-end gap-3 pt-2 mt-1 border-t border-[var(--border-color)]/30 text-[var(--text-secondary)] text-sm font-medium">
                    <div className={`flex items-center gap-1 transition-colors ${data.isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}>
                        <Heart size={16} className={data.isLiked ? 'fill-pink-500' : ''} />
                        <span>{data.likeCount}</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-indigo-500 transition-colors">
                        <MessageCircle size={16} />
                        <span>{data.commentCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <Eye size={16} />
                        <span>{data.viewCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityCard;
