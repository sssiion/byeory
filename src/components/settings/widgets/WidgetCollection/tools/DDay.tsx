import React, { useState } from 'react';
import { Cloud } from 'lucide-react';
import { WidgetWrapper as SharedWidgetWrapper } from '../../Shared';
import { WidgetWrapper as CommonWidgetWrapper } from '../Common';

// 15. D-Day List (디데이 리스트)
export const DDayList = React.memo(function DDayList() {
    const events = [
        { title: '여름 휴가', dday: -45 },
        { title: '친구 생일', dday: -12 },
        { title: '프로젝트 마감', dday: -3 }
    ];

    return (
        <SharedWidgetWrapper title="D-DAY" className="bg-pink-50/50">
            <div className="p-2 flex flex-col gap-2">
                {events.map((e, i) => (
                    <div key={i} className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm border border-pink-100">
                        <span className="text-xs font-medium text-gray-700">{e.title}</span>
                        <span className="text-xs font-bold text-pink-500">D{e.dday}</span>
                    </div>
                ))}
                <button className="text-[10px] text-center text-gray-400 hover:text-pink-500 mt-1">+ Add Event</button>
            </div>
        </SharedWidgetWrapper>
    );
});

// --- 6. D-Day Balloon (풍선 디데이) ---
export function DDayBalloon({ onUpdate, targetDate, title = "D-Day" }: { onUpdate?: (data: any) => void, targetDate?: string, title?: string }) {
    const [isEditing, setIsEditing] = useState(false);
    const today = new Date();
    const target = targetDate ? new Date(targetDate) : new Date(new Date().setDate(today.getDate() + 7)); // Default +7 days

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Scale balloon based on days left (Closer = Bigger)
    // Max scale 1.2 (D-Day), Min scale 0.5 (100 days left)
    const scale = Math.max(0.5, Math.min(1.2, 1.2 - (diffDays / 100) * 0.7));
    const isPast = diffDays < 0;

    const handleSave = (newTitle: string, newDate: string) => {
        if (onUpdate) onUpdate({ title: newTitle, targetDate: newDate });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <CommonWidgetWrapper className="bg-sky-50">
                <div className="w-full flex flex-col gap-2 p-2">
                    <input
                        type="text"
                        defaultValue={title}
                        className="w-full text-xs p-1 border rounded"
                        placeholder="Event Name"
                        id="dday-title"
                    />
                    <input
                        type="date"
                        defaultValue={targetDate}
                        className="w-full text-xs p-1 border rounded"
                        id="dday-date"
                    />
                    <button
                        onClick={() => {
                            const t = (document.getElementById('dday-title') as HTMLInputElement).value;
                            const d = (document.getElementById('dday-date') as HTMLInputElement).value;
                            handleSave(t, d);
                        }}
                        className="bg-sky-500 text-white text-xs py-1 rounded"
                    >
                        Save
                    </button>
                </div>
            </CommonWidgetWrapper>
        );
    }

    return (
        <CommonWidgetWrapper className="bg-sky-100 relative overflow-hidden group">
            <button
                onClick={() => setIsEditing(true)}
                className="absolute top-2 right-2 text-sky-300 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <SettingsIcon size={12} />
            </button>

            <div className="flex flex-col items-center justify-center h-full relative z-0">
                <div
                    className="relative transition-transform duration-500 ease-out"
                    style={{ transform: `scale(${scale}) translateY(${isPast ? 20 : 0}px)` }}
                >
                    {/* Balloon SVG */}
                    <svg width="60" height="80" viewBox="0 0 60 80" className={`drop-shadow-lg ${isPast ? 'grayscale opacity-50' : 'text-red-500'}`}>
                        <path d="M30 0C13.4315 0 0 13.4315 0 30C0 46.5685 30 70 30 70C30 70 60 46.5685 60 30C60 13.4315 46.5685 0 30 0Z" fill="currentColor" />
                        <path d="M25 10C25 10 35 15 35 25" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.3" />
                        <line x1="30" y1="70" x2="30" y2="100" stroke="#999" strokeWidth="1" />
                    </svg>
                    <div className="absolute top-8 left-0 w-full text-center text-white font-bold text-xs">
                        {isPast ? 'End' : `D-${diffDays}`}
                    </div>
                </div>
                <div className="mt-4 text-center">
                    <p className="font-bold text-sky-800 text-sm">{title}</p>
                    <p className="text-[10px] text-sky-600">{targetDate || 'Set Date'}</p>
                </div>
            </div>

            {/* Clouds bg */}
            <Cloud className="absolute -bottom-2 -left-4 text-white w-16 h-16 opacity-50" />
            <Cloud className="absolute top-4 -right-4 text-white w-12 h-12 opacity-30" />
        </CommonWidgetWrapper>
    );
}

const SettingsIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);
