import React from 'react';

export const ColorChip = React.memo(function ColorChip({ color, name, code }: { color: string; name: string; code: string }) {
    return (
        <div className="w-full h-full bg-white shadow-sm rounded-lg overflow-hidden flex flex-col border border-gray-100">
            <div className="flex-1 w-full" style={{ backgroundColor: color }} />
            <div className="p-2 bg-white w-full">
                <p className="font-bold text-gray-800 text-xs truncate">{name}</p>
                <p className="text-gray-500 text-[10px] truncate">{code}</p>
            </div>
        </div>
    );
});
