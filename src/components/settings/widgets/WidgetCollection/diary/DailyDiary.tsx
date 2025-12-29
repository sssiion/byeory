import { memo } from 'react';
import { WidgetWrapper } from '../../Shared';
import { useWidgetStorage } from '../SDK';

// 2. Daily Diary (오늘의 일기)
export const DailyDiaryConfig = {
    defaultSize: '2x2',
    validSizes: [[1, 2], [2, 1], [2, 2]] as [number, number][],
};

export const DailyDiary = memo(function DailyDiary({ gridSize }: { gridSize?: { w: number; h: number } }) {
    const [content, setContent] = useWidgetStorage('widget-daily-diary', '');

    const isSmall = (gridSize?.w || 2) < 2 && (gridSize?.h || 2) < 2;

    if (isSmall) {
        return (
            <WidgetWrapper className="bg-[#fff9e6] flex flex-col items-center justify-center p-1 border-4 border-[#e6dcc8] border-double">
                <div className="font-serif font-bold text-gray-800 text-sm">Dec 12</div>
                <div className="w-8 h-10 border border-gray-300 bg-white mt-1 shadow-sm flex items-center justify-center">
                    <span className="text-[8px] text-gray-400">log</span>
                </div>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-[#fff9e6]">
            <div className="w-full h-full p-4 flex flex-col relative">
                <div className="absolute top-0 left-0 w-full h-4 bg-[#e6dcc8] flex items-center justify-center gap-4 border-b border-[#d4c9b3]">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                </div>
                <div className="mt-4 flex-1">
                    <div className="flex justify-between items-end border-b border-gray-300 pb-1 mb-2">
                        <span className="text-xl font-serif font-bold text-gray-800">Dec 12</span>
                        <span className="text-xs text-gray-500 font-serif">Thursday</span>
                    </div>
                    <textarea
                        className="w-full h-[calc(100%-40px)] bg-transparent resize-none outline-none text-xs leading-5 text-gray-700 font-serif"
                        placeholder="Write your story..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ backgroundImage: 'linear-gradient(transparent 19px, #e5e5e5 20px)', backgroundSize: '100% 20px' }}
                    />
                </div>
            </div>
        </WidgetWrapper>
    );
});
