import React from 'react';
import { Search, Heart, FolderOpen } from 'lucide-react';

interface MarketTabsProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

const TABS = [
    { id: 'all', label: '전체' },
    { id: 'free', label: '무료' },
    { id: 'start_pack', label: '⭐ 스타터 팩' },
    { id: 'sticker', label: '스티커' },
    { id: 'template_widget', label: '위젯 템플릿' },
    { id: 'template_post', label: '게시물 템플릿' },
    { id: 'wishlist', label: '찜 목록', icon: Heart },
    { id: 'myshop', label: '내 상점', icon: FolderOpen },
    { id: 'history', label: '구매 내역' }
];

const MarketTabs: React.FC<MarketTabsProps> = ({ activeTab, setActiveTab, searchTerm, setSearchTerm }) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 sticky top-16 md:top-20 z-40 py-4 -mx-4 px-4 transition-all mt-4 theme-bg-header backdrop-blur-xl md:items-center">
            <div className="flex overflow-x-auto py-2 gap-3 flex-1 scrollbar-hide px-1">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2
                                    ${activeTab === tab.id
                                ? 'bg-[var(--btn-bg)] text-white shadow-md transform scale-105 ml-1'
                                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-card-secondary)]'
                            }`}
                    >
                        {tab.icon && <tab.icon size={16} />}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="relative w-full md:w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4" />
                <input
                    type="text"
                    placeholder="아이템 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full theme-bg-card-secondary border border-[var(--border-color)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)] transition-all"
                />
            </div>
        </div>
    );
};

export default MarketTabs;
