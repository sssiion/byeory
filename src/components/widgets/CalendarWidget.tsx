import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { WidgetSize } from '../../App';

interface CalendarWidgetProps {
  size: WidgetSize;
}

export function CalendarWidget({ size }: CalendarWidgetProps) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dates = Array.from({ length: 35 }, (_, i) => i + 1);

  if (size === 'small') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm text-gray-900">12월</h3>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-7 gap-0.5">
            {dates.slice(0, 14).map((date) => (
              <div
                key={date}
                className={`aspect-square flex items-center justify-center text-xs ${
                  date === 5 ? 'bg-purple-500 text-white rounded' : 'text-gray-600'
                }`}
              >
                {date}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            <h3 className="text-gray-900">2024년 12월</h3>
          </div>
          <div className="flex gap-1">
            <button className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {days.map(day => (
              <div key={day} className="text-center text-xs text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {dates.map((date) => {
              const hasEntry = [3, 5, 10, 15, 20].includes(date);
              const isToday = date === 5;
              
              return (
                <div
                  key={date}
                  className={`aspect-square flex flex-col items-center justify-center text-xs rounded-lg cursor-pointer transition-colors ${
                    isToday
                      ? 'bg-purple-500 text-white'
                      : hasEntry
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{date}</span>
                  {hasEntry && !isToday && (
                    <span className="text-xs">•</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Large size
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900">캘린더 뷰</h3>
            <p className="text-sm text-gray-500">일기를 달력으로 확인하세요</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg">
            2024년 12월
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-purple-50 rounded-lg p-2 text-center">
          <p className="text-lg text-purple-600">15</p>
          <p className="text-xs text-gray-600">작성한 일기</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <p className="text-lg text-blue-600">65%</p>
          <p className="text-xs text-gray-600">작성률</p>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <p className="text-lg text-green-600">7</p>
          <p className="text-xs text-gray-600">연속 작성</p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 overflow-auto">
        <div className="grid grid-cols-7 gap-2 mb-3">
          {days.map(day => (
            <div key={day} className="text-center text-sm text-gray-600">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {dates.map((date) => {
            const hasEntry = [3, 5, 7, 10, 12, 15, 18, 20, 22, 25, 28, 30].includes(date);
            const isToday = date === 5;
            const emotion = hasEntry ? ['😊', '😌', '😢', '😄', '🤔'][Math.floor(Math.random() * 5)] : null;
            
            return (
              <div
                key={date}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all ${
                  isToday
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                    : hasEntry
                    ? 'bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-md border-2 border-purple-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className={`text-sm ${isToday ? 'text-white' : hasEntry ? 'text-purple-700' : 'text-gray-600'}`}>
                  {date}
                </span>
                {hasEntry && emotion && (
                  <span className="text-lg mt-1">{emotion}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded"></div>
          <span>오늘</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-100 border-2 border-purple-200 rounded"></div>
          <span>작성함</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded"></div>
          <span>미작성</span>
        </div>
      </div>
    </div>
  );
}
