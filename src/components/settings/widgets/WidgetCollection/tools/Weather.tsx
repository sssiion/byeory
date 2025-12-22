import { useState } from 'react';
import { Sun, CloudRain } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';

// 10. Weather Widget (날씨)
export function WeatherWidget() {
    const [weather, setWeather] = useState('sun');

    return (
        <WidgetWrapper className="bg-sky-50">
            <div className="w-full h-full flex items-center justify-between p-4">
                <div className="flex flex-col">
                    <span className="text-3xl font-bold text-gray-800">24°</span>
                    <span className="text-xs text-gray-500">Seoul, KR</span>
                </div>
                <div onClick={() => setWeather(weather === 'sun' ? 'rain' : 'sun')} className="cursor-pointer">
                    {weather === 'sun' ?
                        <Sun className="w-12 h-12 text-orange-400 animate-spin-slow" /> :
                        <CloudRain className="w-12 h-12 text-blue-400 animate-bounce" />
                    }
                </div>
            </div>
        </WidgetWrapper>
    );
}
