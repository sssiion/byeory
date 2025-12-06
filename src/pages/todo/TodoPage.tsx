import { useState } from 'react';
import Navigation from '../../components/Navigation';
import { DailyView } from '../../components/todo/DailyView';
import { WeeklyView } from '../../components/todo/WeeklyView';
import { MonthlyView } from '../../components/todo/MonthlyView';
import type { Todo } from '../../types';

type TabType = 'daily' | 'weekly' | 'monthly';

function TodoPage() {
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: '1',
      title: '프로젝트 미팅',
      startDate: '2025-12-06',
      endDate: '2025-12-06',
      startTime: '10:00',
      endTime: '11:00',
      allDay: false,
      completed: false,
    },
    {
      id: '2',
      title: '점심 약속',
      startDate: '2025-12-06',
      endDate: '2025-12-06',
      startTime: '12:00',
      endTime: '13:30',
      allDay: false,
      completed: false,
    },
    {
      id: '3',
      title: '휴가',
      startDate: '2025-12-09',
      endDate: '2025-12-11',
      allDay: true,
      completed: false,
    },
  ]);

  const addTodo = (todo: Omit<Todo, 'id'>) => {
    const newTodo: Todo = {
      ...todo,
      id: Date.now().toString(),
    };
    setTodos([...todos, newTodo]);
  };

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, ...updates } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleComplete = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div className="theme-bg-gradient min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 내비게이션 설정 */}
      <Navigation />

      {/* 메인 화면 */}
      <main className="px-8 pt-16 pb-20 md:px-25 md:pt-20 md:pb-0">
        <div className="mx-auto py-8 max-w-7xl">
          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Todo Page
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>일정을 관리해보세요.</p>
          </div>

          {/* Tabs */}
          <div
            className="rounded-lg shadow-sm border mb-6"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div
              className="flex border-b"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <button
                onClick={() => setActiveTab('daily')}
                style={{
                  color: activeTab === 'daily' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderColor: activeTab === 'daily' ? 'var(--text-primary)' : 'transparent',
                }}
                className={`flex-1 md:flex-none md:px-6 py-3 transition-colors ${activeTab === 'daily'
                  ? 'border-b-2 font-medium'
                  : 'hover:opacity-80'
                  }`}
              >
                일별
              </button>
              <button
                onClick={() => setActiveTab('weekly')}
                style={{
                  color: activeTab === 'weekly' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderColor: activeTab === 'weekly' ? 'var(--text-primary)' : 'transparent',
                }}
                className={`flex-1 md:flex-none md:px-6 py-3 transition-colors ${activeTab === 'weekly'
                  ? 'border-b-2 font-medium'
                  : 'hover:opacity-80'
                  }`}
              >
                주별
              </button>
              <button
                onClick={() => setActiveTab('monthly')}
                style={{
                  color: activeTab === 'monthly' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderColor: activeTab === 'monthly' ? 'var(--text-primary)' : 'transparent',
                }}
                className={`flex-1 md:flex-none md:px-6 py-3 transition-colors ${activeTab === 'monthly'
                  ? 'border-b-2 font-medium'
                  : 'hover:opacity-80'
                  }`}
              >
                월별
              </button>
            </div>

            <div className="p-4 md:p-6">
              {activeTab === 'daily' && (
                <DailyView
                  todos={todos}
                  onAddTodo={addTodo}
                  onUpdateTodo={updateTodo}
                  onDeleteTodo={deleteTodo}
                  onToggleComplete={toggleComplete}
                />
              )}
              {activeTab === 'weekly' && (
                <WeeklyView
                  todos={todos}
                  onAddTodo={addTodo}
                  onUpdateTodo={updateTodo}
                  onDeleteTodo={deleteTodo}
                  onToggleComplete={toggleComplete}
                />
              )}
              {activeTab === 'monthly' && (
                <MonthlyView
                  todos={todos}
                  onAddTodo={addTodo}
                  onUpdateTodo={updateTodo}
                  onDeleteTodo={deleteTodo}
                  onToggleComplete={toggleComplete}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TodoPage;
