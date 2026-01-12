import React, { useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp, Clapperboard, Film, MessageSquare, Search, X, Loader2 } from "lucide-react";
import type { WidgetBlock } from "../../types.ts";

// 🌟 [KOFIC API] API 키 상수 (사용자가 직접 입력해야 함)
const KOFIC_API_KEY_PLACEHOLDER = "인증키를 넣어주세요"; // e.g. "82ca741a2844c5c180a208137bb92bd7"

interface Props {
    block: WidgetBlock;
    onUpdateBlock: (id: string, updates: any) => void;
}

const MovieTicketWidget: React.FC<Props> = ({ block, onUpdateBlock }) => {
    const { styles } = block;
    const content = block.content || {};
    const movieData = content.movieData || null;

    // 감상평 토글 상태 (로컬)
    const [showReview, setShowReview] = useState(content.isReviewOpen || false);

    // 🌟 [검색] 검색 패널 상태
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [apiKey, setApiKey] = useState(content.koficApiKey || KOFIC_API_KEY_PLACEHOLDER);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // KOFIC 영화 검색 API 호출
    const searchMovies = async () => {
        if (!searchQuery.trim()) return;
        if (apiKey === KOFIC_API_KEY_PLACEHOLDER || !apiKey) {
            setErrorMsg("API 인증키를 입력해주세요.");
            return;
        }

        setIsLoading(true);
        setErrorMsg(null);
        setSearchResults([]);

        try {
            // REST 요청 URL 구성
            const baseUrl = "http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieList.json";
            const url = `${baseUrl}?key=${apiKey}&movieNm=${encodeURIComponent(searchQuery)}&itemPerPage=10`;

            const res = await fetch(url);
            const data = await res.json();

            if (data.faultInfo) {
                throw new Error(data.faultInfo.message);
            }

            const list = data.movieListResult?.movieList || [];
            if (list.length === 0) {
                setErrorMsg("검색 결과가 없습니다.");
            } else {
                setSearchResults(list);
            }
        } catch (err: any) {
            console.error("Movie Search Error:", err);
            setErrorMsg(err.message || "검색 중 오류가 발생했습니다. (CORS 문제가 발생할 수 있습니다. 브라우저 설정을 확인하거나 백엔드 프록시가 필요합니다)");
        } finally {
            setIsLoading(false);
        }
    };

    // 영화 선택 핸들러
    const handleSelectMovie = (movie: any) => {
        // KOFIC 데이터 매핑
        const newMovieData = {
            title: movie.movieNm,
            year: movie.prdtYear || movie.openDt?.substring(0, 4) || '',
            director: movie.directors?.[0]?.peopleNm || '',
            poster: '', // KOFIC은 포스터 미제공 -> 추후 입력 받거나 기본값
            // 추가 메타데이터 저장 가능
            movieCd: movie.movieCd,
            genre: movie.genreAlt,
            nation: movie.nationAlt,
        };

        onUpdateBlock(block.id, {
            content: {
                ...content,
                movieData: newMovieData,
                koficApiKey: apiKey // API 키 저장 (편의성)
            }
        });
        setIsSearchOpen(false); // 패널 닫기
    };

    return (
        <div className="w-full h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative group">

            {/* 🌟 [검색 버튼] 우측 상단 플로팅 (항상 접근 가능) */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsSearchOpen(true);
                }}
                className="absolute top-2 right-2 z-30 p-1.5 bg-white/80 hover:bg-white text-gray-400 hover:text-indigo-600 rounded-full shadow-sm border border-gray-200 backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
                title="영화 검색"
            >
                <Search size={14} />
            </button>


            {/* 1. 데이터가 없을 때 (빈 상태) */}
            {!movieData ? (
                <div
                    onClick={() => setIsSearchOpen(true)}
                    className="w-full h-full min-h-[120px] bg-gray-50 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                >
                    <Clapperboard className="mx-auto text-gray-400 mb-2" size={28} />
                    <p className="text-sm text-gray-600 font-bold">영화 정보가 없습니다</p>
                    <p className="text-xs text-gray-400 mt-1">클릭하여 영화 검색하기</p>
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

            {/* 🌟 [검색 패널] 오른쪽 사이드바 오버레이 */}
            {isSearchOpen && (
                <div
                    className="absolute inset-0 z-40 bg-white flex flex-col shadow-xl animate-in slide-in-from-right duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 헤더 */}
                    <div className="flex items-center justify-between p-3 border-b border-gray-100">
                        <span className="text-sm font-bold text-gray-800 flex items-center gap-1">
                            <Clapperboard size={14} className="text-indigo-600" />
                            영화 검색
                        </span>
                        <button
                            onClick={() => setIsSearchOpen(false)}
                            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* 검색 폼 */}
                    <div className="p-3 bg-gray-50 border-b border-gray-100 flex flex-col gap-2">
                        {/* API 키 입력 (저장되지 않은 경우 placeholder) */}
                        <div className="relative">
                            <input
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="KOFIC API 인증키"
                                className={`w-full text-xs px-2 py-1.5 border rounded focus:outline-none focus:border-indigo-500 font-mono ${apiKey === KOFIC_API_KEY_PLACEHOLDER ? 'text-red-400 border-red-200 bg-red-50' : 'text-gray-600 border-gray-200 bg-white'}`}
                            />
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && searchMovies()}
                                placeholder="영화 제목 입력..."
                                className="flex-1 text-sm px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:border-indigo-500 bg-white"
                            />
                            <button
                                onClick={searchMovies}
                                disabled={isLoading}
                                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center min-w-[50px]"
                            >
                                {isLoading ? <Loader2 size={14} className="animate-spin" /> : '검색'}
                            </button>
                        </div>
                        {errorMsg && (
                            <p className="text-[10px] text-red-500">{errorMsg}</p>
                        )}
                    </div>

                    {/* 결과 리스트 */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin p-1">
                        {searchResults.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                                <Search size={20} className="opacity-20" />
                                <span>검색 결과가 여기에 표시됩니다</span>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {searchResults.map((movie) => (
                                    <div
                                        key={movie.movieCd}
                                        onClick={() => handleSelectMovie(movie)}
                                        className="p-2 hover:bg-indigo-50 rounded-lg cursor-pointer border border-transparent hover:border-indigo-100 group transition-all"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm font-bold text-gray-800 group-hover:text-indigo-700 line-clamp-1">
                                                {movie.movieNm}
                                            </span>
                                            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 rounded-full shrink-0">
                                                {movie.prdtYear || movie.openDt?.substring(0, 4) || '-'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end mt-1">
                                            <div className="text-xs text-gray-500 flex flex-col">
                                                <span className="line-clamp-1">{movie.directors?.[0]?.peopleNm || '감독 미상'}</span>
                                                <span className="text-[10px] text-gray-400">{movie.nationAlt} | {movie.genreAlt}</span>
                                            </div>
                                            <span className="text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100">선택</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 수동 포스터 입력 (Optional) */}
                    {/* KOFIC 은 포스터를 안주므로... */}
                    <div className="p-3 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-400 text-center">
                        * KOFIC API는 포스터 이미지를 제공하지 않습니다.<br />
                        (필요 시 위젯 설정에서 URL을 수정하세요)
                    </div>
                </div>
            )}
        </div>
    );
};
export default MovieTicketWidget;