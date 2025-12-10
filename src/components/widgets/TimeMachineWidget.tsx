import { Send, Lock, Unlock, Calendar } from 'lucide-react';
import type { WidgetSize } from '../../App';

interface TimeMachineWidgetProps {
  size: WidgetSize;
}

export function TimeMachineWidget({ size }: TimeMachineWidgetProps) {
  if (size === 'small') {
    return (
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm text-gray-900">타임머신</h3>
        </div>
        <div className="text-center py-2">
          <p className="text-2xl mb-1">⏰</p>
          <p className="text-xs text-gray-500">잠긴 캡슐 3개</p>
        </div>
        <button className="w-full py-1.5 bg-purple-100 text-purple-700 text-xs rounded-lg hover:bg-purple-200 transition-colors">
          편지 쓰기
        </button>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-purple-500" />
            <h3 className="text-gray-900">타임머신</h3>
          </div>
          <span className="text-xs text-gray-500">5개</span>
        </div>

        <div className="flex-1 space-y-2 overflow-auto">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-orange-700">2025.06.15 개봉</span>
              <Lock className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-xs text-gray-600">미래의 나에게...</p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-700">2024.12.01 개봉됨</span>
              <Unlock className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-xs text-gray-600">1년 전의 다짐</p>
          </div>
        </div>

        <button className="mt-3 w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2">
          <Send className="w-4 h-4" />
          <span>새 편지 쓰기</span>
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
            <Send className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900">타임머신</h3>
            <p className="text-sm text-gray-500">미래의 나에게 편지를 보내요</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <Lock className="w-6 h-6 text-orange-500 mx-auto mb-1" />
          <p className="text-2xl text-orange-600">3</p>
          <p className="text-xs text-orange-700">잠긴 캡슐</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <Unlock className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <p className="text-2xl text-green-600">2</p>
          <p className="text-xs text-green-700">열린 캡슐</p>
        </div>
      </div>

      {/* Capsule List */}
      <div className="flex-1 space-y-3 overflow-auto">
        <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-700">2025년 6월 15일 개봉</span>
            </div>
            <Lock className="w-5 h-5 text-orange-500" />
          </div>
          <h4 className="text-gray-900 mb-2">6개월 후의 나에게</h4>
          <p className="text-sm text-gray-600 mb-3">
            지금의 목표와 다짐을 전하고 싶어...
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>D-193</span>
            <span>2024.12.05 작성</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-700">2026년 1월 1일 개봉</span>
            </div>
            <Lock className="w-5 h-5 text-purple-500" />
          </div>
          <h4 className="text-gray-900 mb-2">1년 후의 나에게</h4>
          <p className="text-sm text-gray-600 mb-3">
            내년 새해에는 어떤 모습일까?
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>D-392</span>
            <span>2024.12.05 작성</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">2024년 12월 1일 개봉됨</span>
            </div>
            <Unlock className="w-5 h-5 text-green-500" />
          </div>
          <h4 className="text-gray-900 mb-2">1년 전의 다짐</h4>
          <p className="text-sm text-gray-600 mb-3">
            잘 해냈어! 정말 자랑스러워 ✨
          </p>
          <div className="bg-white/80 rounded-lg p-2 mt-2">
            <p className="text-xs text-purple-700">💭 AI 코멘트</p>
            <p className="text-xs text-gray-600 mt-1">
              당시 목표였던 &apos;꾸준한 일기 작성&apos;을 달성했어요!
            </p>
          </div>
        </div>
      </div>

      <button className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
        <Send className="w-5 h-5" />
        <span>미래의 나에게 편지 쓰기</span>
      </button>
    </div>
  );
}
