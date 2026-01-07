import React, { useState, useEffect } from 'react';
import type { RoomCycle } from '../roomCycleApi';
import { Lock, Sun, Cloud, CloudRain, Snowflake, Check, Clock } from 'lucide-react';

interface Props {
    cycle: RoomCycle;
    onPassTurn: (content: string) => Promise<void>;
}

const ExchangeDiaryView: React.FC<Props> = ({ cycle, onPassTurn }) => {
    const [feeling, setFeeling] = useState('HAPPY');
    const [weather, setWeather] = useState('SUNNY');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Timer Logic
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        if (!cycle.nextTurnTime) return;
        const target = new Date(cycle.nextTurnTime).getTime();

        const tick = () => {
            const now = new Date().getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft("00:00:00");
                return;
            }

            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        };

        const timer = setInterval(tick, 1000);
        tick();
        return () => clearInterval(timer);
    }, [cycle.nextTurnTime]);

    const handleSubmit = async () => {
        if (!content.trim()) return alert("일기 내용을 입력해주세요.");
        if (!confirm("일기를 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.")) return;

        setIsSubmitting(true);
        try {
            const payload = JSON.stringify({
                date: new Date().toISOString().split('T')[0],
                feeling,
                weather,
                text: content
            });
            await onPassTurn(payload);
        } catch (e) {
            console.error(e);
            alert("제출 실패");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Helper Components ---
    const WeatherIcon = ({ type, selected, onClick }: any) => {
        const icons = { SUNNY: Sun, CLOUDY: Cloud, RAINY: CloudRain, SNOWY: Snowflake };
        const Icon = icons[type as keyof typeof icons] || Sun;
        return (
            <button
                onClick={onClick}
                className={`p-2 rounded-full transition-all ${selected ? 'bg-orange-100 text-orange-500 ring-2 ring-orange-200' : 'text-gray-400 hover:bg-gray-100'}`}
            >
                <Icon size={20} />
            </button>
        );
    };

    // --- RENDER ---
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            {/* Header / Timer */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold font-serif text-[var(--text-primary)]">{cycle.title}</h2>
                    <p className="text-sm text-[var(--text-secondary)] font-serif italic">Shared Exchange Diary</p>
                </div>
                {cycle.status === 'IN_PROGRESS' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full font-mono text-sm font-bold text-[var(--text-secondary)]">
                        <Clock size={16} />
                        {timeLeft || "--:--:--"}
                    </div>
                )}
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] bg-[#fdfbf7] p-8 rounded-xl shadow-lg border border-[#e5e0d8]">
                {cycle.members?.map((member) => {
                    const memberOrder = member.order ?? member.turnOrder;
                    const isMe = memberOrder === cycle.myTurnOrder;
                    const isCurrent = memberOrder === cycle.currentTurnOrder;
                    // Removed unused isPast

                    // State Logic
                    // 1. Completed & Public (Cycle Finished) -> Show Content
                    if (cycle.status === 'COMPLETED') {
                        return (
                            <div key={member.id} className="aspect-[4/3] border-b-2 border-r-2 border-gray-100 bg-white p-4 shadow-sm rotate-1">
                                {/* Render Completed Content */}
                                <div className="h-full flex flex-col">
                                    <div className="border-b pb-2 mb-2 flex justify-between text-xs text-gray-500 font-serif">
                                        <span>{member.nickname}</span>
                                    </div>
                                    <div className="flex-1 font-serif text-sm leading-loose">
                                        일기 내용이 여기에 표시됩니다 (백엔드 구현 대기 중)
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // 2. My Turn (Active Input)
                    if (isCurrent && cycle.isMyTurn && isMe) { // Redundant check isMe if isMyTurn is mostly sufficient
                        return (
                            <div key={member.id} className="aspect-[4/3] bg-white shadow-xl ring-4 ring-indigo-100 rounded-lg p-5 flex flex-col relative z-10 scale-105 transition-transform">
                                <div className="flex justify-between items-center mb-4 border-b pb-2">
                                    <span className="font-bold text-sm text-indigo-900">{member.nickname}'s Turn</span>
                                    <div className="flex gap-1 items-center">
                                        {/* Feeling Selector */}
                                        <select
                                            value={feeling}
                                            onChange={(e) => setFeeling(e.target.value)}
                                            className="text-xs border rounded p-1 mr-2 outline-none"
                                        >
                                            <option value="HAPPY">😄 Happy</option>
                                            <option value="SAD">😢 Sad</option>
                                            <option value="ANGRY">😡 Angry</option>
                                            <option value="TIRED">😴 Tired</option>
                                        </select>

                                        {['SUNNY', 'CLOUDY', 'RAINY', 'SNOWY'].map(w => (
                                            <WeatherIcon key={w} type={w} selected={weather === w} onClick={() => setWeather(w)} />
                                        ))}
                                    </div>
                                </div>

                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="오늘의 하루는 어땠나요?"
                                    className="flex-1 resize-none outline-none text-sm leading-loose font-serif bg-transparent placeholder:text-gray-300"
                                    autoFocus
                                />

                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 transition"
                                >
                                    {isSubmitting ? '저장 중...' : '일기장 덮기 (제출)'}
                                </button>
                            </div>
                        );
                    }

                    // 3. Locked / Future / Other's Turn
                    return (
                        <div key={member.id} className="aspect-[4/3] border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center bg-gray-50/50 opacity-70">
                            {isCurrent ? (
                                <div className="text-center animate-pulse">
                                    <span className="text-2xl mb-2 block">✍️</span>
                                    <p className="text-xs font-bold text-gray-400">{member.nickname}님이 작성 중...</p>
                                </div>
                            ) : member.isCompleted ? (
                                <div className="text-center">
                                    <Check className="mx-auto text-green-400 mb-2" />
                                    <p className="text-xs font-bold text-gray-400">작성 완료 (비밀)</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Lock className="mx-auto text-gray-300 mb-2" size={16} />
                                    <p className="text-xs text-gray-300">{(member.order ?? member.turnOrder)}번째 순서</p>
                                    <p className="text-xs font-bold text-gray-400">{member.nickname}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ExchangeDiaryView;
