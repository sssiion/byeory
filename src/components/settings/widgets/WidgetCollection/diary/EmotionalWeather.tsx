import { useState } from 'react';
import { Sun, Cloud, CloudRain } from 'lucide-react';
import { WidgetWrapper } from '../Common';

// --- 4. Emotional Weather (마음 날씨)
export const EmotionalWeatherConfig = {
    defaultSize: '1x1',
    validSizes: [[1, 1], [2, 1]] as [number, number][],
};

export function EmotionalWeather() {
    const [weather, setWeather] = useState<'sun' | 'cloud' | 'rain'>('sun');

    return (
        <WidgetWrapper className={`${weather === 'sun' ? 'bg-blue-50' : weather === 'rain' ? 'bg-gray-800' : 'bg-gray-100'} transition-colors duration-500`}>
            <div className="flex-1 flex items-center justify-center">
                {weather === 'sun' && <Sun className="w-10 h-10 text-orange-500 animate-spin-slow" />}
                {weather === 'cloud' && <Cloud className="w-10 h-10 text-gray-500" />}
                {weather === 'rain' && <CloudRain className="w-10 h-10 text-blue-300 animate-bounce" />}
            </div>
            <div className="flex gap-2 bg-white/50 p-1 rounded-full backdrop-blur-sm">
                <button onClick={() => setWeather('sun')} className="p-1 hover:bg-white rounded-full transition-colors"><Sun size={14} className="text-orange-500" /></button>
                <button onClick={() => setWeather('cloud')} className="p-1 hover:bg-white rounded-full transition-colors"><Cloud size={14} className="text-gray-500" /></button>
                <button onClick={() => setWeather('rain')} className="p-1 hover:bg-white rounded-full transition-colors"><CloudRain size={14} className="text-blue-500" /></button>
            </div>
        </WidgetWrapper>
    );
}
