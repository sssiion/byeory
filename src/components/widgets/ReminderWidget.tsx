import { Bell, Clock, Plus } from 'lucide-react';
import type { WidgetSize } from '../../App';

interface ReminderWidgetProps {
  size: WidgetSize;
}

export function ReminderWidget({ size }: ReminderWidgetProps) {
  if (size === 'small') {
    return (
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm text-gray-900">알림</h3>
        </div>
        <div className="text-center py-2">
          <p className="text-lg mb-1">🔔</p>
          <p className="text-xs text-gray-600">매일 오후 9시</p>
          <p className="text-xs text-gray-500">일기 쓰기</p>
        </div>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-500" />
            <h3 className="text-gray-900">알림 설정</h3>
          </div>
          <button className="text-purple-600 text-sm">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-auto">
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-900">일기 작성</span>
              <input type="checkbox" checked className="w-4 h-4" readOnly />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="w-3 h-3" />
              <span>매일 오후 9:00</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-900">교환일기 차례</span>
              <input type="checkbox" checked className="w-4 h-4" readOnly />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="w-3 h-3" />
              <span>월요일 오전 10:00</span>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-900">타임머신 개봉</span>
              <input type="checkbox" checked className="w-4 h-4" readOnly />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="w-3 h-3" />
              <span>개봉일 오전 9:00</span>
            </div>
          </div>
        </div>

        <button className="mt-3 w-full py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm">
          알림 추가
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
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900">리마인더</h3>
            <p className="text-sm text-gray-500">일기 작성 습관을 만들어요</p>
          </div>
        </div>
      </div>

      {/* Active Reminders */}
      <div className="flex-1 space-y-3 overflow-auto">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="text-gray-900 mb-1">일기 작성 알림</h4>
              <p className="text-sm text-gray-600">하루를 마무리하며 일기를 작성하세요</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked className="sr-only peer" readOnly />
              <div className="w-11 h-6 bg-purple-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-purple-600" />
            <span className="text-purple-700">매일 오후 9:00</span>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">월</button>
            <button className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">화</button>
            <button className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">수</button>
            <button className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">목</button>
            <button className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">금</button>
            <button className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">토</button>
            <button className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">일</button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="text-gray-900 mb-1">교환일기 작성 알림</h4>
              <p className="text-sm text-gray-600">이번 주 차례를 잊지 마세요</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked className="sr-only peer" readOnly />
              <div className="w-11 h-6 bg-blue-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700">매주 월요일 오전 10:00</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border-2 border-orange-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="text-gray-900 mb-1">타임머신 개봉 알림</h4>
              <p className="text-sm text-gray-600">미래에서 온 편지를 확인하세요</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked className="sr-only peer" readOnly />
              <div className="w-11 h-6 bg-orange-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="text-orange-700">개봉일 오전 9:00</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="text-gray-900 mb-1">질문 카드 알림</h4>
              <p className="text-sm text-gray-600">오늘의 질문에 답해보세요</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked className="sr-only peer" readOnly />
              <div className="w-11 h-6 bg-green-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-green-700">매일 오전 8:00</span>
          </div>
        </div>
      </div>

      {/* Add Reminder Button */}
      <button className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" />
        <span>새 알림 추가</span>
      </button>
    </div>
  );
}
