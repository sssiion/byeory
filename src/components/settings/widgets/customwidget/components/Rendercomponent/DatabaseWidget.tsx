import { useMemo } from "react";
import { Database, Calculator } from "lucide-react";
import type { WidgetBlock } from "../../types";

interface Props {
    block: WidgetBlock;
    onUpdateBlock?: (id: string, updates: any) => void;
}

export default function DatabaseWidget({ block, onUpdateBlock: _onUpdateBlock }: Props) {
    const { content, styles } = block;
    const headers = content.headers || ['항목', '금액'];
    const rows = content.rows || [];
    const showTotal = content.showTotal === true; // 자동 계산 활성화 여부

    // 🌟 자동 계산 로직 (메모이제이션)
    const totalMap = useMemo(() => {
        if (!showTotal) return {};

        const totals: { [key: number]: number } = {};

        rows.forEach((row: string[]) => {
            row.forEach((cell, index) => {
                // 통화 기호, 콤마 등 제거 후 숫자로 변환
                const cleanVal = String(cell).replace(/[^0-9.-]/g, '');
                const num = parseFloat(cleanVal);

                if (!isNaN(num)) {
                    totals[index] = (totals[index] || 0) + num;
                }
            });
        });
        return totals;
    }, [rows, showTotal]);

    // 금액 포맷팅 헬퍼
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('ko-KR').format(val);
    };

    return (
        <div className="w-full h-full bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            {/* 상단 제목 바 */}
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Database size={14} className="text-gray-500" />
                    <span
                        className="text-xs font-bold text-gray-600 truncate"
                        style={{ color: styles.color }}
                    >
                        {content.title || '데이터베이스'}
                    </span>
                </div>
                {showTotal && (
                    <div className="flex items-center gap-1 text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        <Calculator size={10} />
                        <span>자동 계산 ON</span>
                    </div>
                )}
            </div>

            {/* 테이블 본문 (min-w-max 추가로 구겨짐 방지) */}
            <div className="flex-1 overflow-auto scrollbar-thin">
                <table className="w-full min-w-max text-sm text-left border-collapse">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 sticky top-0 z-10">
                        <tr>
                            {headers.map((h: string, i: number) => (
                                <th key={i} className="px-4 py-2 font-medium border-b border-gray-100 whitespace-nowrap bg-gray-50/50">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row: string[], i: number) => (
                            <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                {row.map((cell: string, j: number) => (
                                    <td key={j} className="px-4 py-2 text-gray-700 whitespace-nowrap">
                                        {/* 간단한 태그 감지 및 스타일링 (예: '완료', '대기' 등) */}
                                        {['완료', 'Success'].includes(cell) ? (
                                            <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold">{cell}</span>
                                        ) : ['진행중', 'Processing'].includes(cell) ? (
                                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold">{cell}</span>
                                        ) : ['대기', 'Pending'].includes(cell) ? (
                                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">{cell}</span>
                                        ) : ['취소', '식비', '지출'].includes(cell) ? ( // 식비 등은 마이너스 느낌
                                            cell // 그냥 텍스트
                                        ) : (
                                            cell
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>

                    {/* 🌟 합계 푸터 (옵션) */}
                    {showTotal && (
                        <tfoot className="bg-indigo-50/30 font-bold text-gray-800 sticky bottom-0 z-10 border-t border-indigo-100">
                            <tr>
                                {headers.map((_: any, i: number) => (
                                    <td key={i} className="px-4 py-2 whitespace-nowrap text-indigo-900">
                                        {i === 0 ? "합계" : (
                                            totalMap[i] !== undefined
                                                ? formatCurrency(totalMap[i])
                                                : "-"
                                        )}
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {/* 데이터 없을 때 */}
            {rows.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-400">데이터가 없습니다.</div>
            )}
        </div>
    );
}
