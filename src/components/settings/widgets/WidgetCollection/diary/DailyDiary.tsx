import { memo } from 'react';
import { WidgetWrapper } from '../../Shared';
import { useWidgetStorage } from '../SDK';

// 2. Daily Diary (오늘의 일기)
export const DailyDiary = memo(function DailyDiary() {
    const [content, setContent] = useWidgetStorage('widget-daily-diary', '');

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
