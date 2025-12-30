import React from 'react';
import type { PostData } from '../types';
import { ArrowLeft, Folder } from 'lucide-react';

interface Props {
    tagName: string | null;
    posts: PostData[];
    onBack: () => void;
    onPostClick: (post: PostData) => void;
    onStartWriting: () => void;
}

const PostFolderPage: React.FC<Props> = ({ tagName, posts, onBack, onPostClick }) => {
    return (
        <div>
            {/* 상단 네비게이션 */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Folder size={20} className="fill-indigo-100" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {tagName || '기타 보관함'}
                            <span className="text-gray-400 text-lg font-medium">({posts.length})</span>
                        </h1>
                    </div>
                </div>
            </div>

            {/* 글 목록 (재사용) */}
            {/* PostListPage 컴포넌트가 제목(나의 기록들)을 포함하고 있어서 조금 어색할 수 있지만, 
                PostListPage를 수정하여 제목을 prop으로 받게 하거나, 
                여기서는 내용 부분만 렌더링하도록 하는 게 좋음.
                
                일단은 PostListPage를 그냥 사용하되, PostListPage 내부의 제목 '나의 기록들'이 중복되어 보일 수 있음.
                -> PostListPage를 'PostListView' 컴포넌트로 분리하는 게 정석이지만, 
                   지금은 코드를 복사해서 커스텀하게 렌더링하겠습니다.
            */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {posts.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-400">
                        이 앨범에는 아직 글이 없습니다.
                    </div>
                ) : (
                    posts.map(p => (
                        <div key={p.id} onClick={() => onPostClick(p)} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md cursor-pointer transition transform hover:-translate-y-1">
                            <div className="text-4xl mb-4">📜</div>
                            <h3 className="font-bold text-lg truncate">{p.title}</h3>
                            <p className="text-gray-500 text-sm">{p.date}</p>
                            {/* 태그 표시 */}
                            {p.tags && p.tags.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1">
                                    {p.tags.map(t => (
                                        <span key={t} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">#{t}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PostFolderPage;
