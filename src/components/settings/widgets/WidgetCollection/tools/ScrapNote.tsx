import React from 'react';
import { useWidgetStorage } from '../SDK';

// --- 2. Scrap Note (찢어진 노트) ---
interface ScrapNoteProps {
    onUpdate?: (data: { text: string }) => void;
    text?: string;
}

export function ScrapNote({ onUpdate, text: initialText = '' }: ScrapNoteProps) {
    const [text, setText] = useWidgetStorage('widget-scrap-note', initialText);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        setText(newVal);
        if (onUpdate) onUpdate({ text: newVal });
    };

    return (
        <div className="w-full h-full bg-[#f0e6d2] dark:bg-[#3d3830] p-4 shadow-md relative overflow-hidden transition-colors"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 5% 100%, 0 95%)' }}>
            <div className="absolute top-0 left-0 w-full h-6 bg-[#e6dcc8] dark:bg-[#4a443a] border-b border-[#d4c9b3] dark:border-[#5c554a] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#c0b090] dark:bg-[#706858] mx-1"></div>
                <div className="w-2 h-2 rounded-full bg-[#c0b090] dark:bg-[#706858] mx-1"></div>
            </div>
            <textarea
                className="w-full h-full mt-4 bg-transparent resize-none outline-none text-[#5c4a35] dark:text-[#d4c9b3] jua-regular text-sm leading-6"
                placeholder="Type something..."
                value={text}
                onChange={handleChange}
                style={{
                    backgroundImage: 'linear-gradient(transparent 23px, currentColor 24px)',
                    backgroundSize: '100% 24px',
                    opacity: 0.8
                }}
            />
        </div>
    );
}
