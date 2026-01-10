import React, { useState, useEffect } from 'react';
import { type RoomCycle, fetchCycleContentApi, saveCycleContentApi } from '../roomCycleApi';
import { Lock, Sun, Cloud, CloudRain, Snowflake, Check, Clock, Smile, Frown, Angry, Meh, Save } from 'lucide-react';

interface Props {
    cycle: RoomCycle;
    onPassTurn: (content: string) => Promise<void>;
}

// --- Helper Components ---
const WeatherIcon = ({ type, selected, onClick }: { type: string; selected: boolean; onClick: () => void }) => {
    const icons = { SUNNY: Sun, CLOUDY: Cloud, RAINY: CloudRain, SNOWY: Snowflake } as const;
    const Icon = icons[type as keyof typeof icons] || Sun;
    return (
        <button
            onClick={onClick}
            className={`p-1.5 rounded-full transition-all ${selected ? 'bg-orange-100 text-orange-500 ring-2 ring-orange-200' : 'text-gray-400 hover:bg-gray-100'}`}
        >
            <Icon size={18} />
        </button>
    );
};

const FeelingIcon = ({ type, selected, onClick }: { type: string; selected: boolean; onClick: () => void }) => {
    const icons = { HAPPY: Smile, SAD: Meh, ANGRY: Angry, CRYING: Frown } as const;
    const Icon = icons[type as keyof typeof icons] || Smile;
    return (
        <button
            onClick={onClick}
            className={`p-1.5 rounded-full transition-all ${selected ? 'bg-indigo-100 text-indigo-500 ring-2 ring-indigo-200' : 'text-gray-400 hover:bg-gray-100'}`}
        >
            <Icon size={18} />
        </button>
    );
};

const WeatherIconDisplay = ({ type }: { type: string }) => {
    const icons = { SUNNY: Sun, CLOUDY: Cloud, RAINY: CloudRain, SNOWY: Snowflake } as const;
    const Icon = icons[type as keyof typeof icons] || Sun;
    return <Icon size={16} className="text-gray-400" />;
};

const FeelingIconDisplay = ({ type }: { type: string }) => {
    const icons = { HAPPY: Smile, SAD: Meh, ANGRY: Angry, CRYING: Frown } as const;
    const Icon = icons[type as keyof typeof icons] || Smile;
    return <Icon size={16} className="text-gray-400" />;
};

