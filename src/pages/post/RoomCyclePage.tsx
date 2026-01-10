import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCycleDetailApi, passTurnApi, saveCycleContentApi, type RoomCycle } from '../../components/post/api/roomCycle';
import RollingPaperView from '../../components/post/components/RollingPaperView';
import ExchangeDiaryView from '../../components/post/components/ExchangeDiaryView';
import { ArrowLeft, Loader } from 'lucide-react';
import Navigation from '../../components/header/Navigation';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const RoomCyclePage: React.FC = () => {
    const { cycleId } = useParams<{ cycleId: string }>();
    const navigate = useNavigate();

    const [cycle, setCycle] = useState<RoomCycle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type?: 'info' | 'danger' | 'success';
        singleButton?: boolean;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const showModal = (title: string, message: string, type: 'info' | 'danger' | 'success' = 'info', onConfirm?: () => void) => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            type,
            singleButton: true,
            onConfirm: onConfirm || closeConfirmModal
        });
    };

    const loadCycle = async () => {
        if (!cycleId) return;
        setIsLoading(true);
        try {
            const data = await fetchCycleDetailApi(cycleId);

            try {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const myEmail = payload.sub || payload.email;

                    if (myEmail && data.members) {
                        const currentMember = data.members.find(m => (m.order ?? m.turnOrder) === data.currentTurnOrder);
                        if (currentMember && currentMember.email === myEmail) {
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
            if (content) {
                await saveCycleContentApi(cycleId, typeof content === 'string' ? JSON.parse(content) : content);
            }

            const updatedCycle = await passTurnApi(cycleId);
            setCycle(updatedCycle);
            showModal("작성 완료", "작성이 완료되었습니다!", 'success');
        } catch (e) {
            console.error(e);
            showModal("오류", "제출 중 오류가 발생했습니다.", 'danger');
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
            <Navigation />
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

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                singleButton={confirmModal.singleButton}
                onConfirm={() => {
                    confirmModal.onConfirm();
                    if (confirmModal.singleButton) closeConfirmModal();
                }}
                onCancel={closeConfirmModal}
            />
        </div>
    );
};

export default RoomCyclePage;
