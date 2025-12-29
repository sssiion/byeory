import { useState } from 'react';
import { WidgetWrapper } from '../Common';

// --- 1. Switch Board (똑딱이)
export const SwitchBoardConfig = {
    defaultSize: '1x1',
    validSizes: [[1, 1]] as [number, number][],
};

export const SwitchBoard = ({ gridSize }: { gridSize?: { w: number; h: number } }) => {
    // Default to 1x1 if undefined
    const w = gridSize?.w || 1;
    const h = gridSize?.h || 1;
    const total = w * h;

    // Initialize states array
    const [switches, setSwitches] = useState<boolean[]>(Array(total).fill(false));

    if (switches.length !== total) {
        setSwitches(prev => {
            const next = Array(total).fill(false);
            prev.forEach((s, i) => { if (i < total) next[i] = s; });
            return next;
        });
    }

    const toggle = (index: number) => {
        setSwitches(prev => {
            const next = [...prev];
            next[index] = !next[index];
            return next;
        });
    };

    return (
        <WidgetWrapper className="bg-[#1a1a1a] p-2 overflow-hidden h-full">
            <div
                className="w-full h-full grid gap-2"
                style={{
                    gridTemplateColumns: `repeat(${w}, 1fr)`,
                    gridTemplateRows: `repeat(${h}, 1fr)`
                }}
            >
                {Array.from({ length: total }).map((_, i) => {
                    const isOn = switches[i];
                    return (
                        <div key={i} className={`flex flex-col items-center justify-center transition-colors duration-300 rounded-lg ${isOn ? 'bg-[#fffbeb]/10' : 'bg-transparent'}`}>
                            <button
                                onClick={() => toggle(i)}
                                className={`relative w-[64px] h-[80px] rounded-xl border-4 ${isOn ? 'border-[#e5e5e5] bg-white' : 'border-[#333] bg-[#2a2a2a]'} shadow-xl transition-all flex flex-col items-center justify-between py-2 scale-90 hover:scale-100 active:scale-95`}
                            >
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <div className={`w-6 h-10 rounded-lg border-2 ${isOn ? 'bg-white border-gray-200 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] translate-y-[-2px]' : 'bg-[#333] border-black shadow-[0_-4px_0_0_rgba(255,255,255,0.1)] translate-y-[2px]'} transition-all`}></div>
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            </button>
                            <span className={`mt-1 text-[10px] font-bold ${isOn ? 'text-gray-200 border-b border-gray-200' : 'text-gray-600'}`}>
                                {isOn ? 'ON' : 'OFF'}
                            </span>
                        </div>
                    );
                })}
            </div>
        </WidgetWrapper>
    );
}
