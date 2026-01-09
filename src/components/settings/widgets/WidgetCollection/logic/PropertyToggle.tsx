import React, { useState } from 'react';
import { WidgetWrapper } from '../../Shared';
import { SlidersHorizontal, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

export const PropertyToggle = ({ style, gridSize }: { style?: React.CSSProperties, gridSize?: { w: number; h: number } }) => {
    const isSmall = (gridSize?.w || 2) < 2;
    const [isOpen, setIsOpen] = useState(false);
    const [props, setProps] = useState([
        { id: 1, name: 'Status', visible: true },
        { id: 2, name: 'Assignee', visible: true },
        { id: 3, name: 'Date', visible: false },
        { id: 4, name: 'Priority', visible: false },
    ]);

    const toggleProp = (id: number) => {
        setProps(props.map(p => p.id === id ? { ...p, visible: !p.visible } : p));
    };



    if (isSmall) {
        return (
            <WidgetWrapper className="bg-white" style={style}>
                <div className="w-full h-full flex flex-col items-center justify-center" onClick={() => setIsOpen(!isOpen)}>
                    <SlidersHorizontal size={16} className="text-gray-700 mb-1" />
                    <span className="text-xs font-bold text-gray-500">{props.filter(p => p.visible).length}</span>
                </div>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-white" style={style}>
            <div className="w-full h-full flex flex-col p-3 overflow-hidden">
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1.5 -mx-1.5 rounded-lg transition-colors mb-2"
                >
                    <div className="flex items-center gap-2 text-gray-700">
                        <SlidersHorizontal size={14} />
                        <span className="text-sm font-bold">Properties</span>
                        <span className="text-xs font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                            {props.filter(p => p.visible).length} shown
                        </span>
                    </div>
                    {isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </div>

                {isOpen ? (
                    <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {props.map(p => (
                            <div
                                key={p.id}
                                onClick={() => toggleProp(p.id)}
                                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 cursor-pointer group"
                            >
                                <span className={`text-xs ${p.visible ? 'text-gray-700 font-medium' : 'text-gray-400 line-through'}`}>
                                    {p.name}
                                </span>
                                {p.visible ?
                                    <Eye size={12} className="text-blue-500" /> :
                                    <EyeOff size={12} className="text-gray-300 group-hover:text-gray-500" />
                                }
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-wrap gap-1 justify-center opacity-50">
                            {props.filter(p => p.visible).map(p => (
                                <span key={p.id} className="w-8 h-1.5 bg-gray-200 rounded-full" />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
};
