import React, { useEffect, useState } from 'react';
import Navigation from '../../components/Header/Navigation';
import { Globe, Search, X } from 'lucide-react';
import CommunityFeed from './components/CommunityFeed';
import { fetchMyProfile } from './api';

const Community: React.FC = () => {
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [recentTags, setRecentTags] = useState<string[]>([]);

    useEffect(() => {
        const initUser = async () => {
            const profile = await fetchMyProfile();
            if (profile) {
                setUserId(profile.id);
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

        const tag = searchQuery.trim().replace(/^#/, ''); // Remove # if user typed it
        setSelectedTag(tag);

        const updatedTags = [tag, ...recentTags.filter(t => t !== tag)].slice(0, 10);
        setRecentTags(updatedTags);
        localStorage.setItem('community_recent_tags', JSON.stringify(updatedTags));

        setSearchQuery('');
    };

    const handleTagClick = (tag: string) => {
        if (selectedTag === tag) {
            setSelectedTag(null); // Toggle off
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
    };

    return (
        <div className="min-h-screen">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pb-32">
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
                    <div className="flex flex-wrap items-center gap-2 mb-8 animate-fade-in-up">
                        <span className="text-xs text-[var(--text-secondary)] mr-2">최근 검색:</span>
                        {recentTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => handleTagClick(tag)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 group border ${selectedTag === tag
                                    ? 'bg-indigo-500 border-indigo-500 text-white shadow-md transform scale-105'
                                    : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-indigo-300 hover:text-indigo-500'
                                    }`}
                            >
                                <span className="opacity-70">#</span>{tag}
                                <div
                                    onClick={(e) => handleRemoveTag(tag, e)}
                                    className={`rounded-full p-0.5 transition-colors ${selectedTag === tag
                                        ? 'hover:bg-indigo-600'
                                        : 'hover:bg-[var(--bg-card-secondary)]'
                                        }`}
                                >
                                    <X size={12} className={selectedTag === tag ? "opacity-100" : "opacity-0 group-hover:opacity-60"} />
                                </div>
                            </button>
                        ))}
                        {selectedTag && !recentTags.includes(selectedTag) && (
                            <button
                                onClick={() => handleTagClick(selectedTag)}
                                className="px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-500 border border-indigo-500 text-white shadow-md flex items-center gap-1.5"
                            >
                                <span className="opacity-70">#</span>{selectedTag}
                                <X size={12} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedTag(null); }} />
                            </button>
                        )}
                        {selectedTag && (
                            <button
                                onClick={() => setSelectedTag(null)}
                                className="ml-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline decoration-dotted underline-offset-4"
                            >
                                전체보기
                            </button>
                        )}
                    </div>
                )}

                <div className="w-full">
                    <CommunityFeed currentUserId={userId} selectedTag={selectedTag} />
                </div>
            </main>
        </div>
    );
};

export default Community;
