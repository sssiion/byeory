import { useEffect } from 'react';
import { WidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';

// --- 9. Daily Stamp (참잘했어요)
export function DailyStamp({ gridSize }: { gridSize?: { w: number, h: number } }) {
    // stamps array of 'YYYY-MM-DD'
    const [stamps, setStamps] = useWidgetStorage<string[]>('widget-daily-stamps', []);

    // Simple calendar for current month
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const todayDate = today.getDate();
    const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(todayDate).padStart(2, '0')}`;
    const isTodayStamped = stamps.includes(todayStr);

    // Listens for Todo completion (read-only stamps)
    useEffect(() => {
        const handleCompletion = (e: CustomEvent) => {
            const dateStr = e.detail?.date;
            if (dateStr) {
                setStamps(prev => {
                    if (prev.includes(dateStr)) return prev; // Already stamped
                    return [...prev, dateStr];
                });
            }
        };

        window.addEventListener('todo-all-completed', handleCompletion as EventListener);
        return () => window.removeEventListener('todo-all-completed', handleCompletion as EventListener);
    }, [setStamps]);

    const isSmall = (gridSize?.w || 2) < 2 && (gridSize?.h || 2) < 2;

    if (isSmall) {
        return (
            <WidgetWrapper className="bg-white dark:bg-zinc-900 flex items-center justify-center p-0">
                <div className="flex flex-col items-center justify-center h-full w-full">
                    <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">Today</span>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold transition-all relative overflow-hidden
                        ${isTodayStamped ? 'bg-red-50 text-red-500 border-2 border-red-200' : 'bg-gray-50 text-gray-400 border-2 border-gray-100'}
                    `}>
                        <span className={isTodayStamped ? 'opacity-0' : 'opacity-100'}>{todayDate}</span>
                        {isTodayStamped && (
                            <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-300">
                                <span className="text-3xl">💮</span>
                            </div>
                        )}
                    </div>
                </div>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-white p-2">
            <div className="flex flex-col h-full w-full">
                <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-xs font-bold text-gray-500">{today.toLocaleString('default', { month: 'long' })}</span>
                    <span className="text-[10px] text-gray-400">Great Job!</span>
                </div>
                <div className="grid grid-cols-7 gap-x-2 gap-y-0 flex-1 h-full min-h-0">
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isStamped = stamps.includes(dateStr);
                        return (
                            <button
                                key={day}
                                disabled
                                className="w-full h-full flex items-center justify-center group cursor-default"
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[10px] font-medium transition-all relative overflow-hidden
                                    ${isStamped ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-gray-50 text-gray-400'}
                                `}>
                                    <span className={isStamped ? 'opacity-0' : 'opacity-100'}>{day}</span>
                                    {isStamped && (
                                        <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-200">
                                            💮
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </WidgetWrapper>
    );
}
