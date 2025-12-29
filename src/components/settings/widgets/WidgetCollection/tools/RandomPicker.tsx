import React, { useState } from 'react';
import { Play, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWidgetStorage } from '../SDK';

export const RandomPickerConfig = {
    defaultSize: '2x2',
    validSizes: [[1, 1], [2, 2]] as [number, number][],
};

export function RandomPicker({ gridSize }: { gridSize?: { w: number; h: number } }) {
    const [items, setItems] = useWidgetStorage<string[]>('widget-random-picker-items', ['짜장면', '짬뽕', '탕수육', '볶음밥', '마라탕', '쌀국수', '돈까스', '제육볶음']);
    const [newItem, setNewItem] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);

    const handleAddItem = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (newItem.trim()) {
            setItems([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const handleRemoveItem = (index: number) => {
        if (items.length <= 2) return; // Minimum 2 items
        setItems(items.filter((_, i) => i !== index));
    };

    const spin = () => {
        if (isSpinning || items.length < 2) return;

        setIsSpinning(true);
        setResult(null);

        const segmentAngle = 360 / items.length;

        const spinAmount = 1800 + Math.random() * 360 + 720; // 5-8 full spins
        const finalRotation = rotation + spinAmount;

        setRotation(finalRotation);

        setTimeout(() => {
            setIsSpinning(false);

            const actualRotation = finalRotation % 360;
            const degreesFromTop = (360 - actualRotation) % 360;
            const winningIndex = Math.floor(degreesFromTop / segmentAngle);
            const finalIndex = (winningIndex) % items.length;

            setResult(items[finalIndex]);
        }, 3000); // 3 seconds spin
    };

    const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'];

    const isSmall = (gridSize?.w || 2) < 2;

    if (isSmall) {
        return (
            <div className="h-full flex flex-col items-center justify-center theme-bg-card rounded-xl shadow-sm border theme-border p-1 relative overflow-hidden">
                <button
                    onClick={spin}
                    disabled={isSpinning}
                    className="w-full h-full flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95 transition-all"
                >
                    {result && !isSpinning ? (
                        <span className="text-[10px] font-bold text-[var(--btn-bg)] text-center animate-in zoom-in">{result}</span>
                    ) : (
                        <>
                            <Play size={20} className={isSpinning ? 'animate-spin' : ''} />
                            <span className="text-[8px] font-bold mt-1 max-w-full truncate">{isSpinning ? '...' : 'SPIN'}</span>
                        </>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-4 theme-bg-card rounded-xl shadow-sm border theme-border overflow-hidden">

            {/* Main Area: Wheel or Result */}
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-0">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                    {/* Pointer */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-red-500 drop-shadow-md"></div>

                    {/* Wheel */}
                    <div
                        className="w-full h-full rounded-full overflow-hidden shadow-lg border-4 border-white relative transition-transform duration-[3000ms] cubic-bezier(0.2, 0.8, 0.2, 1)"
                        style={{ transform: `rotate(${rotation}deg)` }}
                    >
                        {items.map((_, index) => {
                            const angle = 360 / items.length;
                            const rotate = angle * index;

                            return (
                                <div
                                    key={index}
                                    className="absolute w-full h-full top-0 left-0 flex justify-center pt-2 origin-[50%_50%]"
                                    style={{
                                        transform: `rotate(${rotate}deg)`,
                                    }}
                                >
                                </div>
                            );
                        })}

                        {/* Alternative: SVG Wheel */}
                        <svg viewBox="0 0 100 100" className="w-full h-full absolute top-0 left-0 transform -rotate-90">
                            {items.map((_, index) => {
                                // Calculate svg path for slice
                                const startAngle = (index * 360) / items.length;
                                const endAngle = ((index + 1) * 360) / items.length;

                                // Convert to radians
                                const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
                                const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
                                const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
                                const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);

                                const largeArc = endAngle - startAngle > 180 ? 1 : 0;

                                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;

                                return (
                                    <path
                                        key={index}
                                        d={pathData}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke="white"
                                        strokeWidth="0.5"
                                    />
                                );
                            })}
                        </svg>

                        {/* Text Overlay */}
                        {items.map((item, index) => {
                            const angle = (index * 360) / items.length + (360 / items.length / 2); // Center of slice
                            return (
                                <div
                                    key={index}
                                    className="absolute top-1/2 left-1/2 w-full h-[1px] origin-left flex items-center"
                                    style={{
                                        transform: `translate(0, -50%) rotate(${angle - 90}deg)`, // -90 because 0 is right in CSS rotation usually, but we want top
                                        width: '50%'
                                    }}
                                >
                                    <span className="text-white text-[10px] font-bold truncate px-2 ml-4 w-20 text-center drop-shadow-sm" style={{ transform: 'rotate(90deg)' }}>
                                        {item}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Result Modal / Overlay */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl z-30"
                        >
                            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-2 animate-bounce-slow">
                                <span className="text-sm text-gray-500">당첨!</span>
                                <h3 className="text-2xl font-bold text-[var(--btn-bg)]">{result}</h3>
                                <button
                                    onClick={() => setResult(null)}
                                    className="mt-2 px-4 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-200"
                                >
                                    확인
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="mt-4 flex flex-col gap-2">
                <div className="flex gap-2">
                    <form onSubmit={handleAddItem} className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder="Add item..."
                            className="flex-1 text-xs px-2 py-1 theme-bg-input rounded border theme-border outline-none focus:border-[var(--btn-bg)]"
                        />
                        <button type="submit" disabled={isSpinning} className="p-1 rounded bg-[var(--btn-bg)] text-white hover:opacity-90 disabled:opacity-50">
                            <Plus size={16} />
                        </button>
                    </form>
                    <button
                        onClick={spin}
                        disabled={isSpinning || items.length < 2}
                        className="px-4 py-1 lg:py-2 bg-[var(--btn-bg)] text-white font-bold rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-1"
                    >
                        <Play size={16} fill="currentColor" /> SPIN
                    </button>
                </div>

                {/* List of items (manage) */}
                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto mt-1 scrollbar-hide">
                    {items.map((item, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full theme-bg-card-secondary theme-text-secondary flex items-center gap-1 border border-gray-100">
                            {item}
                            {items.length > 2 && !isSpinning && (
                                <button onClick={() => handleRemoveItem(idx)} className="hover:text-red-500"><X size={10} /></button>
                            )}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
