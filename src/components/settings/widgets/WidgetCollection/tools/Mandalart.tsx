import { useState } from 'react';
import { WidgetWrapper } from '../Common';

interface MandalartProps {
    gridSize?: { w: number; h: number };
}

// 9 cells: Center (4) is Main Goal. 0-3, 5-8 are sub-goals.
// Simplified for widget: We focus on the Central 3x3 block of a full Mandalart (which is 9x9).
// A full 9x9 is too big for a widget. Let's do a single 3x3 core block.
// 0 1 2
// 3 4 5  <- 4 is Center
// 6 7 8

export function Mandalart({ gridSize }: MandalartProps) {
    // Load from local storage key unique to widget/user if possible, but simplified here with one global key
    const [goals, setGoals] = useState<string[]>(() => {
        const saved = localStorage.getItem('mandalart_core');
        return saved ? JSON.parse(saved) : Array(9).fill('');
    });

    const [editIdx, setEditIdx] = useState<number | null>(null);

    const w = gridSize?.w || 2;
    const isSmall = w === 1;

    const handleSave = (idx: number, val: string) => {
        const newGoals = [...goals];
        newGoals[idx] = val;
        setGoals(newGoals);
        localStorage.setItem('mandalart_core', JSON.stringify(newGoals));
        setEditIdx(null);
    };

    // Center cell index is 4
    const centerGoal = goals[4] || 'Main Goal';

    // --- Small View ---
    if (isSmall) {
        return (
            <WidgetWrapper className="bg-white dark:bg-slate-800 flex items-center justify-center text-center p-2 border-2 border-indigo-100 dark:border-indigo-900">
                <div>
                    <p className="text-[8px] text-indigo-400 font-bold mb-1 uppercase tracking-wider">FOCUS</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-2 leading-tight">
                        {centerGoal}
                    </p>
                </div>
            </WidgetWrapper>
        );
    }

    // --- Medium/Large View (3x3 Grid) ---
    return (
        <WidgetWrapper className="bg-white dark:bg-slate-800 p-2">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
                {goals.map((goal, idx) => {
                    const isCenter = idx === 4;
                    const isEditing = editIdx === idx;

                    return (
                        <div
                            key={idx}
                            onClick={() => !isEditing && setEditIdx(idx)}
                            className={`
                                relative flex items-center justify-center p-1 text-center cursor-pointer transition-colors rounded
                                ${isCenter
                                    ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-100 font-bold'
                                    : 'bg-gray-50 text-gray-600 dark:bg-white/5 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'}
                            `}
                        >
                            {isEditing ? (
                                <input
                                    autoFocus
                                    className="w-full text-center bg-transparent text-[10px] outline-none"
                                    value={goal}
                                    onChange={(e) => {
                                        const newGoals = [...goals];
                                        newGoals[idx] = e.target.value;
                                        setGoals(newGoals);
                                    }}
                                    onBlur={(e) => handleSave(idx, e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSave(idx, (e.target as HTMLInputElement).value);
                                    }}
                                />
                            ) : (
                                <span className={`text-[10px] leading-tight break-words w-full ${!goal && 'opacity-30'}`}>
                                    {goal || (isCenter ? 'Main Goal' : '+')}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </WidgetWrapper>
    );
}
