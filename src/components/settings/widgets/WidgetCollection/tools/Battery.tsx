import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { WidgetWrapper } from '../Common';

// --- 5. Battery Widget (내 에너지)
export const BatteryWidget = React.memo(function BatteryWidget() {
    const [level, setLevel] = useState(50);

    return (
        <WidgetWrapper className="bg-gray-50 dark:bg-gray-800/50">
            <div className="flex flex-col items-center gap-2 w-full px-2">
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-gray-600 dark:text-gray-300">
                    <Zap size={14} className={level < 20 ? 'text-red-500' : 'text-yellow-500'} fill="currentColor" />
                    {level}%
                </div>
                <div className="relative w-full h-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-0.5 flex items-center">
                    <div
                        className={`h-full rounded-md transition-all duration-300 ${level < 20 ? 'bg-red-400' : level < 60 ? 'bg-yellow-400' : 'bg-green-400'}`}
                        style={{ width: `${level}%` }}
                    />
                    <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1 h-3 bg-gray-300 dark:bg-gray-600 rounded-r-sm"></div>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--btn-bg)]"
                />
            </div>
        </WidgetWrapper>
    );
});
