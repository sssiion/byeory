import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { WidgetWrapper } from '../Common';
import { useWidgetStorage, useWidgetInterval } from '../SDK';

interface RecipeCardProps {
    gridSize?: { w: number; h: number };
}

export const RecipeCardConfig = {
    defaultSize: '2x2',
    validSizes: [[1, 2], [2, 1], [2, 2]] as [number, number][],
};

export function RecipeCard({ gridSize }: RecipeCardProps) {
    const [timeLeft, setTimeLeft] = useWidgetStorage('widget-recipe-time', 180); // Default 3 min, synced
    const [isActive, setIsActive] = useWidgetStorage('widget-recipe-active', false);

    // Ingredients demo state
    const [checked, setChecked] = useWidgetStorage<boolean[]>('widget-recipe-checked', [false, false, false]);

    useWidgetInterval(() => {
        if (timeLeft > 0) {
            setTimeLeft(timeLeft - 1);
        } else {
            setIsActive(false);
        }
    }, isActive ? 1000 : null);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => { setIsActive(false); setTimeLeft(180); }; // Default 3 min

    const w = gridSize?.w || 2;
    const h = gridSize?.h || 2;
    // 2x1 layout: Is wide
    const isWide = w >= 2 && h === 1;

    // Timer display formatter
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <WidgetWrapper className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 p-0 overflow-hidden">
            <div className={`h-full flex ${isWide ? 'flex-row' : 'flex-col'}`}>
                {/* Header (Photo) */}
                <div className={`${isWide ? 'w-1/3 h-full' : 'h-16 w-full'} bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center px-4 relative overflow-hidden flex-shrink-0`}>
                    <div className="absolute right-[-10px] top-[-10px] w-20 h-20 rounded-full bg-orange-200/50 blur-xl"></div>
                    <h3 className="text-sm font-serif font-bold text-orange-900 dark:text-orange-100 relative z-10 text-center leading-tight">Pancakes 🥞</h3>
                </div>

                {/* Content */}
                <div className="flex-1 p-2 flex flex-col min-w-0">
                    {/* Timer Section */}
                    {!(w === 1 && h === 2) && ( // Hide timer on 1x2 (too tall/narrow?) No, allow it.
                        <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-800 rounded-lg p-1.5 mb-2 border border-stone-100 dark:border-stone-700 shrink-0">
                            <div className="flex items-center gap-2">
                                <Timer size={14} className="text-stone-400" />
                                <span className="font-mono font-bold text-md text-stone-700 dark:text-stone-200">{formatTime(timeLeft)}</span>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={toggleTimer} className="w-5 h-5 flex items-center justify-center rounded bg-white dark:bg-stone-700 shadow-sm text-stone-600 dark:text-stone-300 active:scale-95">
                                    {isActive ? <Pause size={10} /> : <Play size={10} />}
                                </button>
                                <button onClick={resetTimer} className="w-5 h-5 flex items-center justify-center rounded bg-white dark:bg-stone-700 shadow-sm text-stone-600 dark:text-stone-300 active:scale-95">
                                    <RotateCcw size={10} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Checkbox List */}
                    <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                        {['Flour 200g', 'Milk 300ml', 'Egg x2', 'Butter 50g', 'Syrup'].map((item, i) => (
                            <label key={i} className="flex items-center gap-2 text-[10px] text-stone-600 dark:text-stone-400 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 p-1 rounded">
                                <input
                                    type="checkbox"
                                    checked={checked[i]}
                                    onChange={() => {
                                        const next = [...checked];
                                        next[i] = !next[i];
                                        setChecked(next);
                                    }}
                                    className="accent-orange-500 rounded-sm w-3 h-3 flex-shrink-0"
                                />
                                <span className={`truncate ${checked[i] ? 'line-through opacity-50' : ''}`}>{item}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </WidgetWrapper>
    );
}
