import React from 'react';

export const TextScrollerConfig = {
    defaultSize: '2x1',
    validSizes: [[1, 1], [2, 1]] as [number, number][],
};

export const TextScroller = React.memo(({ text = 'HELLO WORLD', gridSize: _ }: { text?: string, gridSize?: { w: number; h: number } }) => {
    return (
        <div className="w-full h-full bg-black text-[#00ff00] p-2 rounded-lg overflow-hidden font-mono flex items-center relative border-2 md:border-4 border-gray-800 shadow-inner">
            <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
            <div className="whitespace-nowrap animate-[scroll-left_10s_linear_infinite] text-sm md:text-xl font-bold tracking-widest">
                {text}
            </div>
        </div>
    );
});
