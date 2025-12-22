import React from 'react';
import { WidgetWrapper } from '../../Shared';

// 9. My Persona (나의 페르소나)
export const MyPersona = React.memo(function MyPersona() {
    return (
        <WidgetWrapper className="bg-gradient-to-tr from-purple-100 to-white">
            <div className="w-full h-full flex flex-col items-center justify-center p-3">
                <div className="w-16 h-16 rounded-full bg-white p-1 shadow-md mb-2">
                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="Profile" className="w-full h-full rounded-full bg-purple-50" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">꿈꾸는 여행자</h3>
                <div className="flex gap-1 mt-2 flex-wrap justify-center">
                    <span className="text-[9px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded">INFP</span>
                    <span className="text-[9px] bg-pink-200 text-pink-800 px-1.5 py-0.5 rounded">새벽감성</span>
                    <span className="text-[9px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded">음악</span>
                </div>
            </div>
        </WidgetWrapper>
    );
});
