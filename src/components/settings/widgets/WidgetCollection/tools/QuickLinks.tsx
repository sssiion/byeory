import React from 'react';
import { Calendar, Image as ImageIcon, User, Link, Youtube, Github, Mail, Search } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';

export const QuickLinksConfig = {
    defaultSize: '2x1',
    validSizes: [[1, 1], [2, 1]] as [number, number][],
};

interface QuickLinksProps {
    gridSize?: { w: number; h: number };
}

// 16. Quick Links (즐겨찾기)
export const QuickLinks = React.memo(function QuickLinks({ gridSize }: QuickLinksProps) {
    const isSmall = (gridSize?.w || 2) < 2;
    const isLarge = (gridSize?.w || 2) >= 4;

    const allLinks = [
        { label: 'Calendar', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
        { label: 'Gallery', icon: ImageIcon, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
        { label: 'Profile', icon: User, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
        { label: 'Search', icon: Search, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
        { label: 'Youtube', icon: Youtube, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
        { label: 'GitHub', icon: Github, color: 'text-gray-800 dark:text-gray-200', bg: 'bg-gray-50 dark:bg-gray-500/10' },
        { label: 'Mail', icon: Mail, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-500/10' },
        { label: 'Blog', icon: Link, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-500/10' }
    ];

    // Determine items to show
    // 1x1: 4 items (2x2 grid)
    // 2x1: 8 items (4x2 grid)
    // 4x2: 8 items (4x2 grid, bigger)
    const items = isSmall ? allLinks.slice(0, 4) : allLinks;
    const gridCols = isSmall ? 'grid-cols-2' : 'grid-cols-4';
    const gridRows = isSmall ? 'grid-rows-2' : 'grid-rows-2'; // 2 rows always sufficient for 4 or 8

    return (
        <WidgetWrapper className="theme-bg-card">
            <div className={`grid ${gridCols} ${gridRows} w-full h-full gap-2 p-2`}>
                {items.map((item, idx) => (
                    <button
                        key={idx}
                        className={`
                            ${item.bg} rounded-xl flex flex-col items-center justify-center 
                            shadow-sm hover:shadow-md cursor-pointer 
                            hover:scale-105 active:scale-95 transition-all duration-300
                            group
                        `}
                    >
                        <item.icon className={`${isLarge ? 'w-6 h-6' : 'w-5 h-5'} mb-1 ${item.color} group-hover:-translate-y-0.5 transition-transform`} />
                        {!isSmall && <span className={`text-[9px] font-medium text-gray-600 dark:text-gray-300 opacity-80 group-hover:opacity-100 ${isLarge ? 'text-[11px]' : ''}`}>{item.label}</span>}
                    </button>
                ))}
            </div>
        </WidgetWrapper>
    );
});
