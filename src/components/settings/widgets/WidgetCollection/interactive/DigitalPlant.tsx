import { useState } from 'react';
import { Droplets } from 'lucide-react';
import { WidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';

interface DigitalPlantData {
    level: number;
    exp: number;
}

// --- 4. Digital Plant (반려 식물) ---
export function DigitalPlant({ onUpdate, level: propLevel, exp: propExp, name: propName }: { onUpdate?: (data: DigitalPlantData) => void, level?: number, exp?: number, name?: string }) {
    // Persist plant state
    const [plantState, setPlantState] = useWidgetStorage('widget-digital-plant', {
        level: propLevel || 1,
        exp: propExp || 0,
        name: propName || '새싹이'
    });

    const { level, exp, name } = plantState;
    const [isWatering, setIsWatering] = useState(false);
    const maxExp = level * 100;

    const water = () => {
        if (isWatering) return;
        setIsWatering(true);

        // Calculate new exp
        let newExp = exp + 20;
        let newLevel = level;

        if (newExp >= maxExp) {
            newExp = newExp - maxExp;
            newLevel = Math.min(level + 1, 4); // Max level 4
        }

        // Save state immediately (or after delay? interactive needs immediate feedback usually, but animation is delay)
        // Let's update state in timeout to match animation
        setTimeout(() => {
            setPlantState({ ...plantState, level: newLevel, exp: newExp });
            if (onUpdate) onUpdate({ level: newLevel, exp: newExp });
            setIsWatering(false);
        }, 1000);
    };

    const getPlantImage = () => {
        if (level === 1) return (
            <div className="text-2xl animate-bounce">🌱</div>
        );
        if (level === 2) return (
            <div className="text-4xl animate-pulse">🌿</div>
        );
        if (level === 3) return (
            <div className="relative">
                <div className="text-5xl">🪴</div>
                <div className="absolute -top-2 -right-2 text-xl animate-bounce delay-100">✨</div>
            </div>
        );
        return (
            <div className="relative">
                <div className="text-6xl">🌺</div>
                <div className="absolute -top-2 -right-2 text-xl animate-spin-slow">🐝</div>
            </div>
        );
    };

    return (
        <WidgetWrapper className="bg-green-50/50 dark:bg-green-900/20 border-green-100 dark:border-green-800">
            <div className="w-full h-full flex flex-col items-center justify-between py-2">
                <div className="flex justify-between w-full px-2 items-center">
                    <span className="text-xs font-bold text-green-800 dark:text-green-300">{name}</span>
                    <span className="text-[10px] bg-green-200 dark:bg-green-800 px-1.5 py-0.5 rounded-full text-green-800 dark:text-green-200">Lv.{level}</span>
                </div>

                <div className="relative flex-1 flex items-center justify-center w-full">
                    {/* Watering Can Animation */}
                    {isWatering && (
                        <div className="absolute top-0 right-4 text-2xl animate-pour z-10">
                            🚿
                            <div className="absolute top-full left-1 w-full flex justify-center">
                                <div className="w-0.5 h-4 bg-blue-400 animate-drip"></div>
                            </div>
                        </div>
                    )}

                    {/* Plant */}
                    <div className="transition-transform duration-500 hover:scale-110 cursor-pointer" onClick={water}>
                        {getPlantImage()}
                    </div>
                </div>

                <div className="w-full px-2 flex flex-col gap-1">
                    <div className="flex justify-between text-[8px] text-green-600 dark:text-green-400">
                        <span>EXP</span>
                        <span>{Math.floor((exp / maxExp) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${(exp / maxExp) * 100}%` }}
                        ></div>
                    </div>
                    <button
                        onClick={water}
                        disabled={isWatering || level >= 4}
                        className="mt-1 w-full py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-colors flex items-center justify-center gap-1"
                    >
                        <Droplets size={10} />
                        {level >= 4 ? 'Max Level' : 'Water'}
                    </button>
                </div>
            </div>
        </WidgetWrapper>
    );
}
