import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Users, Lock, ArrowRight, Loader } from 'lucide-react';
import { joinRoomApi } from '../api';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

const RoomJoinPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [password, setPassword] = useState('');

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

    // ✨ Check for Token on Mount
    React.useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            showModal("알림", "로그인이 필요한 서비스입니다.", 'danger', () => {
                navigate('/login', { state: { from: location } });
            });
        }
    }, [navigate, location]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleJoin = async () => {
        if (!roomId) return;

        // ✨ Check for Token first
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError("로그인 후 다시 이용해주세요.");
            // Optionally redirect to login after a delay or show a login button
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await joinRoomApi(roomId, password);
            showModal("입장 완료", "모임에 입장했습니다!", 'success', () => navigate('/post'));
        } catch (err: any) {
            // ✨ Check if error is related to Auth (401/403 often come as failures)
            // Or just use the user's requested message if it seems like a generic failure
            if (err.message === "모임방 입장에 실패했습니다.") {
                setError("로그인 후 다시 이용해주세요."); // As requested fall-back or specific override
            } else {
                setError(err.message || "입장에 실패했습니다. 비밀번호를 확인해주세요.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleJoin();
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
            <div className="bg-[var(--bg-card)] max-w-md w-full rounded-2xl shadow-xl border border-[var(--border-color)] p-8 animate-scale-up">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">모임 입장하기</h1>
                    <p className="text-[var(--text-secondary)]">
                        초대받은 모임에 입장하려면 비밀번호를 입력하세요.<br />
                        <span className="text-xs text-[var(--text-tertiary)]">(비밀번호가 없는 경우 바로 입장 가능)</span>
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 flex items-center gap-1">
                            <Lock size={14} /> 비밀번호
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="비밀번호 입력"
                            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-secondary)] text-[var(--text-primary)] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                        />
                    </div>
                    {error && (
                        <div className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleJoin}
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader className="animate-spin" size={20} /> : <>입장하기 <ArrowRight size={20} /></>}
                    </button>

                    <button
                        onClick={() => navigate('/home')}
                        className="w-full py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                        취소하고 홈으로 돌아가기
                    </button>
                </div>
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

export default RoomJoinPage;
