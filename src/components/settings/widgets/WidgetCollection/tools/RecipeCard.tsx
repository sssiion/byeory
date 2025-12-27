import { useState, useEffect } from 'react';
import { ChefHat, Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { WidgetWrapper } from '../Common';

interface RecipeCardProps {
    gridSize?: { w: number; h: number };
}

export function RecipeCard({ gridSize }: RecipeCardProps) {
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [isActive, setIsActive] = useState(false);

    // Ingredients demo state
    const [checked, setChecked] = useState<boolean[]>([false, false, false]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => { setIsActive(false); setTimeLeft(180); }; // Default 3 min

    const w = gridSize?.w || 2;
    const isSmall = w === 1;

    // Timer display formatter
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (isSmall) {
        return (
            <WidgetWrapper className="bg-white border-orange-100 flex flex-col items-center justify-center p-2">
                <ChefHat className="text-orange-400 mb-1" size={16} />
                <div className={`font-mono font-bold text-xl ${isActive ? 'text-orange-600' : 'text-gray-400'}`}>
                    {formatTime(timeLeft)}
                </div>
                <button onClick={timeLeft === 0 ? resetTimer : toggleTimer} className="mt-1 p-1 rounded-full bg-orange-50 hover:bg-orange-100 text-orange-500">
                    {timeLeft === 0 ? <RotateCcw size={12} /> : (isActive ? <Pause size={12} /> : <Play size={12} />)}
                </button>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 p-0 overflow-hidden">
            <div className="h-full flex flex-col">
                {/* Header (Photo) */}
                <div className="h-16 bg-orange-100 dark:bg-orange-900/30 flex items-center px-4 relative overflow-hidden">
                    <div className="absolute right-[-10px] top-[-10px] w-20 h-20 rounded-full bg-orange-200/50 blur-xl"></div>
                    <h3 className="text-sm font-serif font-bold text-orange-900 dark:text-orange-100 relative z-10">Pancakes 🥞</h3>
                </div>

                {/* Content */}
                <div className="flex-1 p-3 flex flex-col">
                    {/* Timer Section */}
                    <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-800 rounded-lg p-2 mb-3 border border-stone-100 dark:border-stone-700">
                        <div className="flex items-center gap-2">
                            <Timer size={14} className="text-stone-400" />
                            <span className="font-mono font-bold text-lg text-stone-700 dark:text-stone-200">{formatTime(timeLeft)}</span>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={toggleTimer} className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-stone-700 shadow-sm text-stone-600 dark:text-stone-300 active:scale-95">
                                {isActive ? <Pause size={10} /> : <Play size={10} />}
                            </button>
                            <button onClick={resetTimer} className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-stone-700 shadow-sm text-stone-600 dark:text-stone-300 active:scale-95">
                                <RotateCcw size={10} />
                            </button>
                        </div>
                    </div>

                    {/* Checkbox List */}
                    <div className="flex-1 overflow-y-auto space-y-1">
                        {['Flour 200g', 'Milk 300ml', 'Egg x2'].map((item, i) => (
                            <label key={i} className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 p-1 rounded">
                                <input
                                    type="checkbox"
                                    checked={checked[i]}
                                    onChange={() => {
                                        const next = [...checked];
                                        next[i] = !next[i];
                                        setChecked(next);
                                    }}
                                    className="accent-orange-500 rounded-sm w-3 h-3"
                                />
                                <span className={checked[i] ? 'line-through opacity-50' : ''}>{item}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </WidgetWrapper>
    );
}
