import { User, Sparkles, Star } from 'lucide-react';
import type { WidgetSize } from '../../App';

interface PersonaWidgetProps {
  size: WidgetSize;
}

export function PersonaWidget({ size }: PersonaWidgetProps) {
  if (size === 'small') {
    return (
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm text-gray-900">페르소나</h3>
        </div>
        <div className="text-center py-2">
          <p className="text-2xl mb-1">🎭</p>
          <p className="text-xs text-gray-600">긍정적인</p>
          <p className="text-xs text-gray-600">모험가</p>
        </div>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-5 h-5 text-purple-500" />
          <h3 className="text-gray-900">나의 페르소나</h3>
        </div>

        <div className="flex-1 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="text-5xl mb-3">🎭</div>
          <h4 className="text-gray-900 mb-2">긍정적인 모험가</h4>
          <p className="text-sm text-gray-600 text-center mb-3">
            새로운 경험을 즐기고 긍정적인 에너지를 전파하는 성향
          </p>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-white/80 text-purple-700 text-xs rounded-full">외향적</span>
            <span className="px-2 py-1 bg-white/80 text-blue-700 text-xs rounded-full">활동적</span>
          </div>
        </div>

        <button className="mt-3 w-full py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm">
          상세 보기
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
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900">나의 페르소나 카드</h3>
            <p className="text-sm text-gray-500">일기로 분석한 나의 성향</p>
          </div>
        </div>
        <Sparkles className="w-5 h-5 text-yellow-500" />
      </div>

      {/* Main Persona Card */}
      <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-2xl p-6 mb-4">
        <div className="text-center mb-4">
          <div className="text-6xl mb-3">🎭</div>
          <h4 className="text-xl text-gray-900 mb-2">긍정적인 모험가</h4>
          <p className="text-sm text-gray-600">
            새로운 경험을 즐기고 긍정적인 에너지를 전파하는 성향
          </p>
        </div>

        {/* Traits */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/80 rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">🌟</p>
            <p className="text-xs text-gray-600">외향적</p>
          </div>
          <div className="bg-white/80 rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">🎯</p>
            <p className="text-xs text-gray-600">목표지향적</p>
          </div>
          <div className="bg-white/80 rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">💪</p>
            <p className="text-xs text-gray-600">활동적</p>
          </div>
          <div className="bg-white/80 rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">🤝</p>
            <p className="text-xs text-gray-600">사교적</p>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>긍정 에너지</span>
              <span>85%</span>
            </div>
            <div className="h-2 bg-white/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full" style={{ width: '85%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>사회성</span>
              <span>75%</span>
            </div>
            <div className="h-2 bg-white/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>모험심</span>
              <span>90%</span>
            </div>
            <div className="h-2 bg-white/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" style={{ width: '90%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="flex-1 overflow-auto">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-gray-700">주요 특징</span>
        </div>
        <div className="space-y-2">
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <p className="text-sm text-gray-700">✨ 주로 긍정적인 감정으로 일기를 작성해요</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-sm text-gray-700">👥 사람들과의 만남을 자주 기록해요</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-green-100">
            <p className="text-sm text-gray-700">🎯 목표를 세우고 달성하는 것을 즐겨요</p>
          </div>
        </div>
      </div>

      <button className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all">
        성장 리포트 보기
      </button>
    </div>
  );
}
