import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { Todo } from '../../types';

interface EditTodoModalProps {
  todo: Todo;
  onClose: () => void;
  onUpdate: (updates: Partial<Todo>) => void;
  onDelete: () => void;
}

export function EditTodoModal({ todo, onClose, onUpdate, onDelete }: EditTodoModalProps) {
  const [title, setTitle] = useState(todo.title);
  const [startDate, setStartDate] = useState(todo.startDate);
  const [endDate, setEndDate] = useState(todo.endDate);
  const [startTime, setStartTime] = useState(todo.startTime || '09:00');
  const [endTime, setEndTime] = useState(todo.endTime || '10:00');
  const [allDay, setAllDay] = useState(todo.allDay);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('할일 제목을 입력해주세요');
      return;
    }

    onUpdate({
      title: title.trim(),
      startDate,
      endDate: allDay ? startDate : endDate,
      startTime: allDay ? undefined : startTime,
      endTime: allDay ? undefined : endTime,
      allDay,
    });
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl">할일 수정</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm mb-2">할일</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="할일을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              autoFocus
            />
          </div>

          {/* All Day Switch */}
          <div className="flex items-center justify-between py-2">
            <label className="text-sm">하루종일</label>
            <button
              type="button"
              onClick={() => setAllDay(!allDay)}
              className={`relative w-12 h-6 rounded-full transition-colors ${allDay ? '' : 'bg-gray-300'}`}
              style={{ backgroundColor: allDay ? 'var(--accent-primary)' : undefined }}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${allDay ? 'translate-x-6' : ''
                  }`}
              />
            </button>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm mb-2">시작 날짜</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (!allDay && new Date(e.target.value) > new Date(endDate)) {
                  setEndDate(e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
          </div>

          {/* Start Time */}
          {!allDay && (
            <div>
              <label className="block text-sm mb-2">시작 시간</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>
          )}

          {/* End Date */}
          {!allDay && (
            <div>
              <label className="block text-sm mb-2">끝 날짜</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>
          )}

          {/* End Time */}
          {!allDay && (
            <div>
              <label className="block text-sm mb-2">끝 시간</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${showDeleteConfirm
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'border border-red-300 text-red-600 hover:bg-red-50'
                }`}
            >
              <Trash2 className="w-4 h-4" />
              {showDeleteConfirm ? '정말 삭제' : '삭제'}
            </button>

            <div className="flex-1" />

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              수정
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
