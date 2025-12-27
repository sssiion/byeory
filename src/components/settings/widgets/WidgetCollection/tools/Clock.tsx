import { useState } from 'react';
import { WidgetWrapper } from '../../Shared';
import { useWidgetInterval, useWidgetStorage } from '../SDK';

// 14. Clock Widget (시계)
export function ClockWidget() {
    const [time, setTime] = useState(new Date());
    const [type, setType] = useWidgetStorage<'digital' | 'analog' | 'flip'>('widget-clock-type', 'analog');

    useWidgetInterval(() => {
        setTime(new Date());
    }, 1000 / 60); // 60fps for smooth analog

    const toggleType = () => {
        if (type === 'digital') setType('analog');
        else if (type === 'analog') setType('flip');
        else setType('digital');
    };

    const renderContent = () => {
        // Digital Clock (Modern)
        if (type === 'digital') {
            return (
                <div className="flex flex-col items-center justify-center p-4">
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold tracking-tighter text-gray-800 font-[Inter,sans-serif]">
                            {time.getHours().toString().padStart(2, '0')}
                        </span>
                        <span className="text-5xl font-bold text-gray-800 animate-pulse">:</span>
                        <span className="text-5xl font-bold tracking-tighter text-gray-800 font-[Inter,sans-serif]">
                            {time.getMinutes().toString().padStart(2, '0')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {time.toLocaleDateString('ko-KR', { weekday: 'short' })}
                        </span>
                        <span className="text-sm font-medium text-gray-500">
                            {time.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            );
        }

        // New Flip Clock Style
        if (type === 'flip') {
            const h = time.getHours().toString().padStart(2, '0');
            const m = time.getMinutes().toString().padStart(2, '0');

            return (
                <div className="flex flex-col items-center justify-center gap-3">
                    <div className="flex gap-2 items-center">
                        <FlipCard value={h} />
                        <div className="flex flex-col gap-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        </div>
                        <FlipCard value={m} />
                    </div>
                    <div className="text-[10px] font-bold tracking-[0.2em] text-gray-300">RETRO ALARM</div>
                </div>
            );
        }

        // Premium Analog Clock
        const seconds = time.getSeconds() + time.getMilliseconds() / 1000;
        const minutes = time.getMinutes() + seconds / 60;
        const hours = (time.getHours() % 12) + minutes / 60;

        return (
            <div className="relative w-32 h-32 rounded-full bg-white shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center justify-center">
                {/* Clock Face Markers */}
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute w-0.5 bg-gray-300 ${i % 3 === 0 ? 'h-3 bg-gray-400' : 'h-1.5'}`}
                        style={{
                            top: '4px',
                            left: '50%',
                            transformOrigin: '50% 64px', // 64 = w/2
                            transform: `translateX(-50%) rotate(${i * 30}deg)`
                        }}
                    />
                ))}

                {/* Hour Hand */}
                <div
                    className="absolute w-1.5 h-8 bg-gray-800 rounded-full origin-bottom left-1/2 -ml-[3px] bottom-1/2 shadow-sm"
                    style={{ transform: `rotate(${hours * 30}deg)` }}
                ></div>

                {/* Minute Hand */}
                <div
                    className="absolute w-1 h-12 bg-gray-600 rounded-full origin-bottom left-1/2 -ml-[2px] bottom-1/2 shadow-sm"
                    style={{ transform: `rotate(${minutes * 6}deg)` }}
                ></div>

                {/* Second Hand (Smooth) */}
                <div
                    className="absolute w-0.5 h-14 bg-orange-500 rounded-full origin-bottom left-1/2 -ml-[1px] bottom-1/2 z-10"
                    style={{ transform: `rotate(${seconds * 6}deg)` }}
                >
                    <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full shadow-sm" />
                </div>

                {/* Center Pin */}
                <div className="w-2 h-2 bg-white border-2 border-orange-500 rounded-full z-20 shadow-sm relative"></div>
            </div>
        );
    };

    return (
        <WidgetWrapper className="bg-white">
            <div
                onClick={toggleType}
                className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-50/50 transition-colors group relative"
                title="클릭하여 스타일 변경"
            >
                {renderContent()}
                <div className="absolute bottom-2 right-2 text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {type.toUpperCase()}
                </div>
            </div>
        </WidgetWrapper>
    );
}

function FlipCard({ value }: { value: string }) {
    return (
        <div className="relative bg-[#222] rounded-lg shadow-lg border-b border-gray-700 w-12 h-16 flex items-center justify-center overflow-hidden">
            {/* Top Half Highlight */}
            <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

            <span className="text-3xl font-bold font-mono text-[#e0e0e0] z-10">
                {value}
            </span>

            {/* Hinge Line */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/40 z-20" />
        </div>
    )
}
