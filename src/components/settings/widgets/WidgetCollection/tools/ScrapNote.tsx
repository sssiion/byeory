import React from 'react';

// --- 2. Scrap Note (찢어진 노트) ---
export function ScrapNote({ onUpdate, text = '' }: { onUpdate?: (data: any) => void, text?: string }) {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (onUpdate) onUpdate({ text: e.target.value });
    };

    return (
        <div className="w-full h-full bg-[#f0e6d2] p-4 shadow-md relative overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 5% 100%, 0 95%)' }}>
            <div className="absolute top-0 left-0 w-full h-6 bg-[#e6dcc8] border-b border-[#d4c9b3] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#c0b090] mx-1"></div>
                <div className="w-2 h-2 rounded-full bg-[#c0b090] mx-1"></div>
            </div>
            <textarea
                className="w-full h-full mt-4 bg-transparent resize-none outline-none text-[#5c4a35] jua-regular text-sm leading-6"
                placeholder="Type something..."
                value={text}
                onChange={handleChange}
                style={{ backgroundImage: 'linear-gradient(transparent 23px, #d4c9b3 24px)', backgroundSize: '100% 24px' }}
            />
        </div>
    );
}
