import { useState } from 'react';
import { WidgetWrapper } from '../Common';

export const BubbleWrapConfig = {
    defaultSize: '2x2',
    validSizes: [[2, 2], [3, 3], [4, 4]] as [number, number][],
};

// --- 8. Bubble Wrap (뽁뽁이)
export function BubbleWrap() {
    const [popped, setPopped] = useState<Set<number>>(new Set());

    const pop = (i: number) => {
        if (!popped.has(i)) {
            const next = new Set(popped);
            next.add(i);
            setPopped(next);
        }
    };

    return (
        <WidgetWrapper className="bg-blue-50/50 p-2 overflow-auto"> {/* 스크롤 허용 */}
            <div className="grid grid-cols-20 gap-2 w-full min-w-[400px]"> {/* 열 개수를 줄여 개별 원의 공간 확보 */}
                {Array.from({ length: 200 }).map((_, i) => ( // 200개 유지
                    <button
                        key={i}
                        onClick={() => pop(i)}
                        className={`aspect-square rounded-full shadow-inner border transition-all ${popped.has(i)
                            ? 'bg-transparent border-blue-100 scale-90'
                            : 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 hover:scale-105 active:scale-95'
                            } w-full`} // 부모 그리드 너비에 맞춰 꽉 채움
                    />
                ))}
            </div>
        </WidgetWrapper>
    );
}
