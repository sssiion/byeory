import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCycleDetailApi, passTurnApi, saveCycleContentApi, type RoomCycle } from '../roomCycleApi';
import RollingPaperView from '../components/RollingPaperView';
import ExchangeDiaryView from '../components/ExchangeDiaryView';
import { ArrowLeft, Loader } from 'lucide-react';

const RoomCyclePage: React.FC = () => {
    const { cycleId } = useParams<{ cycleId: string }>();
    const navigate = useNavigate();

    const [cycle, setCycle] = useState<RoomCycle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCycle = async () => {
        if (!cycleId) return;
        setIsLoading(true);
        try {
            const data = await fetchCycleDetailApi(cycleId);

            // Client-side verification for isMyTurn
            // Sometimes backend might return false, so we double check with JWT email
            try {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const myEmail = payload.sub || payload.email; // 'sub' is standard, checking both just in case

                    if (myEmail && data.members) {
                        const currentMember = data.members.find(m => (m.order ?? m.turnOrder) === data.currentTurnOrder);
                        if (currentMember && currentMember.email === myEmail) {
                            // Client-side override applied
                            data.isMyTurn = true;
                        }
                    }
                }
            } catch (jsonError) {
                console.warn("Failed to parse token for turn verification", jsonError);
            }

            setCycle(data);
        } catch (e) {
            console.error(e);
            setError("활동을 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCycle();
    }, [cycleId]);

    const handlePassTurn = async (content?: string) => {
        if (!cycleId) return;
        try {
            // If content is provided (e.g. from Exchange Diary), save it first
            if (content) {
                // For Exchange Diary, we store it as raw content for now or structured JSON
                // The API expects 'data: any'
                await saveCycleContentApi(cycleId, typeof content === 'string' ? JSON.parse(content) : content);
            }

            const updatedCycle = await passTurnApi(cycleId);
            setCycle(updatedCycle);
            alert("작성이 완료되었습니다!");
        } catch (e) {
            console.error(e);
            alert("제출 중 오류가 발생했습니다.");
        }
    };

    const handleBack = () => {
        if (cycle?.roomId) {
            navigate(`/post?albumId=room-${cycle.roomId}`);
        } else {
            navigate(-1);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
                <Loader className="animate-spin text-indigo-500" size={40} />
            </div>
        );
    }

    if (error || !cycle) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-main)] gap-4">
                <p className="text-red-500 font-bold">{error || "존재하지 않는 활동입니다."}</p>
                <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-200 rounded-lg font-bold">돌아가기</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-main)] flex flex-col">
            {/* Nav (Only visible if not in full-screen editor mode which might want to hide it, but for now safe to show) */}
            <div className="p-4 flex items-center gap-4">
                <button onClick={handleBack} className="p-2 hover:bg-[var(--bg-card-secondary)] rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-[var(--text-primary)]" />
                </button>
                <h1 className="text-lg font-bold text-[var(--text-primary)]">{cycle.title}</h1>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-600">
                    {cycle.type === 'ROLLING_PAPER' ? '롤링페이퍼' : '교환일기'}
                </span>
            </div>

            {/* Content Body */}
            <div className="flex-1">
                {cycle.type === 'ROLLING_PAPER' ? (
                    <RollingPaperView cycle={cycle} onPassTurn={handlePassTurn} />
                ) : (
                    <ExchangeDiaryView cycle={cycle} onPassTurn={handlePassTurn} />
                )}
            </div>
        </div>
    );
};

export default RoomCyclePage;
