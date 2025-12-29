import React from 'react';
import { Lock } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';

// 4. Time Machine (타임캡슐)
export const TimeMachineConfig = {
    defaultSize: '2x2',
    validSizes: [[2, 2], [3, 2]] as [number, number][],
};

export const TimeMachine = React.memo(function TimeMachine({ gridSize: _ }: { gridSize?: { w: number; h: number } }) {
    return (
        <WidgetWrapper className="bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-amber-900 border-amber-950">
            <div className="w-full h-full flex flex-col items-center justify-center text-amber-100 relative">
                <Lock className="w-10 h-10 mb-2 text-amber-400" />
                <h3 className="text-sm font-bold tracking-widest text-amber-200">TIME CAPSULE</h3>
                <div className="bg-black/30 px-3 py-1 rounded mt-2 backdrop-blur-sm border border-white/10">
                    <span className="font-mono text-xs">D-365</span>
                </div>
                <p className="text-[9px] mt-2 opacity-60">2026.12.12 Open</p>
            </div>
        </WidgetWrapper>
    );
});
