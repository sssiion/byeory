import { WidgetWrapper } from '../Common';

interface BonfireProps {
    gridSize?: { w: number; h: number };
}

export function Bonfire({ gridSize }: BonfireProps) {
    const w = gridSize?.w || 2;
    const h = gridSize?.h || 1;

    // Calculate limit based on the smaller dimension to prevent cutting off
    const minDim = Math.min(w, h);

    // Dynamic scale logic
    let scale = 0.85; // Default for 1x1

    if (minDim >= 3) {
        scale = 1.7; // Full 3x3
    } else if (minDim >= 2) {
        scale = 1.35; // 2x2
    } else {
        scale = 0.85;
    }

    return (
        <WidgetWrapper className="bg-black border-none shadow-none p-0">
            {/* Inner Flex Container handles the actual centering */}
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden">

                {/* Background Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/30 via-black to-black"></div>

                {/* Fire Container */}
                <div
                    className="relative bg-black rounded-full shadow-[0_0_60px_rgba(255,80,0,0.15)] flex items-end justify-center overflow-hidden shrink-0"
                    style={{
                        width: `${180 * scale}px`,
                        height: `${180 * scale}px`,
                        background: 'radial-gradient(circle at center 70%, #2a1000 0%, #000000 65%)',
                        // Removed extra translation as flex center should now handle it perfectly
                    }}
                >
                    {/* Inner Glow */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-4/5 h-4/5 bg-orange-500/15 rounded-full blur-2xl animate-pulse-slow"></div>

                    {/* Logs */}
                    <div className="relative z-10 mb-8 mx-auto">
                        {/* Log 1 */}
                        <div
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#4e342e] rounded-full rotate-12 shadow-lg"
                            style={{ width: `${90 * scale}px`, height: `${22 * scale}px`, bottom: `${12 * scale}px` }}
                        ></div>
                        {/* Log 2 */}
                        <div
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#3e2723] rounded-full -rotate-12 shadow-inner"
                            style={{ width: `${90 * scale}px`, height: `${22 * scale}px`, bottom: `${12 * scale}px` }}
                        ></div>
                    </div>

                    {/* Flames */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-0 mix-blend-screen" style={{ transform: `translateX(-50%) scale(${scale})` }}>
                        {/* Core */}
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-12 h-16 bg-white rounded-full blur-[4px] animate-flicker-core"></div>
                        {/* Inner */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-24 bg-yellow-400 rounded-t-full rounded-b-[24px] blur-[6px] opacity-90 animate-flicker"></div>
                        {/* Outer */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-32 bg-orange-600 rounded-t-full rounded-b-[36px] blur-[12px] opacity-70 animate-flicker-slow"></div>
                    </div>

                    {/* Embers */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(minDim === 1 ? 4 : 10)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute bg-yellow-200 rounded-full opacity-0 animate-ember"
                                style={{
                                    width: Math.random() > 0.5 ? '2px' : '4px',
                                    height: Math.random() > 0.5 ? '2px' : '4px',
                                    left: `${25 + Math.random() * 50}%`,
                                    bottom: '50px',
                                    animationDuration: `${2.5 + Math.random() * 2}s`,
                                    animationDelay: `${Math.random() * 1.5}s`
                                }}
                            />
                        ))}
                    </div>
                </div>

                <style>{`
                    @keyframes flicker {
                        0%, 100% { transform: translateX(-50%) scaleY(1); opacity: 0.9; }
                        50% { transform: translateX(-50%) scaleY(1.05); opacity: 0.8; }
                    }
                    @keyframes flicker-slow {
                        0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.6; }
                        50% { transform: translateX(-50%) scale(1.03); opacity: 0.7; }
                    }
                     @keyframes flicker-core {
                        0%, 100% { transform: translateX(-50%) scale(0.95); opacity: 0.9; }
                        50% { transform: translateX(-50%) scale(1.05); opacity: 1; }
                    }
                    .animate-flicker { animation: flicker 0.2s infinite alternate; }
                    .animate-flicker-slow { animation: flicker-slow 0.6s infinite alternate; }
                     .animate-flicker-core { animation: flicker-core 0.1s infinite alternate; }
                    .animate-pulse-slow { animation: pulse 3s infinite; }

                    @keyframes ember {
                        0% { bottom: 40%; opacity: 1; transform: translateX(0); }
                        100% { bottom: 90%; opacity: 0; transform: translateX(10px); }
                    }
                    .animate-ember { animation: ember linear infinite; }
                `}</style>
            </div>
        </WidgetWrapper>
    );
}
