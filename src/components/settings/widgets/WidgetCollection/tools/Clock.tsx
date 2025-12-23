import { useState, useEffect } from 'react';
import { WidgetWrapper } from '../../Shared';

// 14. Clock Widget (시계)
export function ClockWidget() {
    const [time, setTime] = useState(new Date());
    const [type, setType] = useState<'digital' | 'analog' | 'flip'>('digital');

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleType = () => {
        if (type === 'digital') setType('analog');
        else if (type === 'analog') setType('flip');
        else setType('digital');
    };

    const renderContent = () => {
        if (type === 'digital') {
            return (
                <div className="text-center">
                    <div className="text-3xl font-mono font-bold tracking-wider text-gray-800">
                        {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-1">
                        {time.toLocaleDateString([], { month: 'long', day: 'numeric', weekday: 'short' })}
                    </div>
                </div>
            );
        }
        if (type === 'flip') {
            return (
                <div className="flex gap-1 items-center justify-center">
                    <div className="bg-[#333] text-white p-2 rounded text-2xl font-bold font-mono shadow-md border-b-2 border-[#111]">
                        {time.getHours().toString().padStart(2, '0')}
                    </div>
                    <span className="text-2xl font-bold animate-pulse">:</span>
                    <div className="bg-[#333] text-white p-2 rounded text-2xl font-bold font-mono shadow-md border-b-2 border-[#111]">
                        {time.getMinutes().toString().padStart(2, '0')}
                    </div>
                    <div className="absolute bottom-2 text-[9px] text-gray-400 tracking-widest">FLIP CLOCK</div>
                </div>
            );
        }
        // Analog
        return (
            <div className="relative w-24 h-24 rounded-full border-4 border-gray-800 bg-white shadow-inner flex items-center justify-center">
                <div className="absolute w-1 h-3 bg-gray-800 top-0 left-1/2 -translate-x-1/2"></div>
                <div className="absolute w-1 h-3 bg-gray-800 bottom-0 left-1/2 -translate-x-1/2"></div>
                <div className="absolute w-3 h-1 bg-gray-800 left-0 top-1/2 -translate-y-1/2"></div>
                <div className="absolute w-3 h-1 bg-gray-800 right-0 top-1/2 -translate-y-1/2"></div>

                {/* Hour Hand */}
                <div
                    className="absolute w-1.5 h-6 bg-black rounded-full origin-bottom bottom-1/2 left-1/2 -translate-x-1/2 z-10"
                    style={{ transform: `translateX(-50%) rotate(${(time.getHours() % 12) * 30 + time.getMinutes() * 0.5}deg)` }}
                ></div>
                {/* Minute Hand */}
                <div
                    className="absolute w-1 h-8 bg-gray-600 rounded-full origin-bottom bottom-1/2 left-1/2 -translate-x-1/2 z-10"
                    style={{ transform: `translateX(-50%) rotate(${time.getMinutes() * 6}deg)` }}
                ></div>
                {/* Second Hand */}
                <div
                    className="absolute w-0.5 h-9 bg-red-500 rounded-full origin-bottom bottom-1/2 left-1/2 -translate-x-1/2 z-20"
                    style={{ transform: `translateX(-50%) rotate(${time.getSeconds() * 6}deg)` }}
                ></div>

                <div className="w-2 h-2 bg-black rounded-full z-30"></div>
            </div>
        );
    };

    return (
        <WidgetWrapper className="bg-white">
            <div
                onClick={toggleType}
                className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                title="클릭하여 디자인 변경"
            >
                {renderContent()}
            </div>
        </WidgetWrapper>
    );
}
