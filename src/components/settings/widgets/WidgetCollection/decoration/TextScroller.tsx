import React, { useState } from 'react';
import { useWidgetStorage } from '../SDK';
import { Settings } from 'lucide-react';

export const TextScrollerConfig = {
    defaultSize: '2x1',
    validSizes: [[1, 1], [1, 2], [2, 1], [2, 2], [3, 1], [4, 1]] as [number, number][],
};

export const TextScroller = React.memo(({ text: initialText = 'HELLO WORLD', gridSize: _ }: { text?: string, gridSize?: { w: number; h: number } }) => {
    const [text, setText] = useWidgetStorage('textscroller-text', initialText);
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
        return (
            <div className="w-full h-full bg-black text-[#00ff00] p-2 rounded-lg overflow-hidden font-mono flex flex-col items-center justify-center relative border-2 md:border-4 border-gray-800 shadow-inner gap-2">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="bg-gray-900 text-[#00ff00] text-xs p-1 w-full border border-gray-700 rounded"
                    placeholder="Enter text..."
                />
                <button onClick={() => setIsEditing(false)} className="text-xs bg-gray-800 px-2 py-1 rounded hover:bg-gray-700">OK</button>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-black text-[#00ff00] p-2 rounded-lg overflow-hidden font-mono flex items-center relative border-2 md:border-4 border-gray-800 shadow-inner group">
            <button
                onClick={() => setIsEditing(true)}
                className="absolute top-1 right-1 text-gray-500 hover:text-[#00ff00] opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <Settings size={12} />
            </button>
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
