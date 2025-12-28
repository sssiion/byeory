import React from 'react';
import { Calendar, Image as ImageIcon, User, Link, Youtube, Github, Mail, Search } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';

export const QuickLinksConfig = {
    defaultSize: '2x1',
    validSizes: [[2, 1], [4, 1], [4, 2]] as [number, number][],
};

// 16. Quick Links (즐겨찾기)
export const QuickLinks = React.memo(function QuickLinks() {
    return (
        <WidgetWrapper className="bg-gray-100 dark:bg-zinc-800">
            <div className="grid grid-cols-4 grid-rows-2 w-full h-full gap-2 p-2">
                {[
                    { label: 'Calendar', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                    { label: 'Gallery', icon: ImageIcon, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
                    { label: 'Profile', icon: User, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
                    { label: 'Search', icon: Search, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
                    { label: 'Youtube', icon: Youtube, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
                    { label: 'GitHub', icon: Github, color: 'text-gray-800 dark:text-gray-200', bg: 'bg-gray-50 dark:bg-gray-500/10' },
                    { label: 'Mail', icon: Mail, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                    { label: 'Blog', icon: Link, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-500/10' }
                ].map((item, idx) => (
                    <button
                        key={idx}
                        className={`
                            ${item.bg} rounded-xl flex flex-col items-center justify-center 
                            shadow-sm hover:shadow-md cursor-pointer 
                            hover:scale-105 active:scale-95 transition-all duration-300
                            group
                        `}
                    >
                        <item.icon className={`w-5 h-5 mb-1 ${item.color} group-hover:-translate-y-0.5 transition-transform`} />
                        <span className="text-[9px] font-medium text-gray-600 dark:text-gray-300 opacity-80 group-hover:opacity-100">{item.label}</span>
                    </button>
                ))}
            </div>
        </WidgetWrapper>
    );
});
