import React from 'react';
import type { PostData } from '../types';

interface Props {
    posts: PostData[];
    onStartWriting: () => void;
    onPostClick: (post: PostData) => void;
}

const PostList: React.FC<Props> = ({ posts, onStartWriting, onPostClick }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">📔 나의 기록들</h1>
                <button onClick={onStartWriting} className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold shadow hover:bg-indigo-700 transition">
                    ✏️ 기록 남기기
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {posts.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-400">
                        아직 작성된 글이 없습니다. 첫 기록을 남겨보세요!
                    </div>
                ) : (
                    posts.map(p => (
                        <div key={p.id} onClick={() => onPostClick(p)} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md cursor-pointer transition transform hover:-translate-y-1">
                            <div className="text-4xl mb-4">📜</div>
                            <h3 className="font-bold text-lg truncate">{p.title}</h3>
                            <p className="text-gray-500 text-sm">{p.date}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PostList;