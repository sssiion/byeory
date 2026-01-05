import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, RefreshCw, MessageSquare } from "lucide-react";
import Navigation from '../../../components/Header/Navigation';

// 백엔드 데이터 타입 정의
interface PersonaData {
    analysisResult: string;
    emotionKeywords: string;
}

function AnalysisPage() {
    const navigate = useNavigate();
    const [data, setData] = useState<PersonaData | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. 초기 데이터 로드 (GET)
    const fetchPersona = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/persona', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                // 204 No Content 등 데이터가 없는 경우 처리
                if (response.status === 204) {
                    setData(null);
                } else {
                    const text = await response.text();
                    if (text) {
                        const jsonData = JSON.parse(text);
                        // 분석 불가능한 경우도 데이터로 처리하지만 UI에서 구분
                        setData(jsonData);
                    } else {
                        setData(null);
                    }
                }
            } else if (response.status === 404) {
                // 데이터 없음
                setData(null);
            } else {
                console.warn("Failed to fetch persona");
            }
        } catch (e) {
            console.error("API Error:", e);
            setError("데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPersona();
    }, [navigate]);

    // 2. 분석 요청 (POST)
    const handleAnalyze = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        setAnalyzing(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8080/api/persona/analyze', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                // 분석 완료 후 다시 조회하여 최신 데이터 반영
                await fetchPersona();
            } else {
                const errText = await response.text();
                setError(errText || "분석 요청에 실패했습니다.");
            }
        } catch (e) {
            console.error("Analyze Error:", e);
            setError("분석 중 오류가 발생했습니다.");
        } finally {
            setAnalyzing(false);
        }
    };

    // 로딩 화면
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 theme-bg-card">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 theme-border mb-4"></div>
                <p className="theme-text-secondary animate-pulse">데이터를 불러오는 중...</p>
            </div>
        );
    }

    // 분석 불가 상태 체크
    const isInsufficientData = data?.analysisResult === "게시물을 더 작성해주세요" || data?.emotionKeywords === "분석 불가";
    const hasData = data && !isInsufficientData;

    return (
        <div className="min-h-screen pb-10 animate-fade-in relative">
            {/* 네비게이션: 상위 부모가 flex 상태가 아니어야 width: 100% 정상 작동 */}
            <Navigation />

            <main className="w-full max-w-2xl mx-auto px-4 py-8 pt-10 md:pt-20 space-y-8">

                {/* 상단 컨트롤 바: 뒤로가기 + (데이터 있으면) 뱃지 */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 transition-colors theme-text-secondary"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">돌아가기</span>
                    </button>

                    {hasData && (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900 shadow-sm animate-pulse">
                            AI Insight
                        </span>
                    )}
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className="p-3 rounded-xl bg-red-100 text-red-600 text-sm break-keep">
                        {error}
                    </div>
                )}

                {/* 1. 분석 결과 섹션 (데이터가 있을 때) */}
                {hasData ? (
                    <>
                        <section className="space-y-6">
                            {/* 상단 타이틀 */}
                            <div className="text-center space-y-2 pt-4">
                                <h2 className="text-2xl font-bold theme-text-primary leading-tight break-keep">
                                    "당신의 기록에서 발견한<br />특별한 패턴입니다"
                                </h2>
                            </div>

                            {/* 분석 텍스트 카드 */}
                            <div className="theme-bg-card p-6 rounded-2xl shadow-sm border theme-border relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--btn-bg)] to-transparent opacity-50"></div>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-lg bg-[var(--bg-card-secondary)] shrink-0">
                                        <MessageSquare className="w-6 h-6 theme-icon" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-bold theme-text-primary text-lg">AI 분석 결과</h3>
                                        <p className="theme-text-secondary leading-relaxed whitespace-pre-line text-sm md:text-base">
                                            {data!.analysisResult}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 조약돌 키워드 섹션 */}
                            <div className="theme-bg-card p-6 rounded-2xl shadow-sm border theme-border">
                                <h3 className="font-bold theme-text-primary mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 theme-text-primary" />
                                    감정 키워드
                                </h3>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {data!.emotionKeywords.split(',').map((keyword, idx) => (
                                        <div
                                            key={idx}
                                            className="px-4 py-2 rounded-full theme-bg-card-secondary border theme-border theme-text-primary font-medium text-sm shadow-sm transition-transform hover:scale-105 cursor-default select-none"
                                        >
                                            {keyword.trim()}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </>
                ) : (
                    // 데이터가 없거나 부족할 때
                    <section className="flex flex-col items-center justify-center text-center space-y-6 py-20">
                        <div className="w-24 h-24 rounded-full theme-bg-card border theme-border flex items-center justify-center mb-4 shadow-inner">
                            <Sparkles className="w-10 h-10 theme-icon opacity-50" />
                        </div>
                        <div className="space-y-2 max-w-xs mx-auto">
                            <h2 className="text-xl font-bold theme-text-primary">
                                {isInsufficientData ? "데이터가 조금 더 필요해요" : "아직 분석 데이터가 없어요"}
                            </h2>
                            <p className="theme-text-secondary text-sm break-keep">
                                {isInsufficientData
                                    ? "더 정확한 분석을 위해 일기를 조금 더 작성해주세요. 기록이 쌓이면 당신만의 페르소나를 발견할 수 있습니다."
                                    : "지금 바로 AI 분석을 통해 내면의 감정과 글쓰기 스타일을 확인해보세요."
                                }
                            </p>
                        </div>
                    </section>
                )}

                {/* 하단 액션 버튼 */}
                <div className="pt-4 pb-8 flex justify-center">
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className={`
                            theme-btn px-8 py-4 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all w-full md:w-auto justify-center
                            ${analyzing ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                        `}
                    >
                        {analyzing ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span>AI가 열심히 분석 중...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                <span>{hasData ? '다시 분석하기' : 'AI 분석 시작하기'}</span>
                            </>
                        )}
                    </button>
                </div>

            </main>
        </div>
    );
}

export default AnalysisPage;