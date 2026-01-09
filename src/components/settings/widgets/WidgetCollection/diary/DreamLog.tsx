import { useState } from 'react';
import { X } from 'lucide-react';
import { WidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';

interface DreamLogEntry {
    date: string;
    content: string;
}

interface DreamLogData {
    logs: DreamLogEntry[];
}

// --- 3. Dream Log (꿈 기록장) ---
interface DreamLogProps {
    onUpdate?: (data: DreamLogData) => void;
    logs?: DreamLogEntry[];
}

export function DreamLog({ onUpdate, logs: propLogs = [], gridSize }: DreamLogProps & { gridSize?: { w: number; h: number } }) {
    const [mode, setMode] = useState<'list' | 'write'>('list');
    const [input, setInput] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Internal state priority, fallback to props only on init if needed (standard pattern)
    // Actually, stick to storage as primary source for widget.
    const [logs, setLogs] = useWidgetStorage<DreamLogEntry[]>('widget-dream-log', propLogs);

    const addLog = () => {
        if (!input) return;
        const newLogs = [{ date, content: input }, ...logs];
        setLogs(newLogs);
        if (onUpdate) onUpdate({ logs: newLogs });
        setInput('');
        setMode('list');
    };

    const deleteLog = (index: number) => {
        const newLogs = logs.filter((_, i) => i !== index);
        setLogs(newLogs);
        if (onUpdate) onUpdate({ logs: newLogs });
    };



    const isSmall = (gridSize?.w || 2) < 2 && (gridSize?.h || 2) < 2;

    if (isSmall) {
        return (
            <WidgetWrapper className="bg-[#1a1b26] border-[#24283b] flex flex-col items-center justify-center p-1">
                <div className="relative mb-1">
                    <div className="text-xl">🌙</div>
                    <div className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
                <span className="text-[8px] text-purple-300 font-bold">DREAM</span>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-[#1a1b26] border-[#24283b]">
            <div className="w-full h-full flex flex-col text-gray-300">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-700">
                    <span className="text-xs font-bold text-purple-400">DREAM LOG 🌙</span>
                    <button
                        onClick={() => setMode(mode === 'list' ? 'write' : 'list')}
                        className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded hover:bg-purple-500/30 transition-colors"
                    >
                        {mode === 'list' ? '+ New' : 'List'}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
                    {mode === 'list' ? (
                        <div className="space-y-2">
                            {logs.length === 0 && <p className="text-[10px] text-gray-600 text-center py-4">No dreams recorded yet.</p>}
                            {logs.map((log, i) => (
                                <div key={i} className="bg-[#24283b] p-2 rounded border border-gray-700 group relative">
                                    <p className="text-[10px] text-purple-400 mb-1">{log.date}</p>
                                    <p className="text-xs line-clamp-2">{log.content}</p>
                                    <button
                                        onClick={() => deleteLog(i)}
                                        className="absolute top-1 right-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 h-full">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-[#24283b] border border-gray-700 rounded p-1 text-xs text-gray-300 outline-none focus:border-purple-500"
                            />
                            <textarea
                                className="flex-1 bg-[#24283b] border border-gray-700 rounded p-2 text-xs text-gray-300 resize-none outline-none focus:border-purple-500"
                                placeholder="What did you dream?"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button onClick={addLog} className="bg-purple-600 text-white py-1 rounded text-xs hover:bg-purple-700">
                                Save Dream
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </WidgetWrapper>
    );
}
