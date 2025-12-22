import { useState, useRef } from 'react';
import { WidgetWrapper } from '../Common';

// --- 9. Daily Stamp (참잘했어요)
export function DailyStamp() {
    const [stamps, setStamps] = useState<{ x: number, y: number }[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const addStamp = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setStamps([...stamps, { x, y }]);
    };

    return (
        <WidgetWrapper className="bg-white p-0 overflow-hidden relative group">
            <div
                ref={containerRef}
                onClick={addStamp}
                className="w-full h-full relative cursor-cell bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"
            >
                <span className="absolute top-2 left-2 text-[10px] text-gray-400 font-mono">DAILY LOG</span>
                {stamps.map((s, i) => (
                    <div
                        key={i}
                        className="absolute w-8 h-8 flex items-center justify-center text-red-500 font-bold border-2 border-red-500 rounded-full text-[8px] rotate-[-15deg] animate-in zoom-in fade-in duration-200 pointer-events-none"
                        style={{ left: s.x - 16, top: s.y - 16 }}
                    >
                        Good!
                    </div>
                ))}
                {stamps.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs pointer-events-none group-hover:hidden">
                        Click anywhere!
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}
