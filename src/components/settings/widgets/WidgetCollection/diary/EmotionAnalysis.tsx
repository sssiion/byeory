import { memo } from 'react';
import { WidgetWrapper } from '../../Shared';

// 12. Emotion Analysis (감정 분석)
export const EmotionAnalysisConfig = {
    defaultSize: '2x1',
    validSizes: [[1, 1], [2, 1]] as [number, number][],
};

export const EmotionAnalysis = memo(function EmotionAnalysis({ gridSize }: { gridSize?: { w: number; h: number } }) {
    const isSmall = (gridSize?.w || 2) < 2;

    if (isSmall) {
        return (
            <WidgetWrapper title="" className="bg-white flex items-center justify-center p-1">
                <div className="relative w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'conic-gradient(#fbbf24 0% 100%)' }}>
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-lg">😊</span>
                    </div>
                </div>
                <div className="absolute bottom-1 right-1 bg-amber-100 text-amber-600 text-[8px] px-1 rounded-full font-bold">40%</div>
            </WidgetWrapper>
        );
    }
    return (
        <WidgetWrapper title="이번 달 감정" className="bg-white">
            <div className="w-full h-full flex items-center justify-center p-2">
                <div className="relative w-24 h-24 rounded-full border-[6px] border-gray-100 flex items-center justify-center">
                    {/* Simple Pie Chart Simulation with Conic Gradient */}
                    <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(#fbbf24 0% 40%, #f87171 40% 70%, #60a5fa 70% 100%)', maskImage: 'radial-gradient(transparent 55%, black 56%)', WebkitMaskImage: 'radial-gradient(transparent 55%, black 56%)' }}></div>
                    <div className="text-center z-10">
                        <span className="block text-xs text-gray-400">Main</span>
                        <span className="block text-sm font-bold text-amber-500">Happy</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1 ml-4">
                    <div className="flex items-center gap-1 text-[9px] text-gray-600"><div className="w-2 h-2 rounded-full bg-amber-400"></div> 행복 40%</div>
                    <div className="flex items-center gap-1 text-[9px] text-gray-600"><div className="w-2 h-2 rounded-full bg-red-400"></div> 설렘 30%</div>
                    <div className="flex items-center gap-1 text-[9px] text-gray-600"><div className="w-2 h-2 rounded-full bg-blue-400"></div> 차분 30%</div>
                </div>
            </div>
        </WidgetWrapper>
    );
});
