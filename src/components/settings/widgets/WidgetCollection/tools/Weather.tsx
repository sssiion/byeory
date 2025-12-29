import { Sun, CloudRain, CloudSnow, Cloud, Wind, Droplets } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';
import { useWidgetStorage } from '../SDK';

type WeatherType = 'sun' | 'rain' | 'cloud' | 'snow';

export const WeatherWidgetConfig = {
    defaultSize: '2x1',
    validSizes: [[1, 1], [2, 1], [2, 2]] as [number, number][],
};

// 10. Weather Widget (날씨)
export function WeatherWidget() {
    const [weather, setWeather] = useWidgetStorage<WeatherType>('widget-weather-state', 'sun');

    const nextWeather = () => {
        const flow: WeatherType[] = ['sun', 'cloud', 'rain', 'snow'];
        const nextIndex = (flow.indexOf(weather) + 1) % flow.length;
        setWeather(flow[nextIndex]);
    };

    const styles = {
        sun: {
            bg: 'bg-gradient-to-br from-blue-400 to-blue-200',
            text: 'text-white',
            subText: 'text-blue-50',
            icon: <Sun className="w-16 h-16 text-yellow-300 animate-[spin_10s_linear_infinite]" />,
            temp: '24°',
            desc: '맑음'
        },
        cloud: {
            bg: 'bg-gradient-to-br from-gray-400 to-gray-200',
            text: 'text-white',
            subText: 'text-gray-100',
            icon: <Cloud className="w-16 h-16 text-white animate-pulse" />,
            temp: '18°',
            desc: '흐림'
        },
        rain: {
            bg: 'bg-gradient-to-br from-slate-700 to-slate-500',
            text: 'text-white',
            subText: 'text-slate-300',
            icon: <CloudRain className="w-16 h-16 text-blue-200 animate-bounce" />,
            temp: '15°',
            desc: '비'
        },
        snow: {
            bg: 'bg-gradient-to-br from-indigo-300 to-white',
            text: 'text-slate-600',
            subText: 'text-slate-400',
            icon: <CloudSnow className="w-16 h-16 text-white animate-pulse" />,
            temp: '-2°',
            desc: '눈'
        }
    };

    const current = styles[weather];

    return (
        <WidgetWrapper className={`${current.bg} transition-all duration-500 overflow-hidden`}>
            {/* Background Decoration */}
            <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-black/5 rounded-full blur-xl" />

            <div
                className="relative w-full h-full flex items-center justify-between p-5 cursor-pointer"
                onClick={nextWeather}
            >
                <div className="flex flex-col z-10">
                    <div className="flex items-start gap-1">
                        <span className={`text-5xl font-bold tracking-tighter ${current.text} drop-shadow-sm`}>{current.temp}</span>
                    </div>
                    <span className={`text-lg font-medium mt-1 ${current.text}`}>{current.desc}</span>
                    <span className={`text-xs ${current.subText} mt-0.5`}>Seoul, KR</span>

                    {/* Tiny details */}
                    <div className="flex gap-3 mt-3">
                        <div className={`flex items-center gap-1 text-[10px] ${current.subText}`}>
                            <Droplets size={10} />
                            <span>42%</span>
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] ${current.subText}`}>
                            <Wind size={10} />
                            <span>3m/s</span>
                        </div>
                    </div>
                </div>

                <div className="z-10 filter drop-shadow-lg transform transition-transform active:scale-90">
                    {current.icon}
                </div>
            </div>
        </WidgetWrapper>
    );
}
