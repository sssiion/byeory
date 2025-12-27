import React from 'react';
import { Calendar, Image as ImageIcon, User, Link } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';

// 16. Quick Links (즐겨찾기)
export const QuickLinks = React.memo(function QuickLinks() {
    return (
        <WidgetWrapper className="bg-gray-100 dark:bg-gray-800">
            <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-1 p-1">
                {[
                    { label: 'Calendar', icon: Calendar, color: 'text-blue-500' },
                    { label: 'Gallery', icon: ImageIcon, color: 'text-green-500' },
                    { label: 'Profile', icon: User, color: 'text-purple-500' },
                    { label: 'Blog', icon: Link, color: 'text-gray-500 dark:text-gray-400' }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-700/50 rounded-lg flex flex-col items-center justify-center shadow-sm hover:shadow cursor-pointer hover:scale-95 transition-all">
                        <item.icon className={`w-5 h-5 mb-1 ${item.color}`} />
                        <span className="text-[9px] text-gray-600 dark:text-gray-300">{item.label}</span>
                    </div>
                ))}
            </div>
        </WidgetWrapper>
    );
});
