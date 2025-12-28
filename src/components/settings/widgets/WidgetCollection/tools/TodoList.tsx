import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';
import { useSharedTodo } from '../../../../Todo/useSharedTodo';
import { TodoItem } from '../../../../Todo/CheckTodo';
import type { Todo } from '../../../../Todo/types';

export function TodoListWidget() {
    const navigate = useNavigate();
    const { getTodayTodos, addTodo, toggleTodo, updateTodo } = useSharedTodo();
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Get today's todos
    const todayTodos = getTodayTodos();
    const completedTodos = todayTodos.filter(t => t.completed);

    const handleNavigate = () => {
        navigate('/todo');
    };

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

    // calculate progress
    const total = todayTodos.length;
    const completed = completedTodos.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;

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
                {/* Progress Bar */}
                <div className="px-3 pt-2 pb-1">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-mono">
                        <span>PROGRESS</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--btn-bg)] transition-all duration-500 ease-out"
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
                        {todayTodos.map(todo => (
                            // Scaling down the TodoItem to fit widget
                            <div key={todo.id} className="transform scale-90 origin-top-left w-[111%] -mb-2">
                                <TodoItem
                                    todo={todo}
                                    onToggleComplete={toggleTodo}
                                    onEdit={(t) => updateTodo(t.id, t)} // Using update directly as edit for now, or could open modal if needed. 
                                // Note: TodoItem's onEdit generally opens a modal. 
                                // For this widget, maybe we just navigate to TodoPage on click? 
                                // Or simply allow toggling.
                                // Let's keep it simple for now. 
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add Input */}
                <div className="p-2 border-t border-gray-100 dark:border-zinc-800">
                    {isAdding ? (
                        <div className="flex gap-2 items-center animate-in slide-in-from-bottom-2 duration-200">
                            <input
                                autoFocus
                                value={newTodoTitle}
                                onChange={(e) => setNewTodoTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                placeholder="New Task..."
                                className="flex-1 text-xs bg-transparent outline-none min-w-0 dark:text-gray-200"
                            />
                            <button onClick={handleAdd} className="p-1 rounded bg-[var(--btn-bg)] text-white">
                                <Plus size={14} />
                            </button>
                            <button onClick={() => setIsAdding(false)} className="text-xs text-gray-400 hover:text-gray-600">
                                Cancel
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
            </div>
        </WidgetWrapper>
    );
}
