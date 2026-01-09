import React, { useState } from 'react';
import { WidgetWrapper } from '../../Shared';
import { ArrowUpRight, Link2, Database, Settings } from 'lucide-react';
import { useWidgetStorage } from '../SDK'; // Logic folder is in WidgetCollection/logic, so ../../SDK? No, WidgetCollection/logic -> .. -> WidgetCollection -> SDK. So ../SDK.

export const RelationLink = ({ style, gridSize }: { style?: React.CSSProperties, gridSize?: { w: number; h: number } }) => {
    const [data, setData] = useWidgetStorage('relationlink-data', {
        title: 'Project Alpha',
        subtitle: 'Connected to Tasks DB',
        link: '#'
    });
    const [isEditing, setIsEditing] = useState(false);

    const isSmall = (gridSize?.w || 2) < 2;

    if (isEditing) {
        return (
            <WidgetWrapper className="bg-white" style={style}>
                <div className="flex flex-col gap-2 p-2 h-full justify-center">
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData({ ...data, title: e.target.value })}
                        className="border rounded p-1 text-xs w-full"
                        placeholder="Title"
                    />
                    <input
                        type="text"
                        value={data.subtitle}
                        onChange={(e) => setData({ ...data, subtitle: e.target.value })}
                        className="border rounded p-1 text-xs w-full"
                        placeholder="Subtitle"
                    />
                    <button
                        onClick={() => setIsEditing(false)}
                        className="bg-blue-500 text-white text-xs py-1 rounded w-full"
                    >
                        Save
                    </button>
                </div>
            </WidgetWrapper>
        );
    }

    if (isSmall) {
        return (
            <WidgetWrapper className="bg-white relative group" style={style}>
                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-1 right-1 text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Settings size={10} />
                </button>
                <div className="w-full h-full flex flex-col items-center justify-center p-2">
                    <div className="w-6 h-6 rounded bg-blue-50 text-blue-500 flex items-center justify-center mb-1">
                        <Link2 size={14} />
                    </div>
                    <span className="text-[9px] font-bold text-gray-700 truncate max-w-full">{data.title}</span>
                </div>
            </WidgetWrapper>
        );
    }
    return (
        <WidgetWrapper className="bg-white relative group" style={style}>
            <button
                onClick={() => setIsEditing(true)}
                className="absolute top-2 right-2 text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <Settings size={12} />
            </button>
            <div className="w-full h-full flex flex-col p-3 justify-center">
                <div className="flex items-center gap-2 mb-3 text-gray-500">
                    <Link2 size={14} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Relation</span>
                </div>

                <div className="group/item cursor-pointer">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 group-hover/item:bg-blue-50 group-hover/item:border-blue-100 transition-all duration-200">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-500">
                            <Database size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-800 truncate group-hover/item:text-blue-700 transition-colors">
                                {data.title}
                            </h4>
                            <p className="text-xs text-gray-400 truncate">{data.subtitle}</p>
                        </div>
                        <ArrowUpRight size={16} className="text-gray-300 group-hover/item:text-blue-500 transition-colors" />
                    </div>
                </div>
            </div>
        </WidgetWrapper>
    );
};
