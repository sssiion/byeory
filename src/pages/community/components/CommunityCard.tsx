import React, { useMemo } from 'react';
import { Heart, Eye, User } from 'lucide-react';
import type { CommunityResponse } from '../types';

interface CommunityCardProps {
    data: CommunityResponse;
    onClick: () => void;
}

// ✨ Generate random gradient based on ID
const getGradient = (id: number) => {
    const gradients = [
        'from-pink-500 via-rose-400 to-orange-400',
        'from-violet-500 via-purple-400 to-indigo-400',
        'from-cyan-400 via-blue-400 to-indigo-500',
        'from-emerald-400 via-teal-400 to-cyan-500',
        'from-orange-400 via-amber-400 to-yellow-400',
        'from-fuchsia-400 via-purple-400 to-pink-500'
    ];
    return gradients[id % gradients.length];
};

const CommunityCard: React.FC<CommunityCardProps> = ({ data, onClick }) => {
    const gradient = useMemo(() => getGradient(data.communityId), [data.communityId]);

    return (
        <div
            onClick={onClick}
            className="group relative bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full min-h-[280px]"
        >
            {/* ✨ Decorative Gradient Header/Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500`} />

            {/* ✨ Top Gradient Line */}
            <div className={`h-2 w-full bg-gradient-to-r ${gradient} opacity-80`} />

            <div className="relative p-6 flex-1 flex flex-col">
                {/* Header: User & Date */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
                        <User size={12} />
                        <span>{data.writerNickname}</span>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(data.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 line-clamp-3 leading-relaxed group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {data.title}
                </h3>

                {/* Spacer to push footer down */}
                <div className="flex-1" />

                {/* Footer: Stats */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100/50 dark:border-white/5">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${data.isLiked ? 'bg-red-50 text-red-500' : 'bg-gray-100/50 text-gray-500 group-hover:bg-white/80'}`}>
                        <Heart
                            size={16}
                            className={`transition-transform duration-300 ${data.isLiked ? 'fill-red-500' : 'group-hover:scale-110'}`}
                        />
                        <span>{data.likeCount}</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100/50 text-gray-500 text-sm font-medium group-hover:bg-white/80 transition-all">
                        <Eye size={16} />
                        <span>{data.viewCount}</span>
                    </div>
                </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500/20 rounded-3xl transition-all duration-500 pointer-events-none" />
        </div>
    );
};

export default CommunityCard;
