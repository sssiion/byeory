import { TrendingUp, BarChart3, PieChart } from 'lucide-react';
import type { WidgetSize } from '../../App';

interface AnalyticsWidgetProps {
  size: WidgetSize;
}

export function AnalyticsWidget({ size }: AnalyticsWidgetProps) {
  if (size === 'small') {
    return (
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm text-gray-900">감정 분석</h3>
        </div>
        <div className="flex justify-center gap-1 py-2">
          <div className="text-center">
            <p className="text-xl">😊</p>
            <p className="text-xs text-gray-500">60%</p>
          </div>
        </div>
        <button className="w-full py-1.5 bg-purple-100 text-purple-700 text-xs rounded-lg hover:bg-purple-200 transition-colors">
          자세히
        </button>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <h3 className="text-gray-900">이번 달 감정</h3>
          </div>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </div>

        {/* Emotion Distribution */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">😊</span>
            <div className="flex-1">
              <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
            <span className="text-xs text-gray-600 w-10 text-right">60%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg">😌</span>
            <div className="flex-1">
              <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
            <span className="text-xs text-gray-600 w-10 text-right">25%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg">😢</span>
            <div className="flex-1">
              <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
            <span className="text-xs text-gray-600 w-10 text-right">15%</span>
          </div>
        </div>

        <button className="mt-3 w-full py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm">
          상세 분석 보기
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
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900">감정 & 주제 분석</h3>
            <p className="text-sm text-gray-500">최근 30일 데이터</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
            이번 달
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
            전체
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-3 text-center">
          <p className="text-2xl mb-1">😊</p>
          <p className="text-lg text-orange-600">60%</p>
          <p className="text-xs text-gray-600">행복</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 text-center">
          <p className="text-2xl mb-1">😌</p>
          <p className="text-lg text-blue-600">25%</p>
          <p className="text-xs text-gray-600">평온</p>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-3 text-center">
          <p className="text-2xl mb-1">😢</p>
          <p className="text-lg text-gray-600">15%</p>
          <p className="text-xs text-gray-600">우울</p>
        </div>
      </div>

      {/* Emotion Trend */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-purple-700">감정 트렌드</span>
        </div>
        <div className="h-24 flex items-end justify-between gap-1">
          {[40, 55, 45, 60, 65, 58, 70].map((height, i) => (
            <div key={i} className="flex-1 bg-gradient-to-t from-purple-400 to-pink-400 rounded-t" style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>월</span>
          <span>화</span>
          <span>수</span>
          <span>목</span>
          <span>금</span>
          <span>토</span>
          <span>일</span>
        </div>
      </div>

      {/* Top Keywords */}
      <div className="flex-1 overflow-auto">
        <div className="flex items-center gap-2 mb-2">
          <PieChart className="w-4 h-4 text-purple-500" />
          <span className="text-sm text-gray-700">자주 등장한 키워드</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">👥 친구 (15회)</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">💼 일 (12회)</span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">🍔 맛집 (10회)</span>
          <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">📚 공부 (8회)</span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">✈️ 여행 (6회)</span>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">🎬 영화 (5회)</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all text-sm">
          월간 리포트
        </button>
        <button className="flex-1 py-2 border-2 border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm">
          연말 스토리
        </button>
      </div>
    </div>
  );
}
