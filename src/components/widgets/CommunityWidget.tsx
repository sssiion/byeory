import { Users, MessageCircle, Heart, Eye, TrendingUp } from 'lucide-react';
import type { WidgetSize } from '../../App';

interface CommunityWidgetProps {
  size: WidgetSize;
}

export function CommunityWidget({ size }: CommunityWidgetProps) {
  if (size === 'small') {
    return (
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm text-gray-900">커뮤니티</h3>
        </div>
        <div className="text-center py-2">
          <p className="text-2xl mb-1">💬</p>
          <p className="text-xs text-gray-600">새 글 5개</p>
        </div>
        <button className="w-full py-1.5 bg-purple-100 text-purple-700 text-xs rounded-lg hover:bg-purple-200 transition-colors">
          보러가기
        </button>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            <h3 className="text-gray-900">커뮤니티</h3>
          </div>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </div>

        <div className="flex-1 space-y-2 overflow-auto">
          <div className="bg-purple-50 rounded-lg p-3 cursor-pointer hover:bg-purple-100 transition-colors border border-purple-200">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-lg">😊</span>
              <div className="flex-1">
                <h4 className="text-sm text-gray-900 line-clamp-1">오늘 정말 행복한 일이 있었어요!</h4>
                <p className="text-xs text-gray-500 mt-1">5분 전 • 지수</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                12
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                5
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-lg">🎯</span>
              <div className="flex-1">
                <h4 className="text-sm text-gray-900 line-clamp-1">목표 달성 팁 공유합니다</h4>
                <p className="text-xs text-gray-500 mt-1">1시간 전 • 민수</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                8
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                3
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-lg">📚</span>
              <div className="flex-1">
                <h4 className="text-sm text-gray-900 line-clamp-1">일기 쓰는 습관 만들기</h4>
                <p className="text-xs text-gray-500 mt-1">3시간 전 • 현아</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                15
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                7
              </span>
            </div>
          </div>
        </div>

        <button className="mt-3 w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all text-sm">
          전체 글 보기
        </button>
      </div>
    );
  }

  // Large size - 최신글 하나를 자세히 볼 수 있음
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900">커뮤니티</h3>
            <p className="text-sm text-gray-500">다른 사용자들과 소통하세요</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
            인기글
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
            최신글
          </button>
        </div>
      </div>

      {/* Featured Post - 최신글 상세 */}
      <div className="flex-1 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-xl p-6 overflow-auto mb-4">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white">
              <span className="text-xl">👤</span>
            </div>
            <div>
              <h4 className="text-gray-900">지수</h4>
              <p className="text-xs text-gray-500">5분 전</p>
            </div>
          </div>
          <span className="text-3xl">😊</span>
        </div>

        {/* Post Title */}
        <h3 className="text-lg text-gray-900 mb-3">오늘 정말 행복한 일이 있었어요!</h3>

        {/* Post Content */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-4 mb-4">
          <p className="text-gray-700 leading-relaxed mb-4">
            오늘 드디어 제가 그토록 준비했던 프로젝트가 성공적으로 마무리되었어요! 
            몇 달 동안 밤낮으로 고생했는데, 팀원들과 함께 축하 파티도 하고 정말 뿌듯한 하루였습니다.
            <br/><br/>
            특히 팀장님께서 칭찬해주셨을 때 정말 감동이었어요. 
            힘든 순간도 많았지만 포기하지 않고 끝까지 해낸 제 자신이 자랑스럽네요!
            <br/><br/>
            여러분도 힘든 일이 있어도 포기하지 마세요. 끝까지 하면 분명 좋은 결과가 있을 거예요! 💪
          </p>

          {/* Post Images */}
          <div className="grid grid-cols-3 gap-2">
            <div className="aspect-square bg-gradient-to-br from-yellow-200 to-orange-200 rounded-lg" />
            <div className="aspect-square bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg" />
            <div className="aspect-square bg-gradient-to-br from-blue-200 to-cyan-200 rounded-lg" />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">#성공</span>
          <span className="px-3 py-1 bg-pink-100 text-pink-700 text-sm rounded-full">#행복</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">#팀워크</span>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center gap-4 py-3 border-t border-gray-200">
          <button className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors">
            <Heart className="w-5 h-5 fill-current" />
            <span className="text-sm">12</span>
          </button>
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">5</span>
          </button>
          <div className="flex items-center gap-2 text-gray-500 ml-auto">
            <Eye className="w-5 h-5" />
            <span className="text-sm">248</span>
          </div>
        </div>

        {/* Comments Preview */}
        <div className="mt-4 space-y-3">
          <p className="text-sm text-gray-600">댓글 5개</p>
          <div className="bg-white/60 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-sm">
                👤
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">민수</p>
                <p className="text-sm text-gray-700 mt-1">축하해요! 정말 대단하네요 👏</p>
                <p className="text-xs text-gray-400 mt-1">3분 전</p>
              </div>
            </div>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white text-sm">
                👤
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">현아</p>
                <p className="text-sm text-gray-700 mt-1">저도 힘이 나네요! 감사해요 ❤️</p>
                <p className="text-xs text-gray-400 mt-1">1분 전</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comment Input */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="댓글을 남겨보세요..."
            className="flex-1 px-4 py-2 bg-white/80 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all">
            등록
          </button>
        </div>
      </div>

      {/* Recent Posts List */}
      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-600">다른 인기글</p>
        <div className="flex gap-2 overflow-x-auto">
          <div className="min-w-[200px] bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition-all border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎯</span>
              <h4 className="text-sm text-gray-900 line-clamp-1">목표 달성 팁</h4>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Heart className="w-3 h-3" />
              <span>8</span>
              <MessageCircle className="w-3 h-3 ml-2" />
              <span>3</span>
            </div>
          </div>
          <div className="min-w-[200px] bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition-all border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📚</span>
              <h4 className="text-sm text-gray-900 line-clamp-1">일기 습관 만들기</h4>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Heart className="w-3 h-3" />
              <span>15</span>
              <MessageCircle className="w-3 h-3 ml-2" />
              <span>7</span>
            </div>
          </div>
          <div className="min-w-[200px] bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition-all border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">✈️</span>
              <h4 className="text-sm text-gray-900 line-clamp-1">여행 일기 공유</h4>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Heart className="w-3 h-3" />
              <span>22</span>
              <MessageCircle className="w-3 h-3 ml-2" />
              <span>12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all">
          전체 글 보기
        </button>
        <button className="px-4 py-3 border-2 border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
          글 쓰기
        </button>
      </div>
    </div>
  );
}
