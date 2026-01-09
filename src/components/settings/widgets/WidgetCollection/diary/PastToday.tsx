import { memo } from 'react';
import { History } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';

// 8. Past Today (과거의 오늘)
export const PastToday = memo(function PastToday({ gridSize }: { gridSize?: { w: number; h: number } }) {

    const isSmall = (gridSize?.w || 2) < 2 && (gridSize?.h || 2) < 2;

    if (isSmall) {
        return (
            <WidgetWrapper className="bg-slate-50 border-slate-100 flex flex-col items-center justify-center p-1">
                <History size={20} className="text-slate-400 mb-1" />
                <span className="text-[8px] font-bold text-slate-500">1 YEAR AGO</span>
            </WidgetWrapper>
        );
    }
    return (
        <WidgetWrapper className="bg-slate-50 border-slate-100">
            <div className="w-full h-full p-3 flex flex-col justify-between">
                <div>
                    <h3 className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><History size={10} /> 1년 전 오늘</h3>
                    <p className="text-sm font-serif text-slate-800 leading-snug">
                        "처음으로 혼자 여행을 떠난 날. 조금 무섭지만 설렌다."
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-full shadow-sm border border-slate-100">2024.12.12</span>
                </div>
            </div>
        </WidgetWrapper>
    );
});

