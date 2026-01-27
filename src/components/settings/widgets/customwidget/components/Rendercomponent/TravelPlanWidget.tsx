
import { Calendar, DollarSign, MapPin, Plus, Trash2, Check, ChevronDown } from 'lucide-react';
import type { WidgetBlock } from '../../types';

interface Props {
    block: WidgetBlock;
    onUpdateBlock: (id: string, updates: any) => void;
}

type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox';

interface ColumnDef {
    id: string;
    name: string;
    type: ColumnType;
    options?: string[]; // for select type
    width?: number;
}

export default function TravelPlanWidget({ block, onUpdateBlock }: Props) {
    const { content } = block;

    // Migrate old data structure if necessary
    const rawData = content.travelData || {};
    const defaultColumns: ColumnDef[] = [
        { id: 'c1', name: '일자', type: 'date', width: 100 },
        { id: 'c2', name: '시간', type: 'text', width: 80 },
        { id: 'c3', name: '활동', type: 'text', width: 150 },
        { id: 'c4', name: '분류', type: 'select', options: ['식사', '이동', '관광', '숙소', '기타'], width: 100 },
        { id: 'c5', name: '완료', type: 'checkbox', width: 50 },
        { id: 'c6', name: '비용', type: 'number', width: 100 },
    ];

    // Initialize State with proper typing
    const data = {
        title: rawData.title || '',
        startDate: rawData.startDate || '',
        endDate: rawData.endDate || '',
        currency: rawData.currency || 'KRW',
        // Convert old string headers to ColumnDefs if needed, or use default
        columns: (rawData.columns || rawData.headers?.map((h: string, i: number) => ({
            id: `c-${i}`,
            name: h,
            type: h.includes('Cost') || h.includes('비용') ? 'number' : 'text'
        }))) as ColumnDef[] || defaultColumns,
        rows: (rawData.rows as any[]) || []
    };

    const updateData = (newData: any) => {
        onUpdateBlock(block.id, { content: { ...content, travelData: newData } });
    };

    // Calculate Total Cost dynamically based on 'number' type columns that look like cost
    const totalCost = data.rows.reduce((sum: number, row: any) => {
        let rowSum = 0;
        data.columns.forEach((col, idx) => {
            if (col.type === 'number' && (col.name.includes('비용') || col.name.includes('Cost') || col.name.includes('Price'))) {
                const val = parseFloat(row[idx] || '0');
                if (!isNaN(val)) rowSum += val;
            }
        });
        return sum + rowSum;
    }, 0);

    // Helper to render cell content based on type
    const renderCell = (col: ColumnDef, val: any, rIdx: number, cIdx: number) => {
        const updateVal = (v: any) => {
            const newRows = [...data.rows];
            if (!newRows[rIdx]) newRows[rIdx] = [];  // Ensure row exists
            newRows[rIdx][cIdx] = v;
            updateData({ ...data, rows: newRows });
        };

        if (col.type === 'checkbox') {
            return (
                <div className="flex justify-center cursor-pointer" onClick={() => updateVal(!val)}>
                    {val ? <div className="bg-indigo-500 text-white rounded p-0.5"><Check size={12} /></div> : <div className="w-4 h-4 border border-gray-300 rounded hover:border-indigo-400" />}
                </div>
            );
        }

        if (col.type === 'select') {
            return (
                <div className="relative group/select w-full h-full">
                    <select
                        value={val || ''}
                        onChange={(e) => updateVal(e.target.value)}
                        className="w-full h-full bg-transparent appearance-none outline-none cursor-pointer text-xs"
                    >
                        <option value="" disabled>-</option>
                        {col.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    {!val && <span className="absolute inset-0 pointer-events-none text-gray-300 flex items-center">선택</span>}
                </div>
            );
        }

        if (col.type === 'date') {
            return (
                <input
                    type="date"
                    value={val || ''}
                    onChange={(e) => updateVal(e.target.value)}
                    className="w-full bg-transparent outline-none text-xs text-gray-600 font-mono"
                />
            );
        }

        if (col.type === 'number') {
            return (
                <input
                    type="number"
                    value={val || ''}
                    onChange={(e) => updateVal(e.target.value)}
                    placeholder="0"
                    className="w-full bg-transparent outline-none text-right font-mono text-xs"
                />
            );
        }

        // Default Text
        return (
            <input
                type="text"
                value={val || ''}
                onChange={(e) => updateVal(e.target.value)}
                className="w-full bg-transparent outline-none text-xs"
                placeholder="..."
            />
        );
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden border border-indigo-100">
            {/* 1. Trip Header */}
            <div className="bg-indigo-600 p-3 text-white flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-indigo-200" />
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => updateData({ ...data, title: e.target.value })}
                        placeholder="여행지 (예: 제주도)"
                        className="bg-transparent border-b border-indigo-400 font-bold placeholder:text-indigo-300 outline-none w-full text-white text-sm"
                    />
                </div>
                <div className="flex items-center gap-2 text-indigo-100 text-[10px]">
                    <Calendar size={12} />
                    <input
                        type="date"
                        value={data.startDate}
                        onChange={(e) => updateData({ ...data, startDate: e.target.value })}
                        className="bg-transparent outline-none cursor-pointer hover:text-white"
                    />
                    <span>-</span>
                    <input
                        type="date"
                        value={data.endDate}
                        onChange={(e) => updateData({ ...data, endDate: e.target.value })}
                        className="bg-transparent outline-none cursor-pointer hover:text-white"
                    />
                </div>
            </div>

            {/* 2. Total Budget */}
            <div className="bg-indigo-50 px-3 py-2 flex justify-between items-center border-b border-indigo-100 shrink-0">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">총 예상 비용</span>
                <div className="text-sm font-bold text-indigo-700 flex items-center gap-1">
                    <DollarSign size={12} />
                    {totalCost.toLocaleString()} <span className="text-[10px] text-indigo-400">{data.currency}</span>
                </div>
            </div>

            {/* 3. Data Table (Notion Style) */}
            <div className="flex-1 overflow-auto bg-white relative scrollbar-thin">
                <table className="w-full text-xs text-left border-collapse table-fixed" style={{ minWidth: '100%' }}>
                    <thead className="bg-gray-50 sticky top-0 z-10 text-gray-500 font-medium">
                        <tr>
                            {data.columns.map((col, i) => (
                                <th key={col.id || i} className="p-2 border-b border-r border-gray-200 last:border-r-0 whitespace-nowrap bg-gray-50 text-[10px]" style={{ width: col.width || 100 }}>
                                    <div className="flex items-center gap-1">
                                        {/* Icon based on type */}
                                        {col.type === 'date' && <Calendar size={10} />}
                                        {col.type === 'number' && <DollarSign size={10} />}
                                        {col.type === 'checkbox' && <Check size={10} />}
                                        {col.type === 'select' && <ChevronDown size={10} />}
                                        <input
                                            value={col.name}
                                            onChange={(e) => {
                                                const newCols = [...data.columns];
                                                newCols[i] = { ...newCols[i], name: e.target.value };
                                                updateData({ ...data, columns: newCols });
                                            }}
                                            className="bg-transparent outline-none w-full font-bold text-gray-600 truncate"
                                        />
                                    </div>
                                </th>
                            ))}
                            <th className="w-8 border-b border-gray-200 bg-gray-50 sticky right-0"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((row: any[], rIdx: number) => (
                            <tr key={rIdx} className="group hover:bg-indigo-50/20 border-b border-gray-100 last:border-0">
                                {data.columns.map((col, cIdx) => (
                                    <td key={`${rIdx}-${cIdx}`} className="p-1 border-r border-gray-100 last:border-r-0 relative">
                                        {renderCell(col, row[cIdx], rIdx, cIdx)}
                                    </td>
                                ))}
                                <td className="text-center p-1 sticky right-0 bg-white group-hover:bg-indigo-50/20">
                                    <button
                                        onClick={() => {
                                            const newRows = data.rows.filter((_: any, i: number) => i !== rIdx);
                                            updateData({ ...data, rows: newRows });
                                        }}
                                        className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-indigo-100 bg-gray-50 shrink-0">
                <button
                    onClick={() => {
                        const newRow = new Array(data.columns.length).fill('');
                        updateData({ ...data, rows: [...data.rows, newRow] });
                    }}
                    className="w-full py-1.5 bg-white border border-indigo-200 text-indigo-600 rounded text-xs font-bold hover:bg-indigo-50 shadow-sm transition-all flex items-center justify-center gap-1"
                >
                    <Plus size={12} /> 항목 추가
                </button>
            </div>
        </div>
    );
}
