import React from 'react';
import { Calendar, Image as ImageIcon, User, Link } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';

// 16. Quick Links (즐겨찾기)
export const QuickLinks = React.memo(function QuickLinks() {
    return (
        <WidgetWrapper className="bg-gray-100">
            <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-1 p-1">
                <div className="bg-white rounded-lg flex flex-col items-center justify-center shadow-sm hover:shadow cursor-pointer hover:scale-95 transition-all">
                    <Calendar className="w-5 h-5 text-blue-500 mb-1" />
                    <span className="text-[9px] text-gray-600">Calendar</span>
                </div>
                <div className="bg-white rounded-lg flex flex-col items-center justify-center shadow-sm hover:shadow cursor-pointer hover:scale-95 transition-all">
                    <ImageIcon className="w-5 h-5 text-green-500 mb-1" />
                    <span className="text-[9px] text-gray-600">Gallery</span>
                </div>
                <div className="bg-white rounded-lg flex flex-col items-center justify-center shadow-sm hover:shadow cursor-pointer hover:scale-95 transition-all">
                    <User className="w-5 h-5 text-purple-500 mb-1" />
                    <span className="text-[9px] text-gray-600">Profile</span>
                </div>
                <div className="bg-white rounded-lg flex flex-col items-center justify-center shadow-sm hover:shadow cursor-pointer hover:scale-95 transition-all">
                    <Link className="w-5 h-5 text-gray-500 mb-1" />
                    <span className="text-[9px] text-gray-600">Blog</span>
                </div>
            </div>
        </WidgetWrapper>
    );
});
