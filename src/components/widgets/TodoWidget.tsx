import { CheckSquare, Square, Plus, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { WidgetSize } from '../../App';

interface TodoWidgetProps {
  size: WidgetSize;
}

export function TodoWidget({ size }: TodoWidgetProps) {
  const [todos] = useState([
    { id: 1, text: '아침 운동하기', completed: true },
    { id: 2, text: '일기 쓰기', completed: false },
    { id: 3, text: '책 읽기', completed: false },
  ]);

  if (size === 'small') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <CheckSquare className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm text-gray-900">오늘 할 일</h3>
        </div>
        <div className="space-y-2 flex-1">
          {todos.slice(0, 3).map(todo => (
            <div key={todo.id} className="flex items-center gap-2">
              {todo.completed ? (
                <CheckSquare className="w-4 h-4 text-purple-500 flex-shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-gray-300 flex-shrink-0" />
              )}
              <span className={`text-xs ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {todo.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-purple-500" />
            <h3 className="text-gray-900">오늘의 할 일</h3>
          </div>
          <span className="text-sm text-gray-500">3/5</span>
        </div>

        <div className="space-y-2 flex-1 overflow-auto">
          {todos.map(todo => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {todo.completed ? (
                <CheckSquare className="w-5 h-5 text-purple-500 flex-shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-gray-300 flex-shrink-0" />
              )}
              <span className={`text-sm flex-1 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {todo.text}
              </span>
            </div>
          ))}
        </div>

        <button className="mt-3 w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-purple-300 hover:text-purple-500 transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          <span>할 일 추가</span>
        </button>
      </div>
    );
  }

  // Large size
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900">Todo 리스트</h3>
            <p className="text-sm text-gray-500">오늘 할 일을 체크해보세요</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">완료율</p>
          <p className="text-xl text-purple-600">60%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full mb-4">
        <div className="h-full w-3/5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" />
      </div>

      {/* Todo List */}
      <div className="space-y-2 flex-1 overflow-auto">
        {todos.map(todo => (
          <div
            key={todo.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
          >
            {todo.completed ? (
              <CheckSquare className="w-6 h-6 text-purple-500 flex-shrink-0" />
            ) : (
              <Square className="w-6 h-6 text-gray-300 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {todo.text}
              </p>
              <p className="text-xs text-gray-400 mt-1">오늘 오후 3시</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>
        ))}
      </div>

      {/* Add Button */}
      <button className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" />
        <span>새로운 할 일 추가</span>
      </button>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-3">
        <button className="flex-1 px-3 py-2 bg-purple-50 text-purple-700 text-sm rounded-lg hover:bg-purple-100 transition-colors">
          루틴 관리
        </button>
        <button className="flex-1 px-3 py-2 bg-pink-50 text-pink-700 text-sm rounded-lg hover:bg-pink-100 transition-colors">
          내일로 미루기
        </button>
      </div>
    </div>
  );
}
