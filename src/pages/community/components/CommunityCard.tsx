import React from 'react';
import { Heart, Eye, MessageCircle } from 'lucide-react';
import type { CommunityResponse } from '../types';
import MiniPostViewer from "./MiniPostPreview.tsx";

interface CommunityCardProps {
    data: CommunityResponse;
    onClick: () => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ data, onClick }) => {
    const tags = data.tags || [];

    const hasContent = (data.blocks && data.blocks.length > 0) ||
        (data.stickers && data.stickers.length > 0) ||
        (data.floatingImages && data.floatingImages.length > 0) ||
        data.title;

    return (
        <div
            className="group relative w-full aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
            onClick={onClick}
        >
            {/* 1. 배경 */}
            <div className="absolute inset-0 bg-white">
                {hasContent ? (
                    <div className="w-full h-full overflow-hidden">
                        <div className="origin-top-left">
                            <MiniPostViewer
                                title={data.title}
                                titleStyles={data.titleStyles || {}}
                                blocks={data.blocks || []}
                                stickers={data.stickers || []}
                                floatingTexts={data.floatingTexts || []}
                                floatingImages={data.floatingImages || []}
                                scale={0.38}
                                minHeight="100%"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                        <span className="text-4xl mb-2 grayscale">📄</span>
                        <span className="text-sm">빈 페이지</span>
                    </div>
                )}
            </div>

            {/* 2. 그라데이션 */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/60 pointer-events-none" />

            {/* 3. 상단 정보 (조회수 이동됨 ✨) */}
            <div className="absolute top-3 right-3 z-10">
                <div className="flex items-center gap-1 bg-black/20 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 shadow-sm">
                    <Eye className="w-3 h-3 text-white/80" />
                    <span className="text-[9px] sm:text-[10px] font-medium text-white/90">{data.viewCount}</span>
                </div>
            </div>

            {/* 4. 하단 정보 영역 */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex flex-col gap-1.5 sm:gap-2 z-10">

                {/* 태그 */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {tags.slice(0, 3).map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-medium border border-white/10"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* 날짜 */}
                <span className="self-end text-[9px] text-white/70 bg-black/20 px-1.5 py-[2px] rounded-md backdrop-blur-sm whitespace-nowrap">
                    {new Date(data.createdAt).toLocaleDateString()}
                </span>

                {/* 하단 줄: 작성자 <-> 좋아요/댓글 */}
                <div className="flex items-center justify-between">

                    {/* 작성자 */}
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 flex items-center justify-center text-[9px] sm:text-[10px] text-white font-bold shadow-sm transition-all">
                            {data.writerNickname.charAt(0)}
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-semibold text-white drop-shadow-md truncate max-w-[70px] sm:max-w-[100px]">
                            {data.writerNickname}
                        </span>
                    </div>

                    {/* 통계 배지 (조회수 빠짐) */}
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-black/40 backdrop-blur-md px-2 py-1 sm:px-2.5 sm:py-1 rounded-full border border-white/10 shadow-lg transition-all">

                        {/* 좋아요 */}
                        <div className={`flex items-center gap-0.5 ${data.isLiked ? 'text-pink-400' : 'text-white'}`}>
                            <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill={data.isLiked ? "currentColor" : "none"} />
                            <span className="text-[9px] sm:text-[10px] font-medium text-white ml-0.5">{data.likeCount}</span>
                        </div>

                        <div className="w-[1px] h-2 sm:h-2.5 bg-white/20"></div>

                        {/* 댓글 */}
                        <div className="flex items-center gap-0.5 text-white">
                            <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span className="text-[9px] sm:text-[10px] font-medium ml-0.5">{data.commentCount || 0}</span>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityCard;