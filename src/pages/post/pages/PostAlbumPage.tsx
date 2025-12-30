import React, { useMemo } from 'react';
import type { PostData } from '../types';
import { Folder, Hash, MoreHorizontal, Plus, PenLine } from 'lucide-react';

interface Props {
    posts: PostData[];
    customAlbums: string[];
    onAlbumClick: (tagName: string | null) => void;
    onCreateAlbum: () => void;
    onStartWriting: () => void;
}

const PostAlbumPage: React.FC<Props> = ({ posts, customAlbums, onAlbumClick, onCreateAlbum, onStartWriting }) => {
    // 태그별로 포스트 그룹화 (커스텀 앨범 포함)
    const albums = useMemo(() => {
        // 1. 커스텀 앨범 먼저 초기화 (카운트 0)
        const groups: Record<string, number> = {};
        customAlbums.forEach(album => {
            groups[album] = 0;
        });

        let othersCount = 0;

        // 2. 게시글 순회하며 카운트 증가
        posts.forEach(post => {
            if (post.tags && post.tags.length > 0) {
                post.tags.forEach(tag => {
                    groups[tag] = (groups[tag] || 0) + 1;
                });
            } else {
                othersCount++;
            }
        });

        return { groups, othersCount };
    }, [posts, customAlbums]);

    return (
        <div>
            {/* 상단 헤더: 타이틀 + 액션 버튼 */}
            <div className="flex justify-between items-end mb-8 border-b border-[var(--border-color)] pb-4">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                        <Folder className="text-yellow-400 fill-yellow-400" size={32} />
                        내 앨범
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm mt-2 ml-1">태그로 자동 분류된 나의 기록들입니다.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCreateAlbum}
                        className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)] transition-all font-medium group"
                    >
                        <Plus size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                        <Folder size={18} className="text-[var(--text-secondary)] group-hover:text-yellow-500 transition-colors" />
                    </button>
                    <button
                        onClick={onStartWriting}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--btn-bg)] text-[var(--btn-text)] font-bold hover:opacity-90 transition-all shadow-md shadow-indigo-500/20"
                    >
                        <PenLine size={18} />
                        기록 남기기
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {/* 태그 앨범들 */}
                {Object.entries(albums.groups).map(([tagName, count]) => (
                    <div
                        key={tagName}
                        onClick={() => onAlbumClick(tagName)}
                        className="aspect-[4/5] bg-white rounded-2xl shadow-sm border p-5 flex flex-col justify-between cursor-pointer hover:shadow-md hover:-translate-y-1 transition group relative overflow-hidden"
                    >
                        {/* 앨범 커버 장식 */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-gray-100 to-transparent opacity-50 rounded-bl-full" />

                        <div className="flex justify-between items-start relative z-10">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-100 transition ring-1 ring-indigo-100">
                                <Hash size={24} />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg text-gray-800 truncate mb-1">{tagName}</h3>
                            <p className="text-gray-500 text-xs flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
                                {count}개의 기록
                            </p>
                        </div>
                    </div>
                ))}

                {/* 기타 앨범 (태그 없는 글) */}
                {(albums.othersCount > 0 || Object.keys(albums.groups).length === 0) && (
                    <div
                        onClick={() => onAlbumClick(null)} // null -> 기타
                        className="aspect-[4/5] bg-gray-50 rounded-2xl shadow-sm border border-dashed border-gray-300 p-5 flex flex-col justify-between cursor-pointer hover:bg-gray-100 transition group"
                    >
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-gray-200 text-gray-500 rounded-xl group-hover:bg-white transition">
                                <MoreHorizontal size={24} />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-600 mb-1">기타 보관함</h3>
                            <p className="text-gray-500 text-xs">{albums.othersCount}개의 기록</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostAlbumPage;
