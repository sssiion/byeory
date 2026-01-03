import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Heart, PenTool, Share2 } from "lucide-react";

// 백엔드 데이터 타입
interface AnalysisData {
    analysis: {
        summary: string;
        personality: string;
        emotionalState: string;
        writingStyle: string;
    };
    topWords: {
        word: string;
        type: string;
        count: number;
    }[];
}

function AnalysisPage() {
    const navigate = useNavigate();
    const [data, setData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 컴포넌트 내부에서만 사용할 애니메이션 스타일 (외부 CSS 파일 필요 없음)
    const keyframeStyles = `
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @keyframes reverse-spin {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
        }
        .animate-reverse-spin {
            animation: reverse-spin 25s linear infinite;
        }
    `;

    useEffect(() => {
        const fetchAnalysis = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
                navigate('/login');
                return;
            }

            setLoading(true);
            try {
                const response = await fetch('http://localhost:8080/api/posts/persona/analysis', { // 주소 변경
                    method: 'GET', // GET으로 변경
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });
                if (response.ok) {
                    const jsonData = await response.json();
                    setData(jsonData);
                } else if (response.status === 401) {
                    alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                    navigate('/login');
                } else {
                    // 데이터가 없거나 분석 실패 시 (서버 응답 파싱)
                    const errText = await response.text();
                    console.error("Analysis Error:", errText);
                    setError("데이터가 부족하거나 분석 중 오류가 발생했습니다.");
                }
            } catch (e) {
                console.error("API Error:", e);
                setError("서버와 연결할 수 없습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [navigate]);

    // 로딩 화면
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
                <p className="text-sm text-gray-500 animate-pulse text-center">
                    AI가 일기장을 분석하고 있어요...<br/>
                    <span className="text-xs text-gray-400">(약 5~10초 정도 소요됩니다)</span>
                </p>
            </div>
        );
    }

    // 에러 화면
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-gray-50 p-4 text-center">
                <div className="text-4xl">😢</div>
                <h2 className="text-lg font-bold text-gray-900">분석 실패</h2>
                <p className="text-sm text-gray-600">{error}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-6 py-2 bg-yellow-400 text-gray-900 rounded-lg font-medium shadow-sm hover:bg-yellow-500 transition-colors"
                >
                    돌아가기
                </button>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen pb-20 bg-gray-50 animate-fade-in font-sans">
            {/* 스타일 주입 (이 컴포넌트 안에서만 작동하는 애니메이션) */}
            <style>{keyframeStyles}</style>

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200 px-4 h-14 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-800" />
                </button>
                <h1 className="font-bold text-lg text-gray-900">분석 리포트</h1>
                <div className="w-10" />
            </header>

            <main className="max-w-2xl mx-auto p-4 space-y-8">

                {/* 1. 페르소나 요약 섹션 */}
                <section className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 blur-3xl opacity-30 rounded-full" />
                    <div className="relative text-center space-y-2 py-6">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-yellow-400 text-gray-900 shadow-sm">
                            AI Insight
                        </span>
                        {/* 폰트가 Jua가 없어도 기본 폰트로 예쁘게 나오도록 sans-serif 설정 */}
                        <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                            "{data.analysis.summary}"
                        </h2>
                        <p className="text-sm text-gray-500">
                            최근 기록된 데이터를 기반으로 분석했습니다.
                        </p>
                    </div>
                </section>

                {/* 2. 워드 마인드맵 (Galaxy View) */}
                <section className="relative h-[300px] md:h-[400px] w-full bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-inner">
                    <div className="absolute inset-0 flex items-center justify-center">
                        {/* 중앙 노드 (나) */}
                        <div className="relative z-10 w-20 h-20 rounded-full bg-yellow-400 shadow-xl flex items-center justify-center animate-pulse">
                            <span className="text-gray-900 font-bold text-lg">나</span>
                            {/* 궤도 애니메이션 */}
                            <div className="absolute w-40 h-40 border border-yellow-400/30 rounded-full animate-spin-slow" />
                            <div className="absolute w-64 h-64 border border-yellow-400/15 rounded-full animate-reverse-spin" />
                        </div>

                        {/* 떠다니는 단어들 */}
                        {data.topWords.map((item, index) => {
                            const total = data.topWords.length;
                            const angle = (index / total) * 2 * Math.PI;
                            const radius = 70 + (index * (120 / total)) + (Math.random() * 20);

                            const x = Math.cos(angle) * radius;
                            const y = Math.sin(angle) * radius;
                            const scale = 0.8 + (item.count / 10) * 0.5;

                            return (
                                <div
                                    key={index}
                                    className="absolute flex flex-col items-center justify-center transition-all duration-700 hover:scale-110 cursor-pointer group z-20"
                                    style={{
                                        transform: `translate(${x * 1.5}px, ${y * 1.5}px) scale(${scale})`,
                                    }}
                                >
                                    <div
                                        className={`px-4 py-2 rounded-full shadow-md text-sm font-medium backdrop-blur-sm border
                                            ${item.type === '동사'
                                            ? 'bg-blue-50/90 border-blue-200 text-blue-700'
                                            : 'bg-rose-50/90 border-rose-200 text-rose-700'
                                        }`}
                                    >
                                        {item.word}
                                    </div>
                                    <span className="opacity-0 group-hover:opacity-100 text-[10px] text-gray-500 transition-opacity absolute -bottom-5 bg-white/80 px-1 rounded shadow-sm">
                                        {item.count}회
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="absolute bottom-3 right-4 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded backdrop-blur-sm z-30">
                        * 중심에 가까울수록 자주 사용한 단어입니다.
                    </div>
                </section>

                {/* 3. 상세 분석 카드 */}
                <div className="grid gap-4">
                    {/* 성격 */}
                    <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                                <Brain className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-900">성격 분석</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                            {data.analysis.personality}
                        </p>
                    </div>

                    {/* 감정 */}
                    <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                                <Heart className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-900">감정 상태</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                            {data.analysis.emotionalState}
                        </p>
                    </div>

                    {/* 문체 */}
                    <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                                <PenTool className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-900">글쓰기 스타일</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                            {data.analysis.writingStyle}
                        </p>
                    </div>
                </div>

                {/* 공유 버튼 */}
                <button className="w-full py-4 bg-yellow-400 text-gray-900 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-yellow-500 transition-colors">
                    <Share2 className="w-5 h-5" />
                    내 결과 공유하기
                </button>

            </main>
        </div>
    );
}

export default AnalysisPage;