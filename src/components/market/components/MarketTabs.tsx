import React from 'react';
import { Search, Heart } from 'lucide-react';


interface MarketTabsProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

const TABS = [
    { id: 'all', label: '전체' },
    { id: 'wishlist', label: '찜 목록', icon: Heart },
    { id: 'package', label: '📦 패키지' },
    { id: 'sticker', label: '스티커' },
    { id: 'template_widget', label: '위젯 템플릿' },
    { id: 'template_post', label: '게시물 템플릿' },
];

const MarketTabs: React.FC<MarketTabsProps> = ({ activeTab, setActiveTab, searchTerm, setSearchTerm }) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [startX, setStartX] = React.useState(0);
    const [scrollLeft, setScrollLeft] = React.useState(0);
    const [dragMoved, setDragMoved] = React.useState(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setDragMoved(false);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 1.5; // Scroll multiplier
        if (Math.abs(walk) > 5) {
            setDragMoved(true);
        }
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 sticky top-16 md:top-20 z-40 py-4 -mx-4 px-4 transition-all mt-4 theme-bg-header backdrop-blur-xl md:items-center overflow-hidden">
            <div
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className={`flex overflow-x-auto py-2 gap-3 flex-1 scrollbar-hide px-1 select-none active:cursor-grabbing ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            if (dragMoved) return; // Ignore click if we were dragging
                            if (activeTab === tab.id) {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            } else {
                                setActiveTab(tab.id);
                            }
                        }}
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
