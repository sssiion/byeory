import { useState } from 'react';
import { Calendar as CalendarIcon, Heart, Tv, Gift } from 'lucide-react';
import { WidgetWrapper } from '../Common';

interface FandomEvent {
    id: number;
    title: string;
    date: string; // YYYY-MM-DD
    type: 'birthday' | 'broadcast' | 'other';
}

interface FandomCalendarProps {
    gridSize?: { w: number; h: number };
}

export const FandomCalendarConfig = {
    defaultSize: '2x1',
    validSizes: [[1, 1], [2, 1], [2, 2]] as [number, number][],
};

export function FandomCalendar({ gridSize }: FandomCalendarProps) {
    const [events, setEvents] = useState<FandomEvent[]>(() => {
        const saved = localStorage.getItem('fandom_events');
        return saved ? JSON.parse(saved) : [{ id: 1, title: 'My Bias Birthday', date: new Date().toISOString().split('T')[0], type: 'birthday' }];
    });
    const [isAdding, setIsAdding] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'birthday' });

    const addEvent = () => {
        if (!newEvent.title || !newEvent.date) return;
        const updated = [...events, { ...newEvent, id: Date.now(), type: newEvent.type as any }].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setEvents(updated);
        localStorage.setItem('fandom_events', JSON.stringify(updated));
        setIsAdding(false);
        setNewEvent({ title: '', date: '', type: 'birthday' });
    };

    const getNearestEvent = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return events.find(e => new Date(e.date) >= today) || events[0];
    };

    const getDDay = (dateStr: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(dateStr);
        const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'D-Day';
        if (diff < 0) return `D+${Math.abs(diff)}`;
        return `D-${diff}`;
    };

    const w = gridSize?.w || 2;
    const isSmall = w === 1;

    const nearest = getNearestEvent();

    if (isSmall) {
        return (
            <WidgetWrapper className="bg-pink-50 dark:bg-pink-900/20 border-pink-200 flex flex-col items-center justify-center p-2 text-pink-600">
                <Heart size={20} fill="currentColor" className="text-pink-400 mb-1" />
                <div className="font-bold text-lg">{nearest ? getDDay(nearest.date) : '-'}</div>
                <div className="text-[9px] w-full text-center truncate px-1">{nearest?.title}</div>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-white dark:bg-zinc-900 border-none p-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-pink-500 flex items-center gap-1">
                    <CalendarIcon size={16} /> Fandom Cal
                </h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-[10px] bg-pink-100 text-pink-600 px-2 py-1 rounded-full hover:bg-pink-200"
                >
                    {isAdding ? 'CANCEL' : '+ ADD'}
                </button>
            </div>

            {isAdding && (
                <div className="mb-2 p-2 bg-pink-50/50 rounded border border-pink-100 text-xs space-y-1">
                    <input
                        className="w-full border rounded px-1 py-0.5"
                        placeholder="Event Title"
                        value={newEvent.title}
                        onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                    <div className="flex gap-1">
                        <input
                            type="date"
                            className="flex-1 border rounded px-1 py-0.5"
                            value={newEvent.date}
                            onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                        />
                        <select
                            className="border rounded px-1"
                            value={newEvent.type}
                            onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                        >
                            <option value="birthday">🎂</option>
                            <option value="broadcast">📺</option>
                            <option value="other">✨</option>
                        </select>
                        <button onClick={addEvent} className="bg-pink-500 text-white px-2 rounded">OK</button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {events.length === 0 ? (
                    <div className="text-center text-gray-400 text-xs mt-4">No events yet</div>
                ) : (
                    events.map((ev) => (
                        <div key={ev.id} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                            <div className={`p-1.5 rounded-full ${ev.type === 'birthday' ? 'bg-yellow-100 text-yellow-600' : ev.type === 'broadcast' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                {ev.type === 'birthday' ? <Gift size={12} /> : ev.type === 'broadcast' ? <Tv size={12} /> : <CalendarIcon size={12} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold truncate">{ev.title}</div>
                                <div className="text-[10px] text-gray-400">{ev.date}</div>
                            </div>
                            <div className="text-xs font-bold text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded">
                                {getDDay(ev.date)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </WidgetWrapper>
    );
}
