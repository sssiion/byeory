import React from 'react';
import { Heart, Eye } from 'lucide-react';
import type { CommunityResponse } from '../types';

interface CommunityCardProps {
    data: CommunityResponse;
    onClick: () => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ data, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="theme-bg-card rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group border theme-border"
        >
            <div className="flex flex-col gap-3">
                {/* Header: Title and Writer */}
                <div className="flex justify-between items-start gap-4">
                    <h3 className="text-xl font-bold theme-text-primary line-clamp-2 pb-1">
                        {data.title}
                    </h3>
                </div>

                <div className="flex items-center text-sm theme-text-secondary opacity-80 mb-2">
                    <span className="font-medium mr-2">{data.writerNickname}</span>
                    <span>•</span>
                    <span className="ml-2">{new Date(data.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Footer: Stats */}
                <div className="flex items-center gap-4 mt-2 text-sm theme-text-secondary">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10">
                        <Heart
                            size={16}
                            className={`transition-colors ${data.isLiked ? 'fill-red-500 text-red-500' : 'theme-icon'}`}
                        />
                        <span>{data.likeCount}</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10">
                        <Eye size={16} className="theme-icon" />
                        <span>{data.viewCount}</span>
                    </div>

                    {/* Placeholder for comments count if available later */}
                    {/* <div className="flex items-center gap-1.5">
                        <MessageCircle size={16} className="theme-text-secondary" />
                        <span>0</span>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default CommunityCard;
