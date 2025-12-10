import { Shuffle, Calendar, Heart } from 'lucide-react';
import type { WidgetSize } from '../../App';

interface RandomDiaryWidgetProps {
  size: WidgetSize;
}

export function RandomDiaryWidget({ size }: RandomDiaryWidgetProps) {
  if (size === 'small') {
    return (
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Shuffle className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm text-gray-900">랜덤 일기</h3>
        </div>
        <div className="text-center py-3">
          <p className="text-2xl mb-1">🌟</p>
          <p className="text-xs text-gray-500">2023.03.15</p>
        </div>
        <button className="w-full py-1.5 bg-purple-100 text-purple-700 text-xs rounded-lg hover:bg-purple-200 transition-colors">
          랜덤 보기
        </button>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-purple-500" />
            <h3 className="text-gray-900">랜덤 일기</h3>
          </div>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <Heart className="w-4 h-4 text-pink-500" />
          </button>
        </div>

        <div className="flex-1 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-purple-700">2023년 3월 15일</span>
            </div>
            <p className="text-sm text-gray-700 line-clamp-3">
              오늘은 정말 행복한 하루였다. 친구들과 오랜만에 만나서 맛있는 음식도 먹고 이야기도 많이 나눴다...
            </p>
          </div>
          <div className="flex gap-1 mt-2">
            <span className="text-lg">😊</span>
            <span className="text-lg">🍔</span>
            <span className="text-lg">👥</span>
          </div>
        </div>

        <button className="mt-3 w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
          <Shuffle className="w-4 h-4" />
          <span className="text-sm">다른 일기 보기</span>
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
            <Shuffle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900">랜덤 일기</h3>
            <p className="text-sm text-gray-500">과거의 추억을 되돌아보세요</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-xl p-6 flex flex-col overflow-auto">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <span className="text-purple-700">2023년 3월 15일 수요일</span>
            </div>
            <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <Heart className="w-5 h-5 text-pink-500" />
            </button>
          </div>
          
          <h4 className="text-gray-900 mb-2">친구들과의 즐거운 시간</h4>
        </div>

        <div className="flex-1 overflow-auto mb-4">
          <p className="text-gray-700 leading-relaxed">
            오늘은 정말 행복한 하루였다. 친구들과 오랜만에 만나서 맛있는 음식도 먹고 이야기도 많이 나눴다. 
            특히 대학교 때 추억을 나누면서 웃고 떠들었던 시간이 정말 소중했다. 
            바쁜 일상 속에서 잊고 지냈던 것들을 다시 생각해볼 수 있는 계기가 되었다.
            앞으로도 이런 시간을 자주 가져야겠다고 다짐했다.
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">😊 행복</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">👥 친구</span>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">🍔 맛집</span>
        </div>

        {/* Photos */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="aspect-square bg-gray-200 rounded-lg" />
          <div className="aspect-square bg-gray-200 rounded-lg" />
          <div className="aspect-square bg-gray-200 rounded-lg" />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
          <Shuffle className="w-5 h-5" />
          <span>다른 일기 보기</span>
        </button>
        <button className="px-4 py-3 border-2 border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
          필터 설정
        </button>
      </div>
    </div>
  );
}
