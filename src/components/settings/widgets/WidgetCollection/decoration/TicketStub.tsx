import React from 'react';

export const TicketStubConfig = {
    defaultSize: '2x1',
    validSizes: [[2, 1]] as [number, number][],
};

export const TicketStub = ({ title = 'Movie Night', date = '24.12.24', seat = 'H12', gridSize: _ }: { title?: string, date?: string, seat?: string, gridSize?: { w: number; h: number } }) => {
    return (
        <div className="w-full h-full flex bg-[#fffbf0] rounded-lg overflow-hidden shadow-sm border border-[#e5e0d0]">
            <div className="flex-1 p-2 flex flex-col justify-center border-r-2 border-dashed border-[#dcdcdc] relative min-w-0">
                <h3 className="font-bold text-[#2c2c2c] text-sm truncate leading-tight tracking-tighter">{title}</h3>
                <p className="text-[#888] text-[10px] mt-1 truncate">{date}</p>
                <div className="absolute -top-2 -right-1.5 w-3 h-3 bg-[var(--bg-card)] rounded-full border border-[#e5e0d0]" />
                <div className="absolute -bottom-2 -right-1.5 w-3 h-3 bg-[var(--bg-card)] rounded-full border border-[#e5e0d0]" />
            </div>
            <div className="w-8 md:w-12 flex flex-col items-center justify-center bg-[#2c2c2c] text-[#fffbf0] p-1">
                <span className="text-[10px] font-bold rotate-90 whitespace-nowrap">{seat}</span>
            </div>
        </div>
    );

