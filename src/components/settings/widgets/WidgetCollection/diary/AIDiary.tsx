import { useState } from 'react';
import { PenTool } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';

// 1. AI Diary (AI 다이어리)
export const AIDiaryConfig = {
    defaultSize: '2x1',
    validSizes: [[2, 1], [2, 2]] as [number, number][],
};

interface AIDiaryProps {
    gridSize?: { w: number; h: number };
}

export function AIDiary({ gridSize }: AIDiaryProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState('');

    const handleAnalyze = () => {
        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
            setResult("오늘의 일기에서 '설렘'과 '기대'가 느껴지네요! 🌸 긍정적인 에너지가 가득해요.");
        }, 2000);
    };

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
