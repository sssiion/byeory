import { useState } from 'react';
import { PenTool } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';

// 1. AI Diary (AI 다이어리)
export const AIDiaryConfig = {
    defaultSize: '2x1',
    validSizes: [[1, 1], [1, 2], [2, 1], [2, 2]] as [number, number][],
};

export function AIDiary({ gridSize }: { gridSize?: { w: number; h: number } }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState('');

    const handleAnalyze = () => {
        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
            setResult("오늘의 일기에서 '설렘'과 '기대'가 느껴지네요! 🌸 긍정적인 에너지가 가득해요.");
        }, 2000);
    };

    const isSmall = (gridSize?.w || 2) < 2 && (gridSize?.h || 2) < 2;

    if (isSmall) {
        return (
            <WidgetWrapper title="" className="bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-1">
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="flex flex-col items-center justify-center w-full h-full text-indigo-500 hover:text-indigo-700 disabled:opacity-50"
                >
                    <PenTool size={20} className={isAnalyzing ? 'animate-bounce' : ''} />
                    <span className="text-[8px] font-bold mt-1">AI ANALYZE</span>
                </button>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper title="AI 감정 분석관" className="bg-gradient-to-br from-indigo-50 to-white">
            <div className="p-3 h-full flex flex-col gap-2">
                <textarea
                    className="w-full flex-1 bg-white/50 border border-indigo-100 rounded-lg p-2 text-xs resize-none outline-none focus:border-indigo-300 transition-colors"
                    placeholder="오늘 무슨 일이 있었나요?"
                />
                {result ? (
                    <div className="bg-indigo-100 p-2 rounded-lg text-[10px] text-indigo-800 animate-in fade-in slide-in-from-bottom-2">
                        🤖 {result}
                    </div>
                ) : (
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="w-full py-1.5 bg-indigo-500 text-white text-xs rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-1"
                    >
                        {isAnalyzing ? <span className="animate-pulse">분석중...</span> : <><PenTool size={10} /> AI 분석하기</>}
                    </button>
                )}
            </div>
        </WidgetWrapper>
    );
}
