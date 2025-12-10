import { Image, Wand2, FolderOpen, Grid3x3 } from 'lucide-react';
import type { WidgetSize } from '../../App';

interface PhotoManageWidgetProps {
  size: WidgetSize;
}

export function PhotoManageWidget({ size }: PhotoManageWidgetProps) {
  if (size === 'small') {
    return (
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm text-gray-900">사진</h3>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div className="aspect-square bg-gray-200 rounded" />
          <div className="aspect-square bg-gray-200 rounded" />
        </div>
        <button className="w-full py-1.5 bg-purple-100 text-purple-700 text-xs rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center gap-1">
          <Wand2 className="w-3 h-3" />
          <span>자동 분류</span>
        </button>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-purple-500" />
            <h3 className="text-gray-900">사진 관리</h3>
          </div>
          <span className="text-xs text-gray-500">125장</span>
        </div>

        <div className="grid grid-cols-3 gap-2 flex-1">
          <div className="aspect-square bg-gray-200 rounded-lg" />
          <div className="aspect-square bg-gray-200 rounded-lg" />
          <div className="aspect-square bg-gray-200 rounded-lg" />
          <div className="aspect-square bg-gray-200 rounded-lg" />
          <div className="aspect-square bg-gray-200 rounded-lg" />
          <div className="aspect-square bg-gray-200 rounded-lg" />
        </div>

        <div className="flex gap-2 mt-3">
          <button className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center justify-center gap-1">
            <Wand2 className="w-4 h-4" />
            <span>AI 분류</span>
          </button>
          <button className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Grid3x3 className="w-4 h-4 text-gray-600" />
          </button>
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
            <Image className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900">사진 자동 분류</h3>
            <p className="text-sm text-gray-500">AI가 사진을 스마트하게 정리해요</p>
          </div>
        </div>
        <button className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
          125장
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        <button className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm whitespace-nowrap">
          전체
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm whitespace-nowrap hover:bg-gray-200">
          사람
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm whitespace-nowrap hover:bg-gray-200">
          풍경
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm whitespace-nowrap hover:bg-gray-200">
          음식
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm whitespace-nowrap hover:bg-gray-200">
          분류 불가
        </button>
      </div>

      {/* Photo Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg cursor-pointer hover:scale-105 transition-transform relative group"
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all" />
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <input type="checkbox" className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drag & Drop Info */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <FolderOpen className="w-4 h-4 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900">사진을 길게 눌러 크게 보기</p>
            <p className="text-xs text-blue-600 mt-1">드래그로 카테고리 이동 가능</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
          <Wand2 className="w-5 h-5" />
          <span>AI 자동 분류</span>
        </button>
        <button className="px-4 py-3 border-2 border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
          사진만 보기
        </button>
      </div>
    </div>
  );
}
