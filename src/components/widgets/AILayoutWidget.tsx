import { Sparkles, Image, FileText, Wand2 } from 'lucide-react';
import type { WidgetSize } from '../../App';

interface AILayoutWidgetProps {
  size: WidgetSize;
}

export function AILayoutWidget({ size }: AILayoutWidgetProps) {
  if (size === 'small') {
    return (
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm text-gray-900">AI</h3>
        </div>
        <div className="text-center py-2">
          <p className="text-2xl mb-1">🤖</p>
          <p className="text-xs text-gray-600">자동 생성</p>
        </div>
        <button className="w-full py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-lg hover:shadow-lg transition-all">
          생성
        </button>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="text-gray-900">AI 다이어리</h3>
        </div>

        <div className="flex-1 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 flex flex-col">
          <div className="text-center mb-3">
            <Wand2 className="w-12 h-12 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-gray-700">AI가 자동으로</p>
            <p className="text-sm text-gray-700">레이아웃을 생성해요</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Image className="w-3 h-3" />
              <span>사진 3장</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <FileText className="w-3 h-3" />
              <span>메모 작성됨</span>
            </div>
          </div>
        </div>

        <button className="mt-3 w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all text-sm">
          다이어리 생성
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
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900">AI 다이어리 자동 제작</h3>
            <p className="text-sm text-gray-500">AI가 스마트하게 구성해요</p>
          </div>
        </div>
      </div>

      {/* Templates */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 mb-2">템플릿 선택</p>
        <div className="grid grid-cols-2 gap-2">
          <button className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg text-left hover:shadow-md transition-all border-2 border-purple-300">
            <p className="text-sm text-purple-700 mb-1">📖 포토북</p>
            <p className="text-xs text-gray-600">사진 중심 레이아웃</p>
          </button>
          <button className="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-all">
            <p className="text-sm text-gray-700 mb-1">⏱️ 타임라인</p>
            <p className="text-xs text-gray-600">시간 순서대로</p>
          </button>
          <button className="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-all">
            <p className="text-sm text-gray-700 mb-1">🎨 콜라주</p>
            <p className="text-xs text-gray-600">자유로운 배치</p>
          </button>
          <button className="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-all">
            <p className="text-sm text-gray-700 mb-1">📝 불릿저널</p>
            <p className="text-xs text-gray-600">깔끔한 정리</p>
          </button>
        </div>
      </div>

      {/* Content Preview */}
      <div className="flex-1 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-xl p-4 overflow-auto">
        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-2">추가된 콘텐츠</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="aspect-square bg-gray-200 rounded-lg" />
            <div className="aspect-square bg-gray-200 rounded-lg" />
            <div className="aspect-square bg-gray-200 rounded-lg" />
          </div>
        </div>

        <div className="bg-white/80 rounded-lg p-3 mb-3">
          <p className="text-xs text-gray-500 mb-1">작성된 메모</p>
          <p className="text-sm text-gray-700">
            오늘은 친구들과 즐거운 시간을 보냈다...
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between bg-white/80 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-700">AI 글 확장</span>
            </div>
            <button className="text-xs text-purple-600 hover:underline">적용</button>
          </div>
          <div className="flex items-center justify-between bg-white/80 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-700">테마 추천</span>
            </div>
            <button className="text-xs text-purple-600 hover:underline">보기</button>
          </div>
        </div>
      </div>

      {/* AI Features */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-900">AI 추천 기능</p>
            <p className="text-xs text-blue-600 mt-1">
              • 글 자동 확장/요약 • 테마 색상 추천 • 스티커 제안
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
          <Wand2 className="w-5 h-5" />
          <span>AI 다이어리 생성</span>
        </button>
        <button className="px-4 py-3 border-2 border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
          미리보기
        </button>
      </div>
    </div>
  );
}
