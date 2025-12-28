import { useState } from 'react';
import { WidgetWrapper } from '../Common';

// --- 1. Switch Board (똑딱이)
export const SwitchBoardConfig = {
    defaultSize: '1x1',
    validSizes: [[1, 1]] as [number, number][],
};

export const SwitchBoard = ({ gridSize: _ }: { gridSize?: { w: number; h: number } }) => {
    const [isOn, setIsOn] = useState(false);

    return (
        <WidgetWrapper className={`${isOn ? 'bg-[#fffbeb]' : 'bg-[#1a1a1a]'} transition-colors duration-300`}>
            <button
                onClick={() => setIsOn(!isOn)}
                className={`relative w-16 h-28 rounded-xl border-4 ${isOn ? 'border-[#e5e5e5] bg-white' : 'border-[#333] bg-[#2a2a2a]'} shadow-xl transition-all flex flex-col items-center justify-between py-2`}
            >
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <div className={`w-8 h-12 rounded-lg border-2 ${isOn ? 'bg-white border-gray-200 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] translate-y-[-2px]' : 'bg-[#333] border-black shadow-[0_-4px_0_0_rgba(255,255,255,0.1)] translate-y-[2px]'} transition-all`}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            </button>
            <span className={`mt-2 text-xs font-bold ${isOn ? 'text-gray-800' : 'text-gray-400'}`}>
                {isOn ? 'ON' : 'OFF'}
            </span>
        </WidgetWrapper>
    );
}
