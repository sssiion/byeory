import { Clock, MessageCircle, Sparkles } from 'lucide-react';
import type { WidgetSize } from '../../App';

interface YearAgoWidgetProps {
  size: WidgetSize;
}

export function YearAgoWidget({ size }: YearAgoWidgetProps) {
  if (size === 'small') {
    return (
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm text-gray-900">1년 전</h3>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">1년 전 오늘</p>
          <p className="text-lg">📝</p>
        </div>
        <button className="w-full py-1.5 bg-blue-100 text-blue-700 text-xs rounded-lg hover:bg-blue-200 transition-colors">
          보기
        </button>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-purple-500" />
          <h3 className="text-gray-900">1년 전 오늘</h3>
        </div>

        <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
          <p className="text-sm text-blue-700 mb-2">2023년 12월 5일</p>
          <p className="text-sm text-gray-700 line-clamp-4 mb-3">
            새로운 프로젝트를 시작했다. 설레면서도 걱정이 앞섰지만, 최선을 다해보기로 다짐했다...
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MessageCircle className="w-3 h-3" />
            <span>현재의 나의 피드백 2개</span>
          </div>
        </div>

        <button className="mt-3 w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all text-sm">
          피드백 남기기
        </button>
      </div>
    );
  }

  // Large size
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900">1년 전 오늘</h3>
            <p className="text-sm text-gray-500">과거의 나에게 피드백을 남겨보세요</p>
          </div>
        </div>
      </div>

      {/* Original Diary */}
      <div className="flex-1 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl p-6 overflow-auto mb-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-700">2023년 12월 5일 화요일</span>
            <div className="flex gap-1">
              <span className="text-lg">😌</span>
              <span className="text-lg">💪</span>
            </div>
          </div>
          <h4 className="text-gray-900 mb-3">새로운 시작</h4>
        </div>

        <p className="text-gray-700 leading-relaxed mb-4">
          오늘 새로운 프로젝트를 시작했다. 설레면서도 걱정이 앞섰지만, 최선을 다해보기로 다짐했다.
          지금까지의 경험을 바탕으로 더 성장할 수 있는 기회가 될 것 같다.
          1년 후의 나는 이 프로젝트를 성공적으로 마무리하고 있을까?
        </p>

        <div className="border-t border-blue-200 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-purple-700">현재의 나의 피드백</span>
          </div>

          <div className="space-y-3">
            <div className="bg-white/80 rounded-lg p-3">
              <p className="text-sm text-gray-700 mb-1">
                1년이 지난 지금, 정말 프로젝트를 성공적으로 마무리했어! 그때의 걱정은 기우였어.
              </p>
              <span className="text-xs text-gray-400">2024.06.15</span>
            </div>
            <div className="bg-white/80 rounded-lg p-3">
              <p className="text-sm text-gray-700 mb-1">
                지금 다시 보니 그때가 정말 소중한 터닝포인트였던 것 같아. 잘 견뎌줘서 고마워!
              </p>
              <span className="text-xs text-gray-400">2024.09.20</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Feedback */}
      <div className="space-y-2">
        <textarea
          placeholder="1년 전의 나에게 피드백을 남겨보세요..."
          className="w-full h-20 resize-none border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4" />
          <span>피드백 남기기</span>
        </button>
      </div>
    </div>
  );
}
