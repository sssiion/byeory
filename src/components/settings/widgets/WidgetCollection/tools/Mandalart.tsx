import { useState } from 'react';
import { WidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';

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
    // SDK Storage
    const [goals, setGoals] = useWidgetStorage<string[]>('widget-mandalart-core', Array(9).fill(''));

    const [editIdx, setEditIdx] = useState<number | null>(null);

    const handleSave = (idx: number, val: string) => {
        const newGoals = [...goals];
        newGoals[idx] = val;
        setGoals(newGoals);
        setEditIdx(null);
    };

    // Center cell index is 4
    const centerGoal = goals[4] || 'Main Goal';

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
