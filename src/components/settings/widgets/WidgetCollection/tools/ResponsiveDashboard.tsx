import React, { useState } from 'react';
import { Activity, Battery, Bell, Calendar, ChevronRight, LayoutGrid, List, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResponsiveDashboardProps {
    gridSize?: { w: number, h: number };
}

// Enum to mimic WidgetFamily
enum WidgetFamily {
    systemSmall = 'systemSmall',
    systemMedium = 'systemMedium',
    systemLarge = 'systemLarge',
}

const getFamily = (w: number, h: number): WidgetFamily => {
    if (w >= 4) return WidgetFamily.systemLarge;
    if (w >= 2) return WidgetFamily.systemMedium;
    return WidgetFamily.systemSmall;
};

// 1. case .systemSmall: Low density, single state
const SmallView = () => (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <Activity size={32} className="mb-2 animate-pulse" />
        <span className="text-2xl font-bold">Active</span>
        <span className="text-xs opacity-80 mt-1">System OK</span>
    </div>
);

// 2. case .systemMedium: List of items 3-4, deep links
const MediumView = () => {
    const items = [
        { id: 1, label: 'New Post', icon: <List size={14} />, link: '/post' },
        { id: 2, label: 'Analysis', icon: <Activity size={14} />, link: '/community' },
        { id: 3, label: 'Schedule', icon: <Calendar size={14} />, link: '/home' },
    ];

    return (
        <div className="w-full h-full bg-white dark:bg-zinc-800 p-3 flex flex-col justify-center">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-1 flex items-center gap-1">
                <LayoutGrid size={12} /> Quick Actions
            </h3>
            <div className="flex flex-col gap-1.5">
                {items.map((item) => (
                    <Link
                        key={item.id}
                        to={item.link}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors group"
                    >
                        <div className="flex items-center gap-2">
                            <span className="p-1 rounded bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-300">
                                {item.icon}
                            </span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                ))}
            </div>
        </div>
    );
};

// 3. case .systemLarge: Dashboard, interactive, chart
const LargeView = () => {
    const [status, setStatus] = useState<'Normal' | 'Saving' | 'Turbo'>('Normal');

    const stats = [
        { label: 'CPU', value: 45, color: 'bg-blue-500' },
        { label: 'RAM', value: 72, color: 'bg-purple-500' },
        { label: 'GPU', value: 28, color: 'bg-emerald-500' },
        { label: 'NET', value: 60, color: 'bg-orange-500' },
        { label: 'SSD', value: 85, color: 'bg-red-500' },
        { label: 'FAN', value: 30, color: 'bg-cyan-500' },
    ];

    return (
        <div className="w-full h-full bg-white dark:bg-zinc-900 flex flex-col p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === 'Turbo' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        <Zap size={20} className={status === 'Turbo' ? 'animate-bounce' : ''} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">System Monitor</h2>
                        <p className="text-xs text-gray-500 font-medium">Mode: {status}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setStatus('Normal')}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${status === 'Normal' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        Normal
                    </button>
                    <button
                        onClick={() => setStatus('Turbo')}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${status === 'Turbo' ? 'bg-red-500 text-white ring-2 ring-red-200' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                    >
                        Turbo
                    </button>
                </div>
            </div>

            {/* Content: Chart & Stats */}
            <div className="flex-1 flex gap-4">
                {/* Simple Bar Chart Visualization */}
                <div className="flex-1 flex items-end justify-between gap-2 p-2 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                    {stats.slice(0, 6).map((stat, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 w-full">
                            <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-24 relative overflow-hidden flex flex-col justify-end">
                                <div
                                    className={`w-full ${stat.color} transition-all duration-700 ease-out`}
                                    style={{ height: `${stat.value}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                        </div>
                    ))}
                </div>

                {/* Side Stats */}
                <div className="w-1/3 flex flex-col justify-between py-1">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400">
                        <Battery size={18} />
                        <div>
                            <div className="text-xs opacity-70">Battery</div>
                            <div className="text-sm font-bold">92%</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-400">
                        <Bell size={18} />
                        <div>
                            <div className="text-xs opacity-70">Alerts</div>
                            <div className="text-sm font-bold">0</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Entry View
export const ResponsiveDashboard: React.FC<ResponsiveDashboardProps> = ({ gridSize = { w: 2, h: 2 } }) => {
    const family = getFamily(gridSize.w, gridSize.h);

    switch (family) {
        case WidgetFamily.systemSmall:
            return <SmallView />;
        case WidgetFamily.systemMedium:
            return <MediumView />;
        case WidgetFamily.systemLarge:
            return <LargeView />;
        default:
            return <MediumView />;
    }
};
