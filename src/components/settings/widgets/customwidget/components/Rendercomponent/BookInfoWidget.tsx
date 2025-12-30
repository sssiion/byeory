// components/widgets/BookInfoWidget.tsx (경로는 프로젝트 구조에 맞게 조정하세요)
import React, { useState } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
// types 파일 위치에 따라 경로는 수정해주세요 (예: ../../types)
import type { WidgetBlock } from '../../types';

interface Props {
    block: WidgetBlock; // 혹은 any
}

const BookInfoWidget: React.FC<Props> = ({ block }) => {
    const { styles } = block;
    const content = block.content || {};
    const bookData = content.bookData || null;

    // 설명글 펼침/접힘 상태 관리
    const [isExpanded, setIsExpanded] = useState(false);

    // 1. 데이터가 없을 때 (안내 문구)
    if (!bookData) {
        return (
            <div className="w-full h-full min-h-[120px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4 text-center select-none">
                <BookOpen className="mx-auto text-gray-400 mb-2" size={24} />
                <p className="text-xs text-gray-500 font-bold mb-1">책 정보가 없습니다</p>
                <p className="text-[10px] text-gray-400">
                    블록을 선택하고<br/>오른쪽 메뉴에서 검색해주세요.
                </p>
            </div>
        );
    }

    // 설명글이 일정 길이 이상인지 확인
    const hasLongDesc = bookData.description && bookData.description.length > 60;

    // 2. 데이터가 있을 때 (책 정보 카드)
    return (
        <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full box-border">
            {/* 책 표지 */}
            <div className="flex-shrink-0 w-24 bg-gray-100 rounded overflow-hidden shadow-sm border border-gray-100 relative">
                {bookData.thumbnail ? (
                    <img src={bookData.thumbnail} alt={bookData.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <BookOpen size={24} />
                        <span className="text-[10px] mt-1">No Image</span>
                    </div>
                )}
            </div>

            {/* 책 정보 텍스트 영역 */}
            <div className="flex flex-col min-w-0 flex-1 h-full">
                {/* 제목 및 저자 */}
                <div className="flex-shrink-0 mb-2">
                    <h3 style={{ color: styles.color }} className="text-lg font-bold text-gray-900 truncate mb-1 leading-tight">
                        {bookData.title}
                    </h3>
                    <div className="text-xs text-gray-500 truncate">
                        {Array.isArray(bookData.authors) ? bookData.authors.join(', ') : bookData.authors}
                        {bookData.publisher && ` · ${bookData.publisher}`}
                    </div>
                </div>

                {/* 설명글 영역 (가변) */}
                <div className="flex-1 min-h-0 relative flex flex-col">
                    <div
                        className={`text-sm text-gray-600 leading-relaxed whitespace-pre-wrap w-full transition-all nodrag
                            ${isExpanded
                            ? 'overflow-y-auto scrollbar-thin h-full pr-1'
                            : 'line-clamp-3 overflow-hidden'
                        }
                        `}
                        onWheelCapture={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        {bookData.description || '책 소개가 없습니다.'}
                    </div>

                    {/* 더보기/접기 버튼 */}
                    {hasLongDesc && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="text-[10px] font-bold text-gray-400 hover:text-indigo-600 self-end mt-1 flex-shrink-0"
                        >
                            {isExpanded ? '접기 ▲' : '...더보기 ▼'}
                        </button>
                    )}
                </div>

                {/* 하단 날짜 및 링크 */}
                <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between flex-shrink-0">
                    <span className="text-[10px] text-gray-400">{bookData.publishedDate}</span>
                    {bookData.previewLink && (
                        <a
                            href={bookData.previewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5 opacity-80 hover:opacity-100 hover:underline cursor-pointer"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            미리보기 <ChevronRight size={10} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookInfoWidget;