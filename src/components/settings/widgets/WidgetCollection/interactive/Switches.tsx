import React, { useState } from 'react';
import { WidgetWrapper } from '../../Shared';

interface ComponentProps {
    className?: string;
    style?: React.CSSProperties;
}

export const SwitchesConfig = {
    defaultSize: '2x2',
    validSizes: [[2, 2], [3, 2], [3, 3]] as [number, number][],
};

export const Switches = ({ className, style, gridSize: _ }: ComponentProps & { gridSize?: { w: number; h: number } }) => {
    const [states, setStates] = useState([false, true, false, false]);

    const toggle = (index: number) => {
        const newStates = [...states];
        newStates[index] = !newStates[index];
        setStates(newStates);
    };

    return (
        <WidgetWrapper className={`bg-[#e0e5ec] ${className || ''}`} style={style}>
            <div className="w-full h-full grid grid-cols-2 gap-4 p-4 place-items-center">
                {/* Switch 1: Simple Toggle */}
                <div
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${states[0] ? 'bg-green-400' : 'bg-gray-300'}`}
                    onClick={() => toggle(0)}
                >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${states[0] ? 'translate-x-[22px]' : 'translate-x-0'}`} />
                </div>

                {/* Switch 2: Rocker Switch */}
                <div
                    className="relative w-8 h-12 bg-gray-700 rounded-md cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-gray-600 overflow-hidden"
                    onClick={() => toggle(1)}
                >
                    <div className={`absolute w-full h-1/2 bg-gray-600 top-0 border-b border-black transition-all duration-100 ${states[1] ? 'opacity-100 bg-gray-500 shadow-inner' : 'opacity-80'}`} />
                    <div className={`absolute w-full h-1/2 bg-gray-600 bottom-0 border-t border-gray-500 transition-all duration-100 ${!states[1] ? 'opacity-100 bg-gray-500 shadow-inner' : 'opacity-80'}`} />
                    <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${states[1] ? 'bg-green-400 shadow-[0_0_5px_#4ade80]' : 'bg-gray-800'}`} />
                </div>

                {/* Switch 3: Push Button */}
                <div className="flex items-center justify-center">
                    <button
                        onClick={() => toggle(2)}
                        className={`w-10 h-10 rounded-full border-4 border-gray-300 shadow-lg active:shadow-inner active:translate-y-0.5 transition-all text-gray-500 font-bold ${states[2] ? 'bg-red-500 text-white border-red-300 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-gray-100'
                            }`}
                    >
                        {states[2] ? 'ON' : 'OFF'}
                    </button>
                </div>

                {/* Switch 4: Lever (Vertical Toggle) */}
                <div
                    className="w-4 h-12 bg-gray-300 rounded-full relative cursor-pointer"
                    onClick={() => toggle(3)}
                >
                    <div className="absolute inset-0 bg-black/10 rounded-full" />
                    <div
                        className={`absolute left-[-4px] w-6 h-6 rounded-full bg-white border border-gray-400 shadow-sm transition-all duration-200 ${states[3] ? 'top-1' : 'bottom-1'
                            }`}
                    />
                </div>
            </div>
        </WidgetWrapper>
    );
};
