import React, { useEffect, useState } from 'react';
import Navigation from '../../components/header/Navigation';
import { Globe, Search, X } from 'lucide-react'; // Settings 아이콘 추가 (선택사항)
import CommunityFeed from '../../components/community/components/CommunityFeed';
import { fetchMyProfile } from '../../components/community/api';

const Community: React.FC = () => {
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [recentTags, setRecentTags] = useState<string[]>([]);
    const [isAuthChecking, setIsAuthChecking] = useState(true);

    // 1. 수정 모드 상태 추가
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        const initUser = async () => {
            try {
                const profile = await fetchMyProfile();
                if (profile) {
                    setUserId(profile.id);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
            } finally {
                setIsAuthChecking(false);
            }
        };
        const savedTags = localStorage.getItem('community_recent_tags');
        if (savedTags) {
            setRecentTags(JSON.parse(savedTags));
        }
        initUser();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        const tag = searchQuery.trim().replace(/^#/, '');
        setSelectedTag(tag);

        const updatedTags = [tag, ...recentTags.filter(t => t !== tag)].slice(0, 10);
        setRecentTags(updatedTags);
        localStorage.setItem('community_recent_tags', JSON.stringify(updatedTags));

        setSearchQuery('');
        setIsEditMode(false); // 검색 시 수정 모드 종료
    };

    const handleTagClick = (tag: string) => {
        if (selectedTag === tag) {
            setSelectedTag(null);
        } else {
            setSelectedTag(tag);
        }
    };

    const handleRemoveTag = (tag: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedTags = recentTags.filter(t => t !== tag);
        setRecentTags(updatedTags);
        localStorage.setItem('community_recent_tags', JSON.stringify(updatedTags));
        if (selectedTag === tag) {
            setSelectedTag(null);
        }

        // 태그가 다 지워지면 수정모드 끄기
        if (updatedTags.length === 0) {
            setIsEditMode(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-9 pb-32">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-[var(--border-color)]">
                    <div>
                        <h2 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                            <Globe className="text-indigo-500 fill-indigo-500/20" size={32} />
                            커뮤니티
                        </h2>
                        <p className="text-[var(--text-secondary)] text-sm mt-2 ml-1">다른 사용자들의 기록을 구경해보세요.</p>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-4 md:mt-0 w-full md:w-96">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="태그 검색 (Enter)"
                                className="w-full pl-10 pr-4 py-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        </form>
                    </div>
                </div>

                {/* Recent / Selected Tags */}
                {(recentTags.length > 0 || selectedTag) && (
                    <div className="mb-8 animate-fade-in-up">
                        {/* 2. 상단 라벨 및 편집 토글 버튼 영역 */}
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-[var(--text-secondary)]">최근 검색:</span>
                            {recentTags.length > 0 && (
                                <button
                                    onClick={() => setIsEditMode(!isEditMode)}
                                    className={`text-xs font-medium px-2 py-1 rounded transition-colors ${isEditMode
                                        ? 'text-indigo-500 bg-indigo-50'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    {isEditMode ? '완료' : '편집'}
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {recentTags.map((tag, index) => (
                                <button
                                    key={`tag-${tag}-${index}`}
                                    onClick={() => handleTagClick(tag)}
                                    className={`pl-3 pr-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 border ${selectedTag === tag
                                        ? 'bg-indigo-500 border-indigo-500 text-white shadow-md transform scale-105'
                                        : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-indigo-300 hover:text-indigo-500'
                                        } 
                                        /* 3. 수정 모드일 때 우측 패딩 조정 (X 버튼 공간 확보) - 선택사항 */
                                        ${isEditMode ? 'pr-1.5' : ''}
                                        `}
                                >
                                    <span className="opacity-70">#</span>{tag}

                                    {/* 4. 수정 모드일 때만 X 버튼 렌더링 */}
                                    {isEditMode && (
                                        <div
                                            onClick={(e) => handleRemoveTag(tag, e)}
                                            className={`rounded-full p-0.5 ml-1 transition-colors cursor-pointer ${selectedTag === tag
                                                ? 'hover:bg-indigo-600 text-white'
                                                : 'hover:bg-[var(--bg-card-secondary)] text-[var(--text-secondary)]'
                                                }`}
                                        >
                                            <X size={14} />
                                        </div>
                                    )}
                                </button>
                            ))}

                            {/* 선택된 태그가 최근 검색어에 없을 경우 표시되는 태그 (수정 모드 영향 X) */}
                            {selectedTag && !recentTags.includes(selectedTag) && (
                                <button
                                    onClick={() => handleTagClick(selectedTag)}
                                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-500 border border-indigo-500 text-white shadow-md flex items-center gap-1.5"
                                >
                                    <span className="opacity-70">#</span>{selectedTag}
                                    <X size={12} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedTag(null); }} />
                                </button>
                            )}

                            {/* 전체보기 버튼 */}
                            {selectedTag && (
                                <button
                                    onClick={() => setSelectedTag(null)}
                                    className="ml-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline decoration-dotted underline-offset-4"
                                >
                                    전체보기
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="w-full">
                    {isAuthChecking ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : (
                        <CommunityFeed currentUserId={userId} selectedTag={selectedTag} />
                    )}
                </div>
            </main>
        </div>
    );
};

export default Community;