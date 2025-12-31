import React, { useEffect, useState, useMemo } from 'react';
import { fetchPostsFromApi } from '../../../../../../pages/post/api.ts'; // 제공해주신 api.ts 경로 확인 필요
interface HeatmapProps {
    viewMode: 'year' | 'month' | 'week'; // 보기 모드
    themeColor: string; // 잔디 색상
}

interface Contribution {
    date: string;
    count: number;
    level: number; // 0~4단계
}

const HeatmapWidget: React.FC<HeatmapProps> = ({ viewMode, themeColor }) => {
    const [contributions, setContributions] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    // 1️⃣ 데이터 가져오기 및 가공
    useEffect(() => {
        const loadData = async () => {
            try {
                // API 호출 (제공해주신 함수 사용)
                const posts = await fetchPostsFromApi();

                // 날짜별 카운팅 (YYYY-MM-DD 형식으로 변환)
                const counts: Record<string, number> = {};
                posts.forEach((post: any) => {
                    // post.createdAt 또는 post.created_at 필드 사용 가정
                    const dateStr = post.createdAt || post.created_at || post.date;
                    if (dateStr) {
                        const dateKey = new Date(dateStr).toISOString().split('T')[0];
                        counts[dateKey] = (counts[dateKey] || 0) + 1;
                    }
                });
                setContributions(counts);
            } catch (error) {
                console.error("잔디 데이터 로드 실패:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // 2️⃣ 날짜 그리드 생성 (오늘 기준 과거 N일)
    const gridData = useMemo(() => {
        const daysToProcess = viewMode === 'year' ? 365 : viewMode === 'month' ? 30 : 7;
        const today = new Date();
        const data: Contribution[] = [];

        // GitHub 스타일은 보통 '주(Week)' 단위인 세로 컬럼으로 렌더링하지만,
        // 반응형 구현을 쉽게 하기 위해 여기서는 날짜 배열을 만들고 CSS Grid로 배치합니다.

        // 과거 날짜부터 오늘까지 순회
        for (let i = daysToProcess - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateKey = d.toISOString().split('T')[0];
            const count = contributions[dateKey] || 0;

            // 활동 레벨 계산 (0: 없음, 1~4: 활성도)
            let level = 0;
            if (count >= 1) level = 1;
            if (count >= 3) level = 2;
            if (count >= 5) level = 3;
            if (count >= 7) level = 4;

            data.push({ date: dateKey, count, level });
        }
        return data;
    }, [contributions, viewMode]);

    // 3️⃣ 색상 유틸리티
    const getLevelColor = (level: number) => {
        if (level === 0) return '#e5e7eb'; // 빈 칸 (회색)
        // themeColor가 '#6366f1' (Indigo) 형식이라고 가정하고 투명도로 조절
        // 실제 구현시에는 themeColor를 파싱하거나 tailwind class를 동적으로 조합해야 함
        // 여기서는 간단히 opacity로 구현
        return level === 1 ? `${themeColor}40` : // 25%
            level === 2 ? `${themeColor}80` : // 50%
                level === 3 ? `${themeColor}BF` : // 75%
                    `${themeColor}`;                  // 100%
    };

    if (loading) return <div className="text-xs text-gray-400 animate-pulse">데이터 로딩 중...</div>;

    // 4️⃣ 렌더링: GitHub 스타일 (가로로 긴 주 단위 배치)
    // 7개씩 끊어서 컬럼(주)을 만듦
    const weeks: Contribution[][] = [];
    let currentWeek: Contribution[] = [];

    // year 모드일 때 요일 맞추기 로직이 복잡하므로,
    // 여기서는 단순화하여 데이터 순서대로 7개씩 끊어서 렌더링합니다.
    gridData.forEach((day, idx) => {
        currentWeek.push(day);
        if (currentWeek.length === 7 || idx === gridData.length - 1) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    return (
        <div className="flex flex-col gap-2 w-full h-full overflow-hidden">
            <div className="flex items-end gap-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-200">
                {weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1">
                        {week.map((day) => (
                            <div
                                key={day.date}
                                className="w-2.5 h-2.5 rounded-[2px] transition-all hover:ring-1 hover:ring-gray-400 relative group"
                                style={{ backgroundColor: getLevelColor(day.level) }}
                            >
                                {/* 툴팁 */}
                                {/*<div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                                //    {day.date}: {day.count}개
                                </div>*/}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-400 px-1">
                <span>Less</span>
                <div className="flex gap-0.5">
                    {[0, 1, 2, 3, 4].map(l => (
                        <div key={l} className="w-2 h-2 rounded-[1px]" style={{ backgroundColor: getLevelColor(l) }} />
                    ))}
                </div>
                <span>More</span>
            </div>
        </div>
    );
};

export default HeatmapWidget;