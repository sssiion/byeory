import { Send } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';

// 6. Exchange Diary (교환 일기)
export function ExchangeDiary() {
    return (
        <WidgetWrapper className="bg-pink-50" title="너와 나의 교환일기">
            <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto scrollbar-hide">
                <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-200 overflow-hidden shrink-0"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="" /></div>
                    <div className="bg-white p-2 rounded-r-lg rounded-bl-lg shadow-sm text-xs text-gray-700 border border-gray-100">
                        오늘 떡볶이 먹었어? 😋
                    </div>
                </div>
                <div className="flex items-start gap-2 flex-row-reverse">
                    <div className="w-6 h-6 rounded-full bg-pink-200 overflow-hidden shrink-0"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" alt="" /></div>
                    <div className="bg-pink-100 p-2 rounded-l-lg rounded-br-lg shadow-sm text-xs text-gray-700">
                        응! 완전 매웠어 🔥
                    </div>
                </div>
                <div className="mt-auto pt-2 flex gap-1">
                    <input className="flex-1 bg-white rounded-full px-3 py-1 text-xs border border-pink-200 outline-none" placeholder="답장하기..." />
                    <button className="w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center text-white"><Send size={10} /></button>
                </div>
            </div>
        </WidgetWrapper>
    );
}
