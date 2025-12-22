import { useState } from 'react';
import { Check } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';

// 7. Todo List (할 일)
export function TodoListWidget() {
    const [todos, setTodos] = useState([
        { id: 1, text: '일기 쓰기', done: true },
        { id: 2, text: '물 마시기', done: false },
        { id: 3, text: '영양제 먹기', done: false },
    ]);

    const toggle = (id: number) => {
        setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    return (
        <WidgetWrapper title="TO-DO LIST" className="bg-white">
            <div className="flex-1 overflow-y-auto p-2">
                {todos.map(t => (
                    <div key={t.id} onClick={() => toggle(t.id)} className="flex items-center gap-2 mb-2 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${t.done ? 'bg-[var(--btn-bg)] border-[var(--btn-bg)]' : 'border-gray-300 group-hover:border-[var(--btn-bg)]'}`}>
                            {t.done && <Check size={10} className="text-white" />}
                        </div>
                        <span className={`text-xs transition-colors ${t.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{t.text}</span>
                    </div>
                ))}
                <div className="flex items-center gap-2 opacity-50 mt-2">
                    <div className="w-4 h-4 border border-dashed border-gray-300 rounded"></div>
                    <span className="text-xs text-gray-400">Add new...</span>
                </div>
            </div>
        </WidgetWrapper>
    );
}
