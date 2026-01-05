import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Users } from 'lucide-react';
import type { CustomAlbum } from '../types';

const InviteAcceptPage: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [targetRoom, setTargetRoom] = useState<CustomAlbum | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ✨ Fetch room info from API
    useEffect(() => {
        if (!code) return;

        const loadRoom = async () => {
            setIsLoading(true);
            try {
                // Determine if we can fetch the album.
                // Note: If the backend requires membership to fetch details, this might fail for new users.
                // However, usually 'invite code' implies some public access or we assume fetchAlbumApi handles it.
                // Since this is 'InviteAccept', strictly speaking, we might not be able to see details until we join.
                // But without a 'Join' API, we will attempt to fetch. 
                const api = await import('../api');
                const album = await api.fetchAlbumApi(code);

                if (album) {
                    setTargetRoom(album);
                } else {
                    setError("유효하지 않은 모임이거나 접근할 수 없습니다.");
                }
            } catch (e) {
                setError("오류가 발생했습니다.");
            } finally {
                setIsLoading(false);
            }
        };
        loadRoom();
    }, [code]);

    const handleJoin = async () => {
        if (!targetRoom) return;

        // ✨ Validate Password Client-Side (if roomConfig is visible) 
        // OR try to access contents to verify.
        // Since we don't have a 'join' endpoint, we simulate success if password matches config.
        if (targetRoom.roomConfig?.password && targetRoom.roomConfig.password !== password) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        // Just redirect. If backend supports 'access on view', this works.
        // If it needs explicit join, we are limited by backend constraints but complying with 'no local storage'.
        navigate('/post#album/' + targetRoom.id);
    };



    if (!code) return <div>Invalid Link</div>;
    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-4" style={{ fontFamily: 'var(--font-family)' }}>
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-[var(--border-color)]">
                {/* Header */}
                <div className="px-6 py-8 flex flex-col items-center text-center border-b border-[var(--border-color)] bg-[var(--bg-card-secondary)]">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 shadow-inner">
                        <Users size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                        {targetRoom ? "모임에 초대되었습니다" : "모임을 찾을 수 없습니다"}
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm px-4">
                        {targetRoom?.name || ""}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {targetRoom ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                                    비밀번호
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError(null);
                                        }}
                                        placeholder={targetRoom.roomConfig?.password ? "모임 비밀번호를 입력하세요" : "비밀번호 없음"}
                                        className="w-full bg-[var(--bg-card-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10"
                                        style={{ fontFamily: 'inherit' }}
                                    />
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                                </div>
                                {error && <p className="text-red-500 text-xs mt-2 pl-1">{error}</p>}
                            </div>

                            <button
                                onClick={handleJoin}
                                className="w-full py-3 bg-[var(--btn-bg)] hover:bg-[var(--btn-hover)] text-[var(--btn-text)] font-bold rounded-xl transition-colors shadow-lg"
                            >
                                입장하기
                            </button>
                        </div>
                    ) : (
                        <div className="text-center text-red-500">
                            {error || "모임 정보를 불러올 수 없습니다."}
                        </div>
                    )}

                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-bold flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={16} /> 메인으로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteAcceptPage;
