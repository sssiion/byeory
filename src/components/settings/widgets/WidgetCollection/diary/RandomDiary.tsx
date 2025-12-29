import { useState } from 'react';
import { Shuffle, MoreHorizontal } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';

// 3. Random Diary (랜덤 일기)
export const RandomDiaryConfig = {
    defaultSize: '1x1',
    validSizes: [[1, 1], [2, 1]] as [number, number][],
};

export function RandomDiary() {
    const [isOpen, setIsOpen] = useState(false);
    const diary = { date: '2023. 10. 15', content: "가을 바람이 참 좋았던 날. 공원에서 자전거를 탔다." };

    return (
        <WidgetWrapper className="bg-gray-800 text-gray-200">
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                {!isOpen ? (
                    <>
                        <Shuffle className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="text-xs text-gray-400 mb-3">과거의 나를 만나보세요</p>
                        <button
                            onClick={() => setIsOpen(true)}
                            className="px-4 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-full hover:bg-gray-200 transition-colors"
                        >
                            랜덤 펼쳐보기
                        </button>
                    </>
                ) : (
                    <div className="w-full h-full bg-white text-gray-800 rounded-lg p-3 relative shadow-lg animate-in zoom-in duration-300 flex flex-col text-left">
                        <div className="flex justify-between items-center mb-2 border-b pb-1">
                            <span className="text-[10px] font-bold text-gray-500">{diary.date}</span>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={12} /></button>
                        </div>
                        <p className="text-xs leading-relaxed font-serif">{diary.content}</p>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}
