import React from 'react';
import { Flame } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';

export const StreakWidgetConfig = {
    defaultSize: '2x1',
    validSizes: [[1, 1], [2, 1]] as [number, number][],
};

// 17. Streak Widget (연속 기록)
export const StreakWidget = React.memo(function StreakWidget() {
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
