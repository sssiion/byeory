import { memo, useState } from 'react';
import { WidgetWrapper } from '../../Shared';
import { Sparkles, Brain } from 'lucide-react';

// 12. Emotion Analysis (감정 분석)
export const EmotionAnalysis = memo(function EmotionAnalysis({ gridSize }: { gridSize?: { w: number; h: number } }) {
    const isSmall = (gridSize?.w || 2) < 2 && (gridSize?.h || 2) < 2;
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<{ main: string; percent: number } | null>(null);

    // Mock Analysis
    const handleAnalyze = () => {
        setIsAnalyzing(true);
        setTimeout(() => {
            setResult({
                main: 'Happy',
                percent: 85
            });
            setIsAnalyzing(false);
        }, 2000);
    };

    if (isSmall) {
        return (
            <WidgetWrapper title="" className="bg-white flex items-center justify-center p-1 relative overflow-hidden">
                {!result && !isAnalyzing ? (
                    <button onClick={handleAnalyze} className="bg-amber-100 text-amber-600 rounded-full p-2 hover:bg-amber-200 transition-colors">
                        <Brain size={16} />
                    </button>
                ) : (
                    <div className="relative w-10 h-10 rounded-full flex items-center justify-center animate-in zoom-in" style={{ background: isAnalyzing ? 'conic-gradient(from 0deg, #fbbf24, transparent)' : 'conic-gradient(#fbbf24 0% 100%)' }}>
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center z-10">
                            <span className="text-lg">{isAnalyzing ? '...' : '😊'}</span>
                        </div>
                        {isAnalyzing && <div className="absolute inset-0 animate-spin border-2 border-dashed border-amber-300 rounded-full"></div>}
                    </div>
                )}
                {result && !isAnalyzing && <div className="absolute bottom-1 right-1 bg-amber-100 text-amber-600 text-[8px] px-1 rounded-full font-bold">{result?.percent}%</div>}
            </WidgetWrapper>
        );
    }
    return (
        <WidgetWrapper title="AI Emotion Analysis" className="bg-white">
            <div className="w-full h-full flex items-center justify-center p-2 relative">
                {isAnalyzing ? (
                    <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-amber-500 gap-2">
                        <div className="animate-spin duration-1000">
                            <Sparkles size={24} />
                        </div>
                        <span className="text-xs font-bold animate-pulse">Analyzing...</span>
                    </div>
                ) : null}

                {!result && !isAnalyzing && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                        <button onClick={handleAnalyze} className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                            <Sparkles size={16} /> Analyze Today
                        </button>
                    </div>
                )}

                <div className={`w-full flex items-center justify-center transition-all duration-500 ${!result && !isAnalyzing ? 'blur-sm opacity-50' : 'blur-0 opacity-100'}`}>
                    <div className="relative w-24 h-24 rounded-full border-[6px] border-gray-100 flex items-center justify-center shrink-0">
                        {/* Simple Pie Chart Simulation with Conic Gradient */}
                        <div className="absolute inset-0 rounded-full transition-all duration-1000" style={{ background: 'conic-gradient(#fbbf24 0% 40%, #f87171 40% 70%, #60a5fa 70% 100%)', maskImage: 'radial-gradient(transparent 55%, black 56%)', WebkitMaskImage: 'radial-gradient(transparent 55%, black 56%)' }}></div>
                        <div className="text-center z-10">
                            <span className="block text-xs text-gray-400">Main</span>
                            <span className="block text-sm font-bold text-amber-500">Happy</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 ml-4 min-w-[80px]">
                        <div className="flex items-center gap-1 text-[9px] text-gray-600"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Happy 40%</div>
                        <div className="flex items-center gap-1 text-[9px] text-gray-600"><div className="w-2 h-2 rounded-full bg-red-400"></div> Excited 30%</div>
                        <div className="flex items-center gap-1 text-[9px] text-gray-600"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Calm 30%</div>
                    </div>
                </div>
            </div>
        </WidgetWrapper>
    );
});
