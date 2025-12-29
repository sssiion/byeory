import { useState, useEffect } from 'react';
import { Sun } from 'lucide-react';
import { WidgetWrapper } from '../Common';

// --- 2. Window View (창밖 풍경) ---
export const WindowViewConfig = {
    defaultSize: '2x2',
    validSizes: [[1, 1], [2, 1], [2, 2]] as [number, number][],
};

export const WindowView = ({ gridSize }: { gridSize?: { w: number; h: number } }) => {
    const isSmall = (gridSize?.w || 2) < 2 && (gridSize?.h || 2) < 2;
    const [weather, setWeather] = useState<'sunny' | 'rainy' | 'snowy' | 'night'>('sunny');
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        // Set initial state based on real time
        const hour = new Date().getHours();
        if (hour < 6 || hour > 18) setWeather('night');

        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const toggleWeather = () => {
        const states: ('sunny' | 'rainy' | 'snowy' | 'night')[] = ['sunny', 'rainy', 'snowy', 'night'];
        const next = states[(states.indexOf(weather) + 1) % states.length];
        setWeather(next);
    };

    if (isSmall) {
        return (
            <WidgetWrapper className="bg-transparent border-none p-0 flex items-center justify-center">
                <div
                    className="w-full h-full rounded-full border-4 border-[#5d4037] relative overflow-hidden cursor-pointer shadow-lg"
                    onClick={toggleWeather}
                >
                    {/* Simplified Sky for Small View */}
                    <div className={`absolute inset-0 transition-colors duration-1000 ${weather === 'night' ? 'bg-[#0f172a]' :
                        weather === 'rainy' ? 'bg-slate-500' :
                            weather === 'snowy' ? 'bg-slate-200' : 'bg-sky-300'
                        }`}></div>

                    {/* Weather Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {weather === 'sunny' && <Sun className="text-yellow-100 w-8 h-8 animate-spin-slow" />}
                        {weather === 'night' && <div className="w-6 h-6 rounded-full bg-yellow-100 shadow-[0_0_10px_white]"></div>}
                        {weather === 'rainy' && <div className="text-white opacity-80 animate-bounce">💧</div>}
                        {weather === 'snowy' && <div className="text-white animate-spin">❄️</div>}
                    </div>

                    {/* Tiny Clock */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-white/90 font-mono font-bold bg-black/20 px-1 rounded">
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="p-0 border-4 border-[#5d4037] bg-[#5d4037] rounded-t-full relative overflow-hidden group">
            {/* Window Frame Inner */}
            <div
                className="w-full h-full bg-sky-300 relative overflow-hidden cursor-pointer"
                onClick={toggleWeather}
            >
                {/* Sky Backgrounds */}
                <div className={`absolute inset-0 transition-opacity duration-1000 ${weather === 'night' ? 'opacity-100' : 'opacity-0'} bg-gradient-to-b from-[#0f172a] to-[#334155]`}>
                    <div className="absolute top-4 right-8 w-8 h-8 rounded-full bg-yellow-100 shadow-[0_0_20px_white]"></div>
                    {/* Stars */}
                    <div className="absolute top-10 left-10 w-0.5 h-0.5 bg-white animate-pulse"></div>
                    <div className="absolute top-6 left-20 w-0.5 h-0.5 bg-white animate-pulse delay-75"></div>
                    <div className="absolute top-16 right-16 w-1 h-1 bg-white animate-pulse delay-150"></div>
                </div>

                <div className={`absolute inset-0 transition-opacity duration-1000 ${weather === 'sunny' ? 'opacity-100' : 'opacity-0'} bg-gradient-to-b from-sky-400 to-sky-200`}>
                    <div className="absolute top-[-10px] left-[-10px] w-20 h-20 rounded-full bg-yellow-400 blur-xl opacity-80"></div>
                    <Sun className="absolute top-4 left-4 text-yellow-100 w-12 h-12 opacity-90 animate-spin-slow" />
                </div>

                <div className={`absolute inset-0 transition-opacity duration-1000 ${weather === 'rainy' ? 'opacity-100' : 'opacity-0'} bg-gradient-to-b from-slate-600 to-slate-400`}>
                    {/* Rain CSS */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20 animate-slide-down"></div>
                </div>

                <div className={`absolute inset-0 transition-opacity duration-1000 ${weather === 'snowy' ? 'opacity-100' : 'opacity-0'} bg-gradient-to-b from-slate-300 to-white`}>
                    {/* Snow CSS simplified */}
                    <div className="absolute w-2 h-2 bg-white rounded-full top-2 left-1/4 animate-fall"></div>
                    <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-0 left-1/2 animate-fall delay-700"></div>
                    <div className="absolute w-2 h-2 bg-white rounded-full top-4 left-3/4 animate-fall delay-300"></div>
                </div>

                {/* Landscape (Hill) */}
                <div className={`absolute bottom-0 w-full h-1/3 rounded-t-[50%] scale-150 transition-colors duration-1000 
          ${weather === 'snowy' ? 'bg-white' : weather === 'night' ? 'bg-[#1e293b]' : 'bg-[#4ade80]'}`}></div>

                {/* Tree */}
                <div className="absolute bottom-4 right-8 w-1 h-12 bg-[#3e2723]">
                    <div className={`absolute -top-8 -left-4 w-10 h-10 rounded-full transition-colors duration-1000
             ${weather === 'snowy' ? 'bg-white' : weather === 'night' ? 'bg-[#0f172a]' : 'bg-[#166534]'}`}></div>
                    <div className={`absolute -top-10 -left-1 w-8 h-8 rounded-full transition-colors duration-1000
             ${weather === 'snowy' ? 'bg-gray-100' : weather === 'night' ? 'bg-[#0f172a]' : 'bg-[#15803d]'}`}></div>
                </div>

                {/* Window Crossbar */}
                <div className="absolute inset-0 pointer-events-none border-4 border-[#5d4037]/20"></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-[#5d4037] -translate-x-1/2 shadow-sm"></div>
                <div className="absolute top-1/2 left-0 right-0 h-2 bg-[#5d4037] -translate-y-1/2 shadow-sm"></div>
            </div>

            {/* Clock overlay */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-[#5d4037] text-[#d7ccc8] text-[10px] px-2 py-0.5 rounded-full font-mono border border-[#8d6e63]">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        </WidgetWrapper>
    );
}
