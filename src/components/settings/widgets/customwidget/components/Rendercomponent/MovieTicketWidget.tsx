import React, {useState} from "react";
import {CalendarDays, ChevronDown, ChevronUp, Clapperboard, Film, MessageSquare} from "lucide-react";
import type {WidgetBlock} from "../../types.ts";
import BookInfoWidget from "./BookInfoWidget.tsx";

interface Props {
    block: WidgetBlock; // 혹은 any
}
const MovieTicketWidget: React.FC<Props> = ({ block }) =>{
    const { styles } = block;
    const content = block.content || {};
    const movieData = content.movieData || null;

    // 감상평 토글 상태 (로컬)
    const [showReview, setShowReview] = useState(content.isReviewOpen || false);

    // 1. 데이터가 없을 때 (안내)
    if (!movieData) {
        return (
            <div className="w-full h-full min-h-[120px] bg-gray-900 rounded-xl border-2 border-dashed border-gray-700 flex flex-col items-center justify-center p-4 text-center select-none group">
                <Clapperboard className="mx-auto text-gray-600 mb-2 group-hover:text-indigo-400 transition-colors" size={24} />
                <p className="text-xs text-gray-500 font-bold mb-1">영화 정보가 없습니다</p>
                <p className="text-[10px] text-gray-600">오른쪽 메뉴에서<br/>영화를 검색하세요.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            {/* 상단: 포스터 + 기본 정보 */}
            <div className="flex h-32 relative">
                {/* 배경 흐림 효과 (옵션) */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-10 blur-sm"
                    style={{ backgroundImage: `url(${movieData.poster})` }}
                />

                {/* 왼쪽: 포스터 */}
                <div className="w-24 h-full flex-shrink-0 relative z-10 bg-black">
                    {movieData.poster ? (
                        <img src={movieData.poster} alt="poster" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <Film size={24}/>
                        </div>
                    )}
                </div>

                {/* 오른쪽: 정보 */}
                <div className="flex-1 p-3 flex flex-col justify-between relative z-10 min-w-0">
                    <div>
                        <h3 style={{ color: styles.color }} className="text-lg font-black text-gray-900 truncate leading-tight tracking-tight">
                            {movieData.title}
                        </h3>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">
                            {movieData.year} · {movieData.director || 'Director'}
                        </div>
                    </div>

                    <div className="space-y-1">
                        {/* 관람 날짜 */}
                        <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold bg-indigo-50 w-fit px-2 py-1 rounded">
                            <CalendarDays size={12} />
                            <span>{content.watchedDate || '날짜 미입력'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 하단: 감상평 토글 영역 */}
            <div className="bg-gray-50 border-t border-dashed border-gray-300 flex flex-col flex-1 min-h-0">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowReview(!showReview);
                    }}
                    className="w-full py-1.5 flex items-center justify-center gap-1 text-[10px] font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    {showReview ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                    {showReview ? '감상평 접기' : '나의 감상평 보기'}
                </button>

                {/* 감상평 내용 (애니메이션 효과) */}
                {showReview && (
                    <div className="p-3 pt-0 flex-1 overflow-y-auto scrollbar-thin nodrag" onWheelCapture={e=>e.stopPropagation()}>
                        {content.review ? (
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                                <MessageSquare size={12} className="inline mr-1 text-gray-400 -mt-0.5"/>
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
        </div>
    );
};
export default MovieTicketWidget;