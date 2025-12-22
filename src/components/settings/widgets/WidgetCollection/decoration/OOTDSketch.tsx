import React, { useState } from 'react';
import { WidgetWrapper } from '../Common';

// --- 6. OOTD Sketch (오늘의 옷)
export const OOTDSketch = React.memo(function OOTDSketch() {
    const [topIdx, setTopIdx] = useState(0);
    const [bottomIdx, setBottomIdx] = useState(0);
    const tops = ['👕', '👚', '🧥', '👔', '👗'];
    const bottoms = ['👖', '🩳', '👙', '🩰', '👢'];

    return (
        <WidgetWrapper className="bg-purple-50">
            <h3 className="text-[10px] font-bold text-purple-400 mb-1 tracking-widest">OOTD</h3>
            <div className="flex flex-col items-center gap-1">
                <button
                    onClick={() => setTopIdx((p) => (p + 1) % tops.length)}
                    className="text-3xl hover:scale-110 transition-transform p-1 bg-white rounded-lg shadow-sm"
                >
                    {tops[topIdx]}
                </button>
                <button
                    onClick={() => setBottomIdx((p) => (p + 1) % bottoms.length)}
                    className="text-3xl hover:scale-110 transition-transform p-1 bg-white rounded-lg shadow-sm"
                >
                    {bottoms[bottomIdx]}
                </button>
            </div>
        </WidgetWrapper>
    );
});
