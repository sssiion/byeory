import React, { useState } from 'react';
import { Cloud, Plus } from 'lucide-react';
import { WidgetWrapper as CommonWidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';

// [DB Connection Needed]
// Schema: Event { id, title, targetDate, userId, isRecurring }

interface DDayItem {
    id: number;
    title: string;
    targetDate: string; // ISO Date String
}

// 15. D-Day List (디데이 리스트)
interface DDayListProps {
    gridSize?: { w: number; h: number };
}

export const DDayList = React.memo(function DDayList({ gridSize }: DDayListProps) {
    const [events] = useWidgetStorage<DDayItem[]>('widget-dday-list', [
        { id: 1, title: 'Summer Vacation', targetDate: '2024-07-20' },
        { id: 2, title: 'Project Due', targetDate: '2024-05-15' },
    ]);

    const calculateDDay = (target: string) => {
        const today = new Date();
        const d = new Date(target);
        const diff = d.getTime() - today.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    const getProgress = (target: string) => {
        // Assume 100 days total for visual context
        const days = calculateDDay(target);
        if (days < 0) return 100;
        const progress = Math.max(0, Math.min(100, 100 - days));
        return progress;
    };

    const isSmall = (gridSize?.w || 1) < 2;

    // Sort by nearest D-Day (excluding past if desired, but simplest is just sort by date)
    const sortedEvents = [...events].sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
    const nearestEvent = sortedEvents.find(e => calculateDDay(e.targetDate) >= 0) || sortedEvents[0]; // Nearest future or just first

    if (isSmall && nearestEvent) {
        const dday = calculateDDay(nearestEvent.targetDate);
        const isPast = dday < 0;
        return (
            <CommonWidgetWrapper className="bg-pink-50/50 dark:bg-pink-900/10">
                <div className="flex flex-col items-center justify-center h-full p-2 text-center">
                    <div className={`text-2xl font-bold ${isPast ? 'text-gray-400' : 'text-pink-500'}`}>
                        {dday === 0 ? 'D-Day' : isPast ? `D+${Math.abs(dday)}` : `D-${dday}`}
                    </div>
                    <div className="text-xs font-bold text-gray-700 dark:text-gray-200 mt-1 line-clamp-2 leading-tight">
                        {nearestEvent.title}
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-pink-950/30 rounded-full overflow-hidden mt-3">
                        <div
                            className={`h-full ${isPast ? 'bg-gray-300' : 'bg-pink-400'} transition-all duration-1000`}
                            style={{ width: `${getProgress(nearestEvent.targetDate)}%` }}
                        />
                    </div>
                </div>
            </CommonWidgetWrapper>
        );
    }

    return (
        <CommonWidgetWrapper title="D-DAY" className="bg-pink-50/50 dark:bg-pink-900/10"
            headerRight={<button className="text-[10px] text-pink-400 hover:text-pink-600"><Plus size={14} /></button>}
        >
            <div className="p-2 flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar">
                {sortedEvents.map((e) => {
                    const dday = calculateDDay(e.targetDate);
                    const isPast = dday < 0;
                    return (
                        <div key={e.id} className="flex flex-col bg-white dark:bg-pink-900/20 p-2.5 rounded-lg shadow-sm border border-pink-100 dark:border-pink-800">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{e.title}</span>
                                <span className={`text-xs font-bold ${isPast ? 'text-gray-400' : 'text-pink-500'}`}>
                                    {dday === 0 ? 'D-Day' : isPast ? `D+${Math.abs(dday)}` : `D-${dday}`}
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 dark:bg-pink-950/30 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${isPast ? 'bg-gray-300' : 'bg-pink-400'} transition-all duration-1000`}
                                    style={{ width: `${getProgress(e.targetDate)}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </CommonWidgetWrapper>
    );
});

interface DDayData {
    title: string;
    targetDate: string;
}

// --- 6. D-Day Balloon (풍선 디데이) ---
interface DDayBalloonProps {
    onUpdate?: (data: DDayData) => void;
    targetDate?: string;
    title?: string;
    gridSize?: { w: number; h: number };
}

export function DDayBalloon({ onUpdate, targetDate, title = "D-Day", gridSize: _ }: DDayBalloonProps) {
    const [isEditing, setIsEditing] = useState(false);
    const today = new Date();
    const target = targetDate ? new Date(targetDate) : new Date(new Date().setDate(today.getDate() + 7)); // Default +7 days

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isPast = diffDays < 0;

    // Scale balloon based on days left
    // 30 days = 0.8, 0 days = 1.1
    const scale = Math.max(0.6, Math.min(1.15, 1.15 - (diffDays / 60) * 0.4));

    const handleSave = (newTitle: string, newDate: string) => {
        if (onUpdate) onUpdate({ title: newTitle, targetDate: newDate });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <CommonWidgetWrapper className="bg-sky-50 dark:bg-sky-950">
                <div className="w-full flex flex-col gap-2 p-2 h-full justify-center">
                    <label className="text-[10px] text-sky-700 dark:text-sky-300 font-bold">Event Title</label>
                    <input
                        type="text"
                        defaultValue={title}
                        className="w-full text-xs p-1.5 border border-sky-200 rounded outline-none focus:border-sky-500 dark:bg-black/20 dark:border-sky-800 dark:text-white"
                        placeholder="Event Name"
                        id="dday-title"
                    />
                    <label className="text-[10px] text-sky-700 dark:text-sky-300 font-bold">Date</label>
                    <input
                        type="date"
                        defaultValue={targetDate}
                        className="w-full text-xs p-1.5 border border-sky-200 rounded outline-none focus:border-sky-500 dark:bg-black/20 dark:border-sky-800 dark:text-white"
                        id="dday-date"
                    />
                    <button
                        onClick={() => {
                            const t = (document.getElementById('dday-title') as HTMLInputElement).value;
                            const d = (document.getElementById('dday-date') as HTMLInputElement).value;
                            handleSave(t, d);
                        }}
                        className="bg-sky-500 text-white text-xs py-1.5 rounded hover:bg-sky-600 transition-colors font-bold shadow-sm"
                    >
                        Save Event
                    </button>
                </div>
            </CommonWidgetWrapper>
        );
    }

    return (
        <CommonWidgetWrapper className="bg-sky-100 dark:bg-sky-900/30 relative overflow-hidden group border-sky-200 dark:border-sky-800">
            <button
                onClick={() => setIsEditing(true)}
                className="absolute top-2 right-2 text-sky-400 hover:text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-1 bg-white/50 rounded-full"
            >
                <SettingsIcon size={12} />
            </button>

            <div className="flex flex-col items-center justify-center h-full relative z-0">
                <div
                    className="relative transition-transform duration-700 ease-in-out hover:-translate-y-2 cursor-pointer"
                    style={{ transform: `scale(${scale}) translateY(${isPast ? 20 : 0}px)` }}
                >
                    {/* Balloon SVG */}
                    <svg width="60" height="80" viewBox="0 0 60 80" className={`drop-shadow-xl ${isPast ? 'grayscale opacity-50' : 'text-red-500'}`}>
                        <path d="M30 0C13.4315 0 0 13.4315 0 30C0 46.5685 30 70 30 70C30 70 60 46.5685 60 30C60 13.4315 46.5685 0 30 0Z" fill="url(#balloonGradient)" />
                        <defs>
                            <radialGradient id="balloonGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 20) rotate(51.6) scale(45)">
                                <stop stopColor="#FF8BA7" />
                                <stop offset="1" stopColor="#FF4D6D" />
                            </radialGradient>
                        </defs>
                        <path d="M25 10C25 10 35 15 35 25" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
                        <line x1="30" y1="70" x2="30" y2="100" stroke="#999" strokeWidth="1" />
                    </svg>
                    <div className="absolute top-8 left-0 w-full text-center text-white font-black text-xs drop-shadow-md">
                        {isPast ? 'End' : `D-${diffDays}`}
                    </div>
                </div>
                <div className="mt-4 text-center z-10">
                    <p className="font-bold text-sky-800 dark:text-sky-200 text-sm drop-shadow-sm">{title}</p>
                    <p className="text-[10px] text-sky-600 dark:text-sky-400 font-mono">{targetDate || 'No Date'}</p>
                </div>
            </div>

            {/* Clouds bg */}
            <Cloud className="absolute -bottom-2 -left-4 text-white w-16 h-16 opacity-60 animate-pulse delay-700" />
            <Cloud className="absolute top-4 -right-4 text-white w-12 h-12 opacity-40 animate-pulse" />
        </CommonWidgetWrapper>
    );
}

const SettingsIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);
