import { PenLine, Image, Video, Mic, Send } from 'lucide-react';
import type { WidgetSize } from '../../App';

interface QuickDiaryWidgetProps {
  size: WidgetSize;
}

export function QuickDiaryWidget({ size }: QuickDiaryWidgetProps) {
  if (size === 'small') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <PenLine className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm text-gray-900">빠른 일기</h3>
        </div>
        <textarea
          placeholder="오늘 하루..."
          className="flex-1 text-sm resize-none border-0 focus:outline-none focus:ring-0 p-0"
        />
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-purple-500" />
            <h3 className="text-gray-900">오늘의 일기</h3>
          </div>
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        
        <textarea
          placeholder="오늘 하루는 어땠나요?"
          className="flex-1 resize-none border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        
        <div className="flex items-center gap-2 mt-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="사진">
            <Image className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="동영상">
            <Video className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="음성">
            <Mic className="w-4 h-4 text-gray-600" />
          </button>
          <button className="ml-auto px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span className="text-sm">저장</span>
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
            <PenLine className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900">오늘의 일기</h3>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full hover:bg-purple-200 transition-colors">
          😊 기분
        </button>
        <button className="px-3 py-1 bg-pink-100 text-pink-700 text-sm rounded-full hover:bg-pink-200 transition-colors">
          👥 사람
        </button>
        <button className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full hover:bg-blue-200 transition-colors">
          📍 장소
        </button>
      </div>
      
      <textarea
        placeholder="오늘 하루는 어땠나요? 자유롭게 기록해보세요..."
        className="flex-1 resize-none border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      {/* Media Preview Area */}
      <div className="mt-3 p-3 border-2 border-dashed border-gray-200 rounded-lg">
        <p className="text-sm text-gray-400 text-center">사진, 동영상, 음성을 추가해보세요</p>
      </div>
      
      <div className="flex items-center gap-2 mt-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="사진">
          <Image className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="동영상">
          <Video className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="음성 녹음">
          <Mic className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1" />
        <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
          <Send className="w-4 h-4" />
          <span>일기 저장</span>
        </button>
      </div>
    </div>
  );
}
