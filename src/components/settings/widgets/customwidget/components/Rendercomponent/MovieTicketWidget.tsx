import React, { useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp, Clapperboard, Film, MessageSquare } from "lucide-react";
import type { WidgetBlock } from "../../types.ts";

interface Props {
    block: WidgetBlock;
    onUpdateBlock: (id: string, updates: any) => void;
}

const MovieTicketWidget: React.FC<Props> = ({ block }) => {
    const { styles } = block;
    const content = block.content || {};
    const movieData = content.movieData || null;

    // 감상평 토글 상태 (로컬)
    const [showReview, setShowReview] = useState(content.isReviewOpen || false);

    return (
        <div className="w-full h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative group">




            {/* 1. 데이터가 없을 때 (빈 상태) */}
            {/* 1. 데이터가 없을 때 (빈 상태) */}
            {!movieData ? (
                <div
                    className="w-full h-full min-h-[120px] bg-gray-50 flex flex-col items-center justify-center p-4 text-center text-gray-400"
                >
                    <Clapperboard className="mx-auto mb-2" size={28} />
                    <p className="text-sm font-bold">영화 정보가 없습니다</p>
                    <p className="text-xs mt-1">설정 패널에서 영화를 검색하세요</p>
                </div>
            ) : (
                /* 2. 데이터가 있을 때 (티켓 뷰) */
                <>
                    {/* 상단: 포스터 + 기본 정보 */}
                    <div className="flex h-32 relative">
                        {/* 배경 흐림 효과 (옵션) */}
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-10 blur-sm"
                            style={{ backgroundImage: `url(${movieData.poster || 'nothing'})` }}
                        />

                        {/* 왼쪽: 포스터 (없으면 아이콘) */}
                        <div className="w-24 h-full flex-shrink-0 relative z-10 bg-gray-900 border-r border-gray-200 overflow-hidden">
                            {movieData.poster ? (
                                <img src={movieData.poster} alt="poster" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-1">
                                    <Film size={20} />
                                    <span className="text-[9px] text-gray-500">No Image</span>
                                </div>
                            )}
                        </div>

                        {/* 오른쪽: 정보 */}
                        <div className="flex-1 p-3 flex flex-col justify-between relative z-10 min-w-0 bg-transparent">
                            <div>
                                <h3 style={{ color: styles.color }} className="text-lg font-black text-gray-900 truncate leading-tight tracking-tight">
                                    {movieData.title}
                                </h3>
                                <div className="text-xs text-gray-500 font-medium mt-0.5 flex flex-wrap gap-1">
                                    <span>{movieData.year}</span>
                                    {movieData.director && <span>· {movieData.director}</span>}
                                    {movieData.genre && <span className="text-gray-400">· {movieData.genre.split(',')[0]}</span>}
                                </div>
                            </div>

                            <div className="space-y-1">
                                {/* 관람 날짜 */}
                                <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold bg-indigo-50/80 w-fit px-2 py-1 rounded backdrop-blur-[2px]">
                                    <CalendarDays size={12} />
                                    <span>{content.watchedDate || '날짜 미입력'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 하단: 감상평 토글 영역 */}
                    <div className="bg-gray-50 border-t border-dashed border-gray-300 flex flex-col flex-1 min-h-0 relative z-20">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowReview(!showReview);
                            }}
                            className="w-full py-1.5 flex items-center justify-center gap-1 text-[10px] font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            {showReview ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {showReview ? '감상평 접기' : '나의 감상평 보기'}
                        </button>

                        {/* 감상평 내용 */}
                        {showReview && (
                            <div className="p-3 pt-0 flex-1 overflow-y-auto scrollbar-thin nodrag cursor-text" onWheelCapture={e => e.stopPropagation()}>
                                {content.review ? (
                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                                        <MessageSquare size={12} className="inline mr-1 text-gray-400 -mt-0.5" />
                                        {content.review}
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-400 italic text-center py-2">
                                        작성된 감상평이 없습니다.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

        </div>
    );
};
export default MovieTicketWidget;