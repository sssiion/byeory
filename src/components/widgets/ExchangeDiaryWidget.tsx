import { Users, Lock, MessageCircle, UserCircle } from 'lucide-react';
import type { WidgetSize } from '../../App';

interface ExchangeDiaryWidgetProps {
  size: WidgetSize;
}

export function ExchangeDiaryWidget({ size }: ExchangeDiaryWidgetProps) {
  if (size === 'small') {
    return (
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm text-gray-900">교환일기</h3>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">이번 주 차례</p>
          <p className="text-lg">👤</p>
          <p className="text-xs text-gray-700">지수</p>
        </div>
        <div className="w-full h-1 bg-gray-100 rounded-full">
          <div className="h-full w-2/3 bg-purple-500 rounded-full" />
        </div>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            <h3 className="text-gray-900">우리들의 교환일기</h3>
          </div>
          <span className="text-xs text-purple-600">3주차</span>
        </div>

        <div className="flex-1 space-y-2">
          {/* Current Writer */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <UserCircle className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-purple-700">이번 주: 지수님 차례</span>
            </div>
            <p className="text-xs text-gray-600">📝 작성 중...</p>
          </div>

          {/* Other Members */}
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-500">민수</p>
              <Lock className="w-3 h-3 text-gray-300 mx-auto mt-1" />
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-500">현아</p>
              <Lock className="w-3 h-3 text-gray-300 mx-auto mt-1" />
            </div>
          </div>
        </div>

        <button className="mt-3 w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all text-sm">
          교환일기 열기
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
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900">우리들의 교환일기</h3>
            <p className="text-sm text-gray-500">3주차 • 다음 순서까지 4일</p>
          </div>
        </div>
        <button className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
          초대하기
        </button>
      </div>

      {/* Members */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-3 text-center border-2 border-purple-300">
          <UserCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-sm text-gray-900">지수</p>
          <p className="text-xs text-purple-600 mt-1">✍️ 작성 중</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <UserCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-700">민수</p>
          <p className="text-xs text-gray-400 mt-1">대기 중</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <UserCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-700">현아</p>
          <p className="text-xs text-gray-400 mt-1">대기 중</p>
        </div>
      </div>

      {/* Current Entry Preview */}
      <div className="flex-1 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-purple-700">3주차 - 지수님의 일기</span>
          <Lock className="w-4 h-4 text-purple-400" />
        </div>
        
        <div className="bg-white/80 backdrop-blur rounded-lg p-4">
          <div className="text-center space-y-3">
            <p className="text-2xl">😊</p>
            <p className="text-sm text-gray-600">이번 주 감정</p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span>📝 글자 수: 245자</span>
              <span>📸 사진: 3장</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-3">
          지수님이 작성을 완료하면 볼 수 있어요
        </p>
      </div>

      {/* Recent Comments */}
      <div className="mt-4 bg-white rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">최근 댓글</span>
        </div>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="text-purple-600">민수:</span>
            <span className="text-gray-600 ml-1">정말 재미있었어!</span>
          </div>
          <div className="text-sm">
            <span className="text-pink-600">현아:</span>
            <span className="text-gray-600 ml-1">다음주가 기대돼 ❤️</span>
          </div>
        </div>
      </div>

      {/* 5주차 질문 카드 알림 */}
      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
        <span className="text-lg">💡</span>
        <div className="flex-1">
          <p className="text-sm text-yellow-800">5주차 질문 카드 예정</p>
          <p className="text-xs text-yellow-600 mt-1">2주 후 특별 질문이 나와요!</p>
        </div>
      </div>

      <button className="mt-3 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all">
        교환일기 열기
      </button>
    </div>
  );
}
