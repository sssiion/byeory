import React from 'react';
import { WidgetWrapper } from '../../Shared';
import { Plus, Trash2 } from 'lucide-react';
import { useWidgetStorage } from '../SDK';

interface ComponentProps {
    className?: string;
    style?: React.CSSProperties;
}

interface TimelineEvent {
    id: number;
    date: string;
    title: string;
    description?: string;
}

export const Timeline = ({ className, style }: ComponentProps & { gridSize?: { w: number; h: number } }) => {
    const [events, setEvents] = useWidgetStorage<TimelineEvent[]>('widget-timeline-events', [
        { id: 1, date: '2025.12.27', title: '프로젝트 시작', description: '위젯 만들기' },
        { id: 2, date: '2026.01.01', title: '새해', description: '해돋이 보러가기' },
    ]);

    const addEvent = () => {
        const newEvent: TimelineEvent = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
            title: 'New Event',
        };
        setEvents([newEvent, ...events]);
    };

    const removeEvent = (id: number) => {
        setEvents(events.filter(e => e.id !== id));
    };

    return (
        <WidgetWrapper className={`bg-white ${className || ''}`} style={style}>
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-700">Timeline</span>
                <button onClick={addEvent} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                    <Plus size={16} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                    {events.map((event) => (
                        <div key={event.id} className="ml-6 relative">
                            {/* Dot on the line */}
                            <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-[#ffeb3b] border-2 border-white rounded-full shadow-sm"></div>

                            <div className="group relative">
                                <span className="text-xs text-gray-400 font-mono block mb-1">{event.date}</span>
                                <h4 className="text-sm font-bold text-gray-800">{event.title}</h4>
                                {event.description && (
                                    <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                                )}
                                <button
                                    onClick={() => removeEvent(event.id)}
                                    className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-300 hover:text-red-500"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </WidgetWrapper>
    );
};
