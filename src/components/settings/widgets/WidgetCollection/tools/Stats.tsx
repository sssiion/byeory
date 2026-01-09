import React from 'react';
import { WidgetWrapper } from '../../Shared';

interface StatsWidgetProps {
    gridSize?: { w: number; h: number };
}

// 18. Stats Widget (기록 통계)
export const StatsWidget = React.memo(function StatsWidget({ gridSize }: StatsWidgetProps) {
    const isSmall = (gridSize?.w || 2) < 2;

    if (isSmall) {
        return (
            <WidgetWrapper className="bg-white">
                <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Log</span>
                    <span className="text-3xl font-black text-gray-800">24</span>
                    <div className="flex gap-0.5 mt-1 items-end h-4">
                        <div className="w-1 bg-blue-200 h-[40%] rounded-t-[1px]" />
                        <div className="w-1 bg-blue-300 h-[70%] rounded-t-[1px]" />
                        <div className="w-1 bg-blue-400 h-[50%] rounded-t-[1px]" />
                        <div className="w-1 bg-blue-500 h-[90%] rounded-t-[1px]" />
                    </div>
                </div>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper title="Monthly Log" className="bg-white">
            <div className="w-full h-full flex flex-col items-end justify-end p-3 pb-0 relative">
                <div className="absolute top-8 left-3 text-xs text-gray-400">Total <strong className="text-gray-800">24</strong></div>
                <div className="flex items-end justify-between w-full h-24 gap-1">
                    <div className="w-full bg-blue-100 rounded-t-sm h-[40%] relative group"><div className="absolute -top-4 left-0 w-full text-center text-[9px] opacity-0 group-hover:opacity-100">8</div></div>
                    <div className="w-full bg-blue-200 rounded-t-sm h-[70%] relative group"><div className="absolute -top-4 left-0 w-full text-center text-[9px] opacity-0 group-hover:opacity-100">14</div></div>
                    <div className="w-full bg-blue-300 rounded-t-sm h-[50%] relative group"><div className="absolute -top-4 left-0 w-full text-center text-[9px] opacity-0 group-hover:opacity-100">10</div></div>
                    <div className="w-full bg-blue-400 rounded-t-sm h-[90%] relative group"><div className="absolute -top-4 left-0 w-full text-center text-[9px] opacity-0 group-hover:opacity-100">18</div></div>
                    <div className="w-full bg-blue-500 rounded-t-sm h-[30%] relative group"><div className="absolute -top-4 left-0 w-full text-center text-[9px] opacity-0 group-hover:opacity-100">6</div></div>
                </div>
                <div className="flex justify-between w-full text-[8px] text-gray-400 py-1">
                    <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span>
                </div>
            </div>
        </WidgetWrapper>
    );
});
