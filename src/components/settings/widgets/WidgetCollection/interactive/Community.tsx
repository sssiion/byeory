
import { WidgetWrapper } from '../../Shared';

// 13. Community Widget (커뮤니티)
export function CommunityWidget() {
    const posts = [
        { title: "오늘 다꾸 팁 공유해요! 🎀", likes: 12 },
        { title: "위젯 배치 좀 봐주세요 ㅎㅎ", likes: 8 },
        { title: "저녁 메뉴 추천 받아요", likes: 5 }
    ];

    return (
        <WidgetWrapper title="커뮤니티 인기글" className="bg-white">
            <div className="flex-1 p-0">
                {posts.map((post, i) => (
                    <div key={i} className="px-3 py-2 border-b border-gray-50 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors">
                        <span className="text-xs text-gray-700 truncate flex-1">{post.title}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5 ml-2">❤️ {post.likes}</span>
                    </div>
                ))}
                <div className="p-2 text-center text-[10px] text-gray-400 hover:text-[var(--btn-bg)] cursor-pointer">
                    더보기 &gt;
                </div>
            </div>
        </WidgetWrapper>
    );
}
