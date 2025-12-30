import React, { useMemo, useState } from 'react';
import type { PostData } from '../types';
import { Folder, Plus, PenLine, MoreVertical, Trash2, Edit } from 'lucide-react';
import RenameAlbumModal from '../components/RenameAlbumModal';

interface Props {
    posts: PostData[];
    customAlbums: any[]; // CustomAlbum type
    onAlbumClick: (tagName: string | null) => void;
    onCreateAlbum: () => void;
    onStartWriting: () => void;
    onRenameAlbum: (oldName: string, newName: string) => void;
    onDeleteAlbum: (albumName: string) => void;
}

const PostAlbumPage: React.FC<Props> = ({ posts, customAlbums, onAlbumClick, onCreateAlbum, onStartWriting, onRenameAlbum, onDeleteAlbum }) => {
    const [activeDropdownAlbum, setActiveDropdownAlbum] = useState<string | null>(null);
    const [renamingAlbum, setRenamingAlbum] = useState<string | null>(null);

    // 태그별로 포스트 그룹화 (커스텀 앨범 포함)
    const albums = useMemo(() => {
        // 1. 커스텀 앨범 먼저 초기화 (카운트 0)
        const groups: Record<string, number> = {};
        customAlbums.forEach(album => {
            groups[album.name] = 0;
        });

        let othersCount = 0;

        // 2. 게시글 순회하며 카운트 증가
        posts.forEach(post => {
            if (post.tags && post.tags.length > 0) {
                post.tags.forEach(tag => {
                    // 커스텀 앨범에 정의된 태그만 카운트하거나, 태그 자체를 앨범으로 취급
                    // 여기서는 태그명 = 앨범명 단순 매핑 가정
                    groups[tag] = (groups[tag] || 0) + 1;
                });
            } else {
                othersCount++;
            }
        });

        return { groups, othersCount };
    }, [posts, customAlbums]);

    // 앨범 메뉴 핸들러
    const handleMenuClick = (e: React.MouseEvent, albumName: string) => {
        e.stopPropagation();
        setActiveDropdownAlbum(activeDropdownAlbum === albumName ? null : albumName);
    };

    const handleDeleteClick = (e: React.MouseEvent, albumName: string) => {
        e.stopPropagation();
        if (confirm(`'${albumName}' 앨범을 정말 삭제하시겠습니까?\n포함된 모든 글과 폴더가 함께 삭제됩니다.`)) {
            onDeleteAlbum(albumName);
            setActiveDropdownAlbum(null);
        }
    };

    const handleRenameClick = (e: React.MouseEvent, albumName: string) => {
        e.stopPropagation();
        setRenamingAlbum(albumName);
        setActiveDropdownAlbum(null);
    };

    const handleRenameSave = (newName: string) => {
        if (renamingAlbum) {
            onRenameAlbum(renamingAlbum, newName);
            setRenamingAlbum(null);
        }
    };

    const formatTitle = (title: string) => {
        if (title.length > 8) return title.slice(0, 8) + '...';
        return title;
    };

    return (
        <div>
            {/* 상단 헤더 */}
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
                        className="aspect-[4/5] bg-white rounded-2xl shadow-sm border p-5 flex flex-col justify-between cursor-pointer hover:shadow-md hover:-translate-y-1 transition group relative overflow-visible"
                    >
                        {/* 앨범 커버 장식 */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gray-100 to-transparent opacity-50 rounded-bl-full pointer-events-none rounded-tr-2xl" />

                        {/* 상단 메뉴 버튼: 우측 상단 절대 위치, hover 효과 제거 */}
                        <div className="absolute top-3 right-3 z-30">
                            <button
                                onClick={(e) => handleMenuClick(e, tagName)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <MoreVertical size={20} />
                            </button>

                            {/* 드롭다운 메뉴 */}
                            {activeDropdownAlbum === tagName && (
                                <div className="absolute top-8 right-0 bg-white border border-gray-200 shadow-xl rounded-xl w-48 py-2 z-50 animate-scale-up origin-top-right cursor-default" onClick={e => e.stopPropagation()}>
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-xs font-bold text-gray-500">앨범 관리</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); alert("표지 변경 기능 준비 중 🚧"); }}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                    >
                                        <Folder size={16} /> 표지 변경
                                    </button>
                                    <button
                                        onClick={(e) => handleRenameClick(e, tagName)}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                    >
                                        <Edit size={16} /> 이름 변경
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteClick(e, tagName)}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                                    >
                                        <Trash2 size={16} /> 앨범 삭제
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 하단 영역: 제목 및 태그 (한 줄 배치) */}
                        <div className="relative z-10 w-full mt-auto">
                            <div className="flex items-center gap-2 mb-2 w-full">
                                <h3 className="font-bold text-lg text-gray-800 shrink-0" title={tagName}>
                                    {formatTitle(tagName)}
                                </h3>
                                {/* 해시태그 Pill - 제목 옆에 배치 */}
                                <span className="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full font-bold border border-indigo-100 shrink-0">
                                    #{tagName}
                                </span>
                            </div>
                            <p className="text-gray-500 text-xs flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
                                {count}개의 기록
                            </p>
                        </div>
                    </div>
                ))}

                {/* 기타 앨범 */}
                {(albums.othersCount > 0 || Object.keys(albums.groups).length === 0) && (
                    <div
                        onClick={() => onAlbumClick(null)}
                        className="aspect-[4/5] bg-white rounded-2xl shadow-sm border p-5 flex flex-col justify-between cursor-pointer hover:shadow-md hover:-translate-y-1 transition group relative overflow-visible"
                    >
                        {/* 앨범 커버 장식 */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gray-100 to-transparent opacity-50 rounded-bl-full pointer-events-none rounded-tr-2xl" />

                        {/* 상단 메뉴 아이콘 (기능 없음, 비주얼 일치용) */}
                        <div className="absolute top-3 right-3 z-30">
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors cursor-default">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        {/* 하단 영역 */}
                        <div className="relative z-10 w-full mt-auto">
                            <div className="flex items-center gap-2 mb-2 w-full">
                                <h3 className="font-bold text-lg text-gray-800 shrink-0">
                                    미분류 보관함
                                </h3>
                                {/* 해시태그 없음 */}
                            </div>
                            <p className="text-gray-500 text-xs flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                                {albums.othersCount}개의 기록
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* 이름 변경 모달 */}
            <RenameAlbumModal
                isOpen={!!renamingAlbum}
                onClose={() => setRenamingAlbum(null)}
                onSave={handleRenameSave}
                currentName={renamingAlbum || ''}
            />
        </div>
    );
};

export default PostAlbumPage;
