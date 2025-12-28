import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { WidgetWrapper } from '../Common';

export const BookCoverConfig = {
    defaultSize: '2x1',
    validSizes: [[1, 1], [2, 1], [2, 2]] as [number, number][],
};

// --- 7. Book Cover (읽는 책)
export const BookCover = React.memo(function BookCover({ gridSize }: { gridSize?: { w: number; h: number } }) {
    const [page] = useState(42);
    const total = 300;
    const progress = Math.min(100, Math.round((page / total) * 100));

    return (
        <WidgetWrapper className="bg-[#f5e6d3]">
            <div className="flex items-start gap-2 w-full h-full">
                <div className="w-12 h-16 bg-[#8b4513] rounded-sm shadow-md flex items-center justify-center text-white/50">
                    <BookOpen size={16} />
                </div>
                <div className="flex-1 flex flex-col justify-between h-full py-1">
                    <div>
                        <p className="text-xs font-serif font-bold text-[#5c4033] line-clamp-1">데미안</p>
                        <p className="text-[10px] text-[#8b4513]/70">H. Hesse</p>
                    </div>
                    <div className="w-full">
                        <div className="flex justify-between text-[8px] text-[#5c4033] mb-0.5">
                            <span>p.{page}</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#d2b48c] rounded-full overflow-hidden">
                            <div className="h-full bg-[#8b4513]" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </WidgetWrapper>
    );
});
