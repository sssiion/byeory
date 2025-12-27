import React from 'react';
import { WidgetWrapper } from '../../Shared';
import { ArrowUpRight, Link2, Database } from 'lucide-react';

export const RelationLink = ({ style }: { style?: React.CSSProperties }) => {
    return (
        <WidgetWrapper className="bg-white" style={style}>
            <div className="w-full h-full flex flex-col p-3 justify-center">
                <div className="flex items-center gap-2 mb-3 text-gray-500">
                    <Link2 size={14} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Relation</span>
                </div>

                <div className="group cursor-pointer">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all duration-200">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-500">
                            <Database size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-700 transition-colors">
                                Project Alpha
                            </h4>
                            <p className="text-xs text-gray-400 truncate">Connected to Tasks DB</p>
                        </div>
                        <ArrowUpRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                </div>
            </div>
        </WidgetWrapper>
    );
};