const ExchangeDiaryView: React.FC<Props> = ({ cycle, onPassTurn }) => {
    const [feeling, setFeeling] = useState('HAPPY');
    const [weather, setWeather] = useState('SUNNY');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [myEmail, setMyEmail] = useState<string | null>(null);

    // Accumulated content from server
    const [sharedContent, setSharedContent] = useState<any>(null);

    // ✨ Dirty State
    const [isDirty, setIsDirty] = useState(false);

    // ✨ Update isDirty on change
    useEffect(() => {
        if (content.length > 0 && !isSubmitting) {
            setIsDirty(true);
        }
    }, [content, feeling, weather]);

    // Date Logic
    const [displayDate, setDisplayDate] = useState('');

    useEffect(() => {
        const now = new Date();
        const yy = String(now.getFullYear()).slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        setDisplayDate(`${yy}-${mm}-${dd} / ${hh}:${min}`);
    }, []);

    // 1. Get identity and Fetch Content
    useEffect(() => {
        const init = async () => {
            // Get Identity
            try {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setMyEmail(payload.sub || payload.email);
                }
            } catch (e) {
                console.warn("Token parse failed", e);
            }

            // Fetch Content if Completed or My Turn
            if (cycle.status === 'COMPLETED' || cycle.isMyTurn) {
                try {
                    const data = await fetchCycleContentApi(cycle.id);
                    if (data) setSharedContent(data);
                } catch (e) {
                    console.error("Failed to load diary content", e);
                }
            }
        };
        init();
    }, [cycle.id, cycle.status, cycle.isMyTurn]);

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
            // Previous blocks + my new block
            const previousBlocks = sharedContent?.blocks || [];
            const payload = JSON.stringify({
                title: cycle.title,
                blocks: [
                    ...previousBlocks,
                    {
                        type: "paragraph",
                        text: content,
                        date: displayDate,
                        feeling,
                        weather
                    }
                ]
            });
            await onPassTurn(payload);
        } catch (e) {
            console.error(e);
            alert("제출 실패");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✨ Temp Save
    const handleTempSave = async () => {
        setIsSubmitting(true);
        try {
            const previousBlocks = sharedContent?.blocks || [];
            const payload = {
                title: cycle.title,
                blocks: [
                    ...previousBlocks,
                    {
                        type: "paragraph",
                        text: content,
                        date: displayDate,
                        feeling,
                        weather
                    }
                ]
            };
            await saveCycleContentApi(cycle.id, payload);
            alert("임시 저장되었습니다.");
            setIsDirty(false); // ✨ Reset Dirty
        } catch (e) {
            console.error(e);
            alert("임시 저장 실패");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✨ Prevent Accidental Refresh
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // --- RENDER ---
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            {/* Header / Timer */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold font-serif text-[var(--text-primary)]">{cycle.title}</h2>
                    <p className="text-sm text-[var(--text-secondary)] font-serif italic">Shared Exchange Diary</p>
                </div>
                {cycle.status === 'IN_PROGRESS' && cycle.nextTurnTime && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full font-mono text-sm font-bold text-[var(--text-secondary)]">
                        <Clock size={16} />
                        {timeLeft || "--:--:--"}
                    </div>
                )}
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] bg-[#fdfbf7] p-8 rounded-xl shadow-lg border border-[#e5e0d8]">
                {cycle.members?.map((member, index) => {
                    const memberOrder = member.order ?? member.turnOrder;
                    const isCurrent = memberOrder === cycle.currentTurnOrder;

                    // Dual verification: Backend says isMyTurn OR Token Email matches current turn member email
                    const isMeMatchingCurrentTurn = isCurrent && myEmail && member.email === myEmail;
                    const canIWrite = (cycle.isMyTurn && isCurrent && (member.userId === (cycle.myTurnOrder ?? -1) || member.email === myEmail)) || isMeMatchingCurrentTurn;

                    const itemKey = member.userId || member.id || `member-${index}`;

                    // Content for this specific card
                    const memberEntry = sharedContent?.blocks?.[index];

                    // 1. Completed & Public (Cycle Finished) -> Show Content
                    if (cycle.status === 'COMPLETED' || (member.isCompleted && sharedContent)) {
                        return (
                            <div key={itemKey} className="aspect-[4/3] bg-white p-5 border-b-2 border-r-2 border-gray-100 shadow-sm flex flex-col rotate-1 hover:rotate-0 transition-transform cursor-pointer">
                                <div className="border-b pb-2 mb-3 flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-xs text-gray-400 font-serif">
                                        <span className="font-bold text-gray-600">{member.nickname}</span>
                                        <div className="flex gap-2 items-center">
                                            {memberEntry && (
                                                <>
                                                    <FeelingIconDisplay type={memberEntry.feeling} />
                                                    <WeatherIconDisplay type={memberEntry.weather} />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-300 font-mono">{memberEntry?.date || ""}</span>
                                </div>
                                <div className="flex-1 font-serif text-sm leading-loose overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                                    {memberEntry ? memberEntry.text : "작성된 내용이 없습니다."}
                                </div>
                            </div>
                        );
                    }

                    // 2. My Turn (Active Input) - Using Dual Verification
                    if (cycle.status === 'IN_PROGRESS' && canIWrite) {
                        return (
                            <div key={itemKey} className="aspect-[4/3] bg-white shadow-xl ring-4 ring-indigo-100 rounded-lg p-5 flex flex-col relative z-10 scale-105 transition-transform">
                                <div className="flex flex-col border-b pb-3 mb-4 gap-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-sm text-indigo-900 shrink-0">{member.nickname} 님</span>
                                        <div className="flex gap-1">
                                            {['HAPPY', 'SAD', 'ANGRY', 'CRYING'].map(f => (
                                                <FeelingIcon key={f} type={f} selected={feeling === f} onClick={() => setFeeling(f)} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-mono text-gray-400 font-bold">{displayDate}</span>
                                        <div className="flex gap-1 items-center">
                                            {['SUNNY', 'CLOUDY', 'RAINY', 'SNOWY'].map(w => (
                                                <WeatherIcon key={w} type={w} selected={weather === w} onClick={() => setWeather(w)} />
                                            ))}
                                        </div>
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
                                    {isSubmitting ? '저장 중...' : '교환일기 작성완료'}
                                </button>
                                <button
                                    onClick={handleTempSave}
                                    disabled={isSubmitting}
                                    className="mt-2 w-full py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg font-bold text-xs hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                                >
                                    <Save size={14} />
                                    임시 저장
                                </button>
                            </div>
                        );
                    }

                    // 3. Locked / Future / Other's Turn
                    return (
                        <div key={itemKey} className="aspect-[4/3] border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center bg-gray-50/50 opacity-70">
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
