import React from 'react';
import { WidgetWrapper } from '../../Shared';
import { Sigma, BarChart3 } from 'lucide-react';

export const RollupConfig = {
    defaultSize: '2x2',
    validSizes: [[2, 2], [3, 2]] as [number, number][],
};

export const Rollup = ({ style, gridSize: _ }: { style?: React.CSSProperties, gridSize?: { w: number; h: number } }) => {
    return (
        <WidgetWrapper className="bg-white" style={style}>
            <div className="w-full h-full flex flex-col p-4">
                <div className="flex items-center gap-2 mb-4 text-gray-500">
                    <Sigma size={14} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Rollup: Progress</span>
                </div>

                <div className="flex-1 flex flex-col justify-center gap-3">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-gray-800">85%</span>
                            <span className="text-xs text-gray-400">Avg. Completion</span>
                        </div>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <BarChart3 size={16} />
                        </div>
                    </div>

                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                            style={{ width: '85%' }}
                        />
                    </div>

                    <div className="flex gap-2 mt-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-500">Tasks</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-500">Calculate: Avg</span>
                    </div>
                </div>
            </div>
        </WidgetWrapper>
    );
};
