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
    const [isAlreadyMember, setIsAlreadyMember] = useState(false);

    // ✨ Simulate fetching room info
    useEffect(() => {
        if (!code) return;

        // 1. Check if already a member (Mock: Check all albums)
        // Since we are mocking, we technically can't "fetch" a room we don't have unless we simulate a shared DB.
        // But for the user who CREATED it, they have it.
        // For a GUEST, they wouldn't have it in LocalStorage yet.

        // Scenario A: Owner / Existing Member clicked link
        const savedAlbums = localStorage.getItem('my_custom_albums_v2');
        let myAlbums: CustomAlbum[] = savedAlbums ? JSON.parse(savedAlbums) : [];

        const existing = myAlbums.find(a => a.id === code);

        if (existing) {
            setTargetRoom(existing);
            setIsAlreadyMember(true);
        } else {
            // Scenario B: Guest (New User)
            setTargetRoom({
                id: code,
                name: "초대받은 모임", // Fallback name since we can't fetch real one
                type: 'room',
                roomConfig: {
                    description: "초대받은 모임입니다.",
                    password: "required" // Require generic password
                },
                createdAt: Date.now(),
                isFavorite: false,
                tag: null,
                parentId: null
            });
        }
    }, [code]);

    const handleJoin = () => {
        if (!targetRoom) return;

        // ✨ Validate Password (Mock)
        if (targetRoom.roomConfig?.password && !password.trim()) {
            setError("비밀번호를 입력해주세요.");
            return;
        }

        // ✨ Add to My Albums
        const savedAlbums = localStorage.getItem('my_custom_albums_v2');
        let myAlbums: CustomAlbum[] = savedAlbums ? JSON.parse(savedAlbums) : [];

        // Prevent dupes (should check ID)
        if (!myAlbums.find(a => a.id === targetRoom.id)) {
            myAlbums.push({
                ...targetRoom,
                name: targetRoom.name === "초대받은 모임" ? `모임 (${code?.substring(0, 4)})` : targetRoom.name, // Give unique name
                createdAt: Date.now()
            });
            localStorage.setItem('my_custom_albums_v2', JSON.stringify(myAlbums));
        }

        // Redirect
        navigate('/post#album/' + targetRoom.id);
    };

    const handleGoToRoom = () => {
        if (code) navigate('/post#album/' + code);
        else navigate('/post');
    };

    if (!code) return <div>Invalid Link</div>;

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-4" style={{ fontFamily: 'var(--font-family)' }}>
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-[var(--border-color)]">
                {/* Header */}
                <div className="px-6 py-8 flex flex-col items-center text-center border-b border-[var(--border-color)] bg-[var(--bg-card-secondary)]">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 shadow-inner">
                        <Users size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                        {isAlreadyMember ? "이미 참여 중인 모임입니다" : "모임에 초대되었습니다"}
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm px-4">
                        {targetRoom?.name || "알 수 없는 모임"}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {isAlreadyMember ? (
                        <div className="space-y-4">
                            <p className="text-center text-[var(--text-secondary)] text-sm">
                                이미 이 모임의 멤버입니다. <br />
                                바로 모임으로 이동하시겠습니까?
                            </p>
                            <button
                                onClick={handleGoToRoom}
                                className="w-full py-3 bg-[var(--btn-bg)] hover:bg-[var(--btn-hover)] text-[var(--btn-text)] font-bold rounded-xl transition-colors shadow-lg"
                            >
                                모임으로 이동
                            </button>
                        </div>
                    ) : (
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
                                        placeholder="모임 비밀번호를 입력하세요"
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
                                참여하기
                            </button>
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
