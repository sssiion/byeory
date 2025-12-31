import { ArrowLeftRight } from "lucide-react";
import React from "react";
import type { WidgetBlock } from "../../types.ts";

interface Props {
    block: WidgetBlock; // 혹은 any
    onUpdateBlock: (id: string, updates: any) => void;
}
const UnitConverterWidget: React.FC<Props> = ({ block, onUpdateBlock }) => {
    const { content, styles, id } = block;

    // 기본값 설정
    const category = content.category || 'length';
    const value = content.value ?? 1; // 입력값 (0일 수 있으므로 ?? 사용)

    // 카테고리별 단위 정의
    const units: Record<string, { label: string, ratio: number, offset?: number }[]> = {
        length: [
            { label: '미터 (m)', ratio: 1 },
            { label: '센티미터 (cm)', ratio: 0.01 },
            { label: '밀리미터 (mm)', ratio: 0.001 },
            { label: '킬로미터 (km)', ratio: 1000 },
            { label: '인치 (in)', ratio: 0.0254 },
            { label: '피트 (ft)', ratio: 0.3048 },
            { label: '야드 (yd)', ratio: 0.9144 },
        ],
        weight: [
            { label: '킬로그램 (kg)', ratio: 1 },
            { label: '그램 (g)', ratio: 0.001 },
            { label: '밀리그램 (mg)', ratio: 0.000001 },
            { label: '파운드 (lb)', ratio: 0.453592 },
            { label: '온스 (oz)', ratio: 0.0283495 },
        ],
        temperature: [
            { label: '섭씨 (°C)', ratio: 1, offset: 0 },
            { label: '화씨 (°F)', ratio: 1, offset: 0 }, // 특수 로직 사용
            { label: '켈빈 (K)', ratio: 1, offset: 0 },   // 특수 로직 사용
        ],
        area: [
            { label: '평 (py)', ratio: 3.30579 },
            { label: '제곱미터 (m²)', ratio: 1 },
            { label: '에이커 (ac)', ratio: 4046.86 },
            { label: '헥타르 (ha)', ratio: 10000 },
        ]
    };

    // 현재 선택된 단위 (없으면 첫 번째 단위로 초기화)
    const currentUnits = units[category] || units.length;
    const fromUnitIdx = content.fromUnitIdx !== undefined ? content.fromUnitIdx : 0;
    const toUnitIdx = content.toUnitIdx !== undefined ? content.toUnitIdx : 1;

    // 변환 로직 함수
    const convert = (val: number, fromIdx: number, toIdx: number, cat: string) => {
        if (cat === 'temperature') {
            // 온도는 단순 비율이 아니라 공식이 다름
            const fromLabel = currentUnits[fromIdx].label;
            const toLabel = currentUnits[toIdx].label;
            let celsius = val;

            // 1. 섭씨로 변환
            if (fromLabel.includes('°F')) celsius = (val - 32) * 5 / 9;
            else if (fromLabel.includes('K')) celsius = val - 273.15;

            // 2. 목표 단위로 변환
            if (toLabel.includes('°F')) return (celsius * 9 / 5) + 32;
            if (toLabel.includes('K')) return celsius + 273.15;
            return celsius;
        } else {
            // 나머지는 (기준 단위로 변환) -> (목표 단위로 변환)
            // 예: 100cm -> 1m -> 0.001km
            const baseValue = val * currentUnits[fromIdx].ratio;
            return baseValue / currentUnits[toIdx].ratio;
        }
    };

    const result = convert(Number(value), fromUnitIdx, toUnitIdx, category);

    // 업데이트 헬퍼
    const update = (key: string, val: any) => {
        if (onUpdateBlock) {
            onUpdateBlock(id, { content: { ...content, [key]: val } });
        }
    };

    return (
        <div
            style={{
                backgroundColor: styles.bgColor || '#ffffff',
                color: styles.color || '#1f2937'
            }}
            className="p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3"
        >
            {/* 제목 */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{content.title || '단위 변환기'}</span>
                {/* 카테고리 뱃지 */}
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase">
                    {category}
                </span>
            </div>

            {/* 입력 영역 */}
            <div className="flex items-center gap-2">
                <div className="flex-1">
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => update('value', Number(e.target.value))}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-lg font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800"
                    />
                    <select
                        value={fromUnitIdx}
                        onChange={(e) => update('fromUnitIdx', Number(e.target.value))}
                        className="w-full mt-1 text-xs p-1 bg-transparent text-gray-500 outline-none cursor-pointer hover:text-indigo-600"
                    >
                        {currentUnits.map((u: any, i: number) => (
                            <option key={i} value={i}>{u.label}</option>
                        ))}
                    </select>
                </div>

                <div className="text-gray-400">
                    <ArrowLeftRight size={20} />
                </div>

                <div className="flex-1">
                    <div className="w-full p-2 bg-indigo-50 border border-indigo-100 rounded text-lg font-bold text-indigo-700 truncate">
                        {Number.isInteger(result) ? result : result.toFixed(4).replace(/\.?0+$/, '')}
                    </div>
                    <select
                        value={toUnitIdx}
                        onChange={(e) => update('toUnitIdx', Number(e.target.value))}
                        className="w-full mt-1 text-xs p-1 bg-transparent text-gray-500 outline-none cursor-pointer hover:text-indigo-600"
                    >
                        {currentUnits.map((u: any, i: number) => (
                            <option key={i} value={i}>{u.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default UnitConverterWidget;