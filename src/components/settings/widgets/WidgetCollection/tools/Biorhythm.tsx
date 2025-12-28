import { useState, useMemo } from 'react';
import { Settings, TrendingUp } from 'lucide-react';
import { WidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';

// 바이오리듬 계산을 위한 유틸리티
const getBiorhythm = (birthDate: Date, targetDate: Date, cycle: number) => {
    const diffTime = targetDate.getTime() - birthDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    return Math.sin((2 * Math.PI * diffDays) / cycle) * 100;
};

interface BiorhythmProps {
    gridSize?: { w: number; h: number };
}

export function Biorhythm({ gridSize }: BiorhythmProps) {
    // SDK Storage for birthDate
    const [birthDateStr, setBirthDateStr] = useWidgetStorage('widget-biorhythm-birthdate', '');
    const [isEditing, setIsEditing] = useState(!birthDateStr);
    const [tempDate, setTempDate] = useState(birthDateStr);

    const today = useMemo(() => new Date(), []);

    // Responsive Logic
    const w = gridSize?.w || 2;
    const isSmall = w === 1;
    const isLarge = w >= 3;

    // 생년월일 저장 핸들러
    const handleSave = () => {
        if (tempDate) {
            setBirthDateStr(tempDate);
            setIsEditing(false);
        }
    };

    // 데이터 계산 (오늘 기준 -6일 ~ +6일)
    const data = useMemo(() => {
        if (!birthDateStr) return null;
        const birth = new Date(birthDateStr);

        const points = [];
        const range = isLarge ? 10 : 6; // Larger range for larger view
        for (let i = -range; i <= range; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            points.push({
                day: i, // 0이 오늘
                physical: getBiorhythm(birth, date, 23),
                emotional: getBiorhythm(birth, date, 28),
                intellectual: getBiorhythm(birth, date, 33),
            });
        }
        return points;
    }, [birthDateStr, today, isLarge]);

    const todayValues = data ? data.find(d => d.day === 0) : null;

    // SVG 그래프 생성 헬퍼
    const createPath = (type: 'physical' | 'emotional' | 'intellectual') => {
        if (!data) return '';
        // Viewbox width depends on container, but let's normalize to 100% width in svg
        // Using approximate scaling: 20px per day
        return data.reduce((acc, point, index) => {
            const x = index * (isLarge ? 14 : 20) + 10;
            const y = 50 - (point[type] * 0.4);
            return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
        }, '');
    };

    if (isEditing || !birthDateStr) {
        return (
            <WidgetWrapper className="bg-white dark:bg-slate-800 p-4 flex flex-col items-center justify-center">
                <h3 className="text-[10px] font-bold mb-2 text-gray-400">BIRTHDAY</h3>
                <input
                    type="date"
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    className="w-full p-1 border rounded text-xs mb-2 bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
                <button
                    onClick={handleSave}
                    disabled={!tempDate}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-bold hover:bg-blue-600 disabled:opacity-50"
                >
                    OK
                </button>
            </WidgetWrapper>
        );
    }

    // --- Small View (1x1) ---
    if (isSmall) {
        const best = Math.max(todayValues?.physical || 0, todayValues?.emotional || 0, todayValues?.intellectual || 0);
        const bestLabel = best === todayValues?.physical ? 'Physical' : (best === todayValues?.emotional ? 'Emotion' : 'Intellect');

        return (
            <WidgetWrapper className="bg-white dark:bg-slate-800 flex flex-col items-center justify-center p-2 relative group">
                <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">TODAY</h3>
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <TrendingUp className={`w-6 h-6 ${best > 0 ? 'text-green-500' : 'text-orange-500'}`} />
                </div>
                <div className="text-center">
                    <span className={`text-base font-bold ${best > 0 ? 'text-green-600' : 'text-gray-500'}`}>{Math.round(best)}%</span>
                    <p className="text-[8px] text-gray-400">{bestLabel}</p>
                </div>
                <button onClick={() => setIsEditing(true)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    <Settings size={10} className="text-gray-400" />
                </button>
            </WidgetWrapper>
        );
    }

    // --- Medium & Large Views ---
    return (
        <WidgetWrapper className="bg-white dark:bg-slate-800 relative overflow-hidden">
            <div className="p-3 h-full flex flex-col">
                <div className="flex justify-between items-center mb-1 z-10">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        Biorhythm {isLarge && <span className="text-[10px] opacity-70 font-normal">| {today.toLocaleDateString()}</span>}
                    </h3>
                    <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <Settings size={12} />
                    </button>
                </div>

                <div className="flex flex-1 gap-4">
                    {/* Graph Area */}
                    <div className="flex-1 relative flex items-center justify-center">
                        <div className="absolute w-full h-px bg-gray-200 dark:bg-slate-700 top-1/2 left-0" />
                        <div className="absolute h-full w-px bg-black/10 dark:bg-white/10 left-1/2 top-0" />

                        <svg viewBox={`0 0 ${isLarge ? 300 : 260} 100`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                            <path d={createPath('physical')} fill="none" stroke="#22c55e" strokeWidth="2" className="opacity-80" />
                            <path d={createPath('emotional')} fill="none" stroke="#ef4444" strokeWidth="2" className="opacity-80" />
                            <path d={createPath('intellectual')} fill="none" stroke="#3b82f6" strokeWidth="2" className="opacity-80" />

                            {/* Today Dot */}
                            <circle cx="130" cy={50 - ((todayValues?.physical || 0) * 0.4)} r="3" fill="#22c55e" />
                            <circle cx="130" cy={50 - ((todayValues?.emotional || 0) * 0.4)} r="3" fill="#ef4444" />
                            <circle cx="130" cy={50 - ((todayValues?.intellectual || 0) * 0.4)} r="3" fill="#3b82f6" />
                        </svg>
                    </div>

                    {/* Legend / Forecast (Large View Only) */}
                    {isLarge && todayValues && (
                        <div className="w-24 flex flex-col justify-center space-y-2 text-[10px] border-l border-gray-100 pl-4 dark:border-white/5">
                            <div className="border-l-2 border-green-500 pl-2">
                                <p className="text-gray-400">신체</p>
                                <p className="font-bold">{Math.round(todayValues.physical)}%</p>
                            </div>
                            <div className="border-l-2 border-red-500 pl-2">
                                <p className="text-gray-400">감성</p>
                                <p className="font-bold">{Math.round(todayValues.emotional)}%</p>
                            </div>
                            <div className="border-l-2 border-blue-500 pl-2">
                                <p className="text-gray-400">지성</p>
                                <p className="font-bold">{Math.round(todayValues.intellectual)}%</p>
                            </div>
                        </div>
                    )}
                </div>

                {!isLarge && (
                    <div className="flex justify-between items-center mt-1 text-[9px] font-mono font-bold">
                        <span className="text-green-500">P {Math.round(todayValues?.physical || 0)}</span>
                        <span className="text-red-500">E {Math.round(todayValues?.emotional || 0)}</span>
                        <span className="text-blue-500">I {Math.round(todayValues?.intellectual || 0)}</span>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}
