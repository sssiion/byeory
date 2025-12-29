import { WidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';

// --- 9. Daily Stamp (참잘했어요)
export const DailyStampConfig = {
    defaultSize: '1x1',
    validSizes: [[1, 1], [1, 2], [2, 1], [2, 2]] as [number, number][],
};

export function DailyStamp() {
    // stamps array of 'YYYY-MM-DD'
    const [stamps, setStamps] = useWidgetStorage<string[]>('widget-daily-stamps', []);

    // Simple calendar for current month
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const toggleStamp = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setStamps(prev => {
            if (prev.includes(dateStr)) return prev.filter(d => d !== dateStr);
            return [...prev, dateStr];
        });
    };

    return (
        <WidgetWrapper className="bg-white p-2">
            <div className="flex flex-col h-full w-full">
                <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-xs font-bold text-gray-500">{today.toLocaleString('default', { month: 'long' })}</span>
                    <span className="text-[10px] text-gray-400">Great Job!</span>
                </div>
                <div className="grid grid-cols-7 gap-1 flex-1 content-start overflow-y-auto">
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isStamped = stamps.includes(dateStr);
                        return (
                            <button
                                key={day}
                                onClick={() => toggleStamp(day)}
                                className={`aspect-square rounded flex items-center justify-center text-[10px] font-medium transition-all relative overflow-hidden group
                                    ${isStamped ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}
                                `}
                            >
                                <span className={isStamped ? 'opacity-0' : 'opacity-100'}>{day}</span>
                                {isStamped && (
                                    <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-200">
                                        💮
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </WidgetWrapper>
    );
}
