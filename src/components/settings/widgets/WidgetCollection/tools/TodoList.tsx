import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';
import { useSharedTodo } from '../../../../Todo/useSharedTodo';
import { TodoItem } from '../../../../Todo/CheckTodo';
import type { Todo } from '../../../../Todo/types';

export const TodoListConfig = {
    defaultSize: '2x2',
    validSizes: [[1, 1], [2, 1], [2, 2]] as [number, number][],
};

interface TodoListWidgetProps {
    gridSize?: { w: number; h: number };
}

// 6. Todo List Widget (할 일 목록)
export function TodoListWidget({ gridSize }: TodoListWidgetProps) {
    const navigate = useNavigate();
    const { getTodayTodos, addTodo, toggleTodo, updateTodo } = useSharedTodo();
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Get today's todos
    const todayTodos = getTodayTodos();
    const completedTodos = todayTodos.filter(t => t.completed);

    // calculate progress
    const total = todayTodos.length;
    const completed = completedTodos.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    const progressColor = progress === 100 ? 'bg-green-500' : 'bg-[var(--btn-bg)]';

    const handleNavigate = () => navigate('/todo');

    const handleAdd = () => {
        if (!newTodoTitle.trim()) return;
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        const newTodo: Omit<Todo, 'id'> = {
            title: newTodoTitle,
            completed: false,
            startDate: dateString,
            endDate: dateString,
            allDay: true
        };
        addTodo(newTodo);
        setNewTodoTitle('');
        setIsAdding(false);
    };

    const isSmall = (gridSize?.w || 2) < 2;
    // const isLarge = (gridSize?.h || 2) >= 3 || (gridSize?.w || 2) >= 4; 
    // Actually, let's stick to the user's rule: low density vs high density.
    // 1x1: Progress + Count
    // 2x1, 2x2: List
    // 4x2: List + Input (Full)

    // Small View
    if (isSmall) {
        return (
            <WidgetWrapper className="bg-white dark:bg-zinc-900 cursor-pointer" onClick={handleNavigate}>
                <div className="flex flex-col items-center justify-center h-full relative">
                    {/* Circular Progress (CSS only for simplicity) */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100 dark:text-zinc-800" />
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent"
                                className={`${progress === 100 ? 'text-green-500' : 'text-[var(--btn-bg)]'} transition-all duration-1000 ease-out`}
                                strokeDasharray={175.9}
                                strokeDashoffset={175.9 - (progress / 100) * 175.9}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-sm font-bold">{Math.round(progress)}%</span>
                        </div>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-2 font-medium">{completed}/{total} Tasks</span>
                </div>
            </WidgetWrapper>
        );
    }

    // Standard/Large View
    return (
        <WidgetWrapper
            title="TODAY'S TASKS"
            className="bg-white dark:bg-zinc-900"
            headerRight={
                <div className="text-[10px] text-gray-400 font-mono cursor-pointer hover:text-[var(--btn-bg)]" onClick={handleNavigate}>
                    VIEW ALL
                </div>
            }
        >
            <div className="flex flex-col h-full">
                {/* Progress Bar (Linear) */}
                <div className="px-3 pt-2 pb-1">
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${progressColor} transition-all duration-500 ease-out`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {todayTodos.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
                            <Check size={24} />
                            <span className="text-xs">No tasks for today!</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        {todayTodos.slice(0, (gridSize?.h || 2) < 2 ? 3 : 10).map(todo => (
                            <div key={todo.id} className="transform scale-90 origin-top-left w-[111%] -mb-2">
                                <TodoItem
                                    todo={todo}
                                    onToggleComplete={toggleTodo}
                                    onEdit={(t) => updateTodo(t.id, t)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add Input - Optimized for available space */}
                {(gridSize?.h || 2) >= 2 && (
                    <div className="p-2 border-t border-gray-100 dark:border-zinc-800">
                        {isAdding ? (
                            <div className="flex gap-2 items-center animate-in slide-in-from-bottom-2 duration-200">
                                <input
                                    autoFocus
                                    value={newTodoTitle}
                                    onChange={(e) => setNewTodoTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                    placeholder="New..."
                                    className="flex-1 text-xs bg-transparent outline-none min-w-0 dark:text-gray-200"
                                />
                                <button onClick={handleAdd} className="p-1 rounded bg-[var(--btn-bg)] text-white">
                                    <Plus size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-full flex items-center justify-center gap-2 py-1.5 rounded border border-dashed border-gray-200 dark:border-zinc-700 text-xs text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-[var(--btn-bg)] hover:border-[var(--btn-bg)] transition-all"
                            >
                                <Plus size={12} />
                                <span>Add Task</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}
