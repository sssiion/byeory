import React, { useState } from 'react';
import { WidgetWrapper } from '../../Shared';

interface ComponentProps {
    className?: string;
    style?: React.CSSProperties;
}

export const SwitchesConfig = {
    defaultSize: '2x2',
    validSizes: [[1, 2], [2, 1], [2, 2]] as [number, number][],
};

export const Switches = ({ className, style, gridSize }: ComponentProps & { gridSize?: { w: number; h: number } }) => {
    const [states, setStates] = useState([false, true, false, false]);

    const toggle = (index: number) => {
        const newStates = [...states];
        newStates[index] = !newStates[index];
        setStates(newStates);
    };

    const w = gridSize?.w || 2;
    const h = gridSize?.h || 2;
    const isTall = w === 1 && h >= 2;
    const isWide = w >= 2 && h === 1;

    // Layout configuration
    // 2x2: 4 switches (Grid 2x2)
    // 1x2: 2 or 3 switches vertical (Flex col or Grid 1 col) - Let's show all 4 packed or scroll? 
    //      Actually, let's just show top 3 or all 4 if they fit. 4 fit in 1x2 roughly.
    // 2x1: 2 or 3 switches horizontal.

    return (
        <WidgetWrapper className={`bg-[#e0e5ec] ${className || ''}`} style={style}>
            <div className={`w-full h-full p-2 flex items-center justify-center`}>
                <div className={`grid gap-4 ${isTall ? 'grid-cols-1' : isWide ? 'grid-cols-4 gap-2' : 'grid-cols-2'}`}>

                    {/* Switch 1: Simple Toggle */}
                    <div
                        className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${states[0] ? 'bg-green-400' : 'bg-gray-300'}`}
                        onClick={() => toggle(0)}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${states[0] ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                    </div>

                    {/* Switch 2: Rocker Switch - Only show on not-wide or if space permits */}
                    {(!isWide || w >= 3) && (
                        <div
                            className="relative w-6 h-10 bg-gray-700 rounded-md cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-gray-600 overflow-hidden"
                            onClick={() => toggle(1)}
                        >
                            <div className={`absolute w-full h-1/2 bg-gray-600 top-0 border-b border-black transition-all duration-100 ${states[1] ? 'opacity-100 bg-gray-500 shadow-inner' : 'opacity-80'}`} />
                            <div className={`absolute w-full h-1/2 bg-gray-600 bottom-0 border-t border-gray-500 transition-all duration-100 ${!states[1] ? 'opacity-100 bg-gray-500 shadow-inner' : 'opacity-80'}`} />
                            <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${states[1] ? 'bg-green-400 shadow-[0_0_5px_#4ade80]' : 'bg-gray-800'}`} />
                        </div>
                    )}

                    {/* Switch 3: Push Button */}
                    <div className="flex items-center justify-center">
                        <button
                            onClick={() => toggle(2)}
                            className={`w-8 h-8 rounded-full border-2 border-gray-300 shadow-md active:shadow-inner active:translate-y-0.5 transition-all text-gray-500 text-[8px] font-bold ${states[2] ? 'bg-red-500 text-white border-red-300 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-gray-100'
                                }`}
                        >
                            {states[2] ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    {/* Switch 4: Lever (Vertical Toggle) */}
                    <div
                        className="w-3 h-10 bg-gray-300 rounded-full relative cursor-pointer"
                        onClick={() => toggle(3)}
                    >
                        <div className="absolute inset-0 bg-black/10 rounded-full" />
                        <div
                            className={`absolute left-[-4px] w-5 h-5 rounded-full bg-white border border-gray-400 shadow-sm transition-all duration-200 ${states[3] ? 'top-0.5' : 'bottom-0.5'
                                }`}
                        />
                    </div>
                </div>
            </div>
        </WidgetWrapper>
    );
};
