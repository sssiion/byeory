import React from 'react';
import { Flame } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';

interface StreakWidgetProps {
    gridSize?: { w: number; h: number };
}

// 17. Streak Widget (연속 기록)
export const StreakWidget = React.memo(function StreakWidget({ gridSize }: StreakWidgetProps) {
    const isSmall = (gridSize?.w || 2) < 2;

    if (isSmall) {
        return (
            <WidgetWrapper className="bg-gradient-to-br from-orange-400 to-orange-600">
                <div className="w-full h-full flex flex-col items-center justify-center text-white">
                    <Flame className="w-8 h-8 mb-1 animate-pulse" fill="currentColor" />
                    <span className="text-2xl font-black leading-none">12</span>
                    <span className="text-[9px] opacity-80 font-bold uppercase mt-0.5">Days</span>
                </div>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-gradient-to-b from-orange-50 to-white">
            <div className="w-full h-full flex flex-col items-center justify-center p-2">
                <div className="relative">
                    <Flame className="w-10 h-10 text-orange-500 animate-pulse" fill="currentColor" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-white text-xs">12</div>
                </div>
                <span className="text-xs font-bold text-orange-600 mt-1">Days Streak!</span>
                <div className="flex gap-0.5 mt-2">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-sm ${i < 5 ? 'bg-orange-400' : 'bg-gray-200'}`}></div>
                    ))}
                </div>
            </div>
        </WidgetWrapper>
    );
});
