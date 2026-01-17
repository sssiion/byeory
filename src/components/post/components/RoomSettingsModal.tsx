import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Users, Settings, LogOut, Loader } from 'lucide-react';
import type { CustomAlbum } from '../types';
import { fetchRoomMembersApi, kickMemberApi, leaveRoomApi, deleteRoomApi } from '../api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    album: CustomAlbum;
}

const RoomSettingsModal: React.FC<Props> = ({ isOpen, onClose, album }) => {
    const [activeTab, setActiveTab] = useState<'invite' | 'members'>('invite');
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedPw, setCopiedPw] = useState(false);

    // Member Management State
    const [members, setMembers] = useState<any[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState<'OWNER' | 'MEMBER' | null>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null); // To identify "Me" via Email

    useEffect(() => {
        if (isOpen && activeTab === 'members') {
            loadMembers();
        }
    }, [isOpen, activeTab]);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);

                // Prefer 'email' claim, fallback to 'sub' if it looks like an email
                if (payload.email) {
                    setCurrentUserEmail(payload.email);
                } else if (payload.sub && payload.sub.includes('@')) {
                    setCurrentUserEmail(payload.sub);
                }
            } catch (e) {
                // ignore
            }
        }
    }, []);

    const loadMembers = async () => {
        setIsLoadingMembers(true);
        try {
            const list = await fetchRoomMembersApi(album.id);
            setMembers(list);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingMembers(false);
        }
    };

    // Update role whenever members or currentUserEmail changes
    useEffect(() => {
        if (members.length > 0 && currentUserEmail) {
            // Find "me" in the list using Email
            const me = members.find((m: any) => m.email === currentUserEmail);
            if (me) {
                setCurrentUserRole(me.role);
            }
        }
    }, [members, currentUserEmail]);

    const handleKick = async (userId: string) => {
        if (!confirm("정말 이 멤버를 내보내시겠습니까?")) return;
        const success = await kickMemberApi(album.id, userId);
        if (success) {
            alert("멤버를 내보냈습니다.");
            loadMembers(); // Refresh
        } else {
            alert("강퇴 실패");
        }
    };

    const handleLeave = async () => {
        if (!confirm("정말 이 모임에서 나가시겠습니까?")) return;
        const success = await leaveRoomApi(album.id);
        if (success) {
            alert("모임에서 나갔습니다.");
            onClose();
            window.location.reload(); // Simple reload to refresh list
        } else {
            alert("나가기 실패");
        }
    };

    const handleDeleteRoom = async () => {
        if (!confirm("정말 이 모임방을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없으며 모든 멤버가 쫓겨납니다.")) return;
        const success = await deleteRoomApi(album.id);
        if (success) {
            alert("모임방이 삭제되었습니다.");
            onClose();
            window.location.reload();
        } else {
            alert("삭제 실패");
        }
    };

    if (!isOpen) return null;

    const inviteLink = `${window.location.origin}${import.meta.env.BASE_URL}rooms/${String(album.id).replace(/^room-/, '')}/join`;

    const copyToClipboard = async (text: string, type: 'link' | 'pw') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'link') {
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
            } else {
                setCopiedPw(true);
                setTimeout(() => setCopiedPw(false), 2000);
            }
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[var(--bg-modal)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-[var(--border-color)]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
                    <h3 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                        {album.roomConfig?.password ? <div className="p-1 bg-indigo-500 rounded text-white"><Settings size={14} /></div> : <Users size={18} className="text-indigo-500" />}
                        {album.name}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-card-secondary)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[var(--border-color)]">
                    <button
                        onClick={() => setActiveTab('invite')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors relative ${activeTab === 'invite' ? 'text-indigo-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        초대 공유
                        {activeTab === 'invite' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors relative ${activeTab === 'members' ? 'text-indigo-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        멤버 관리
                        {activeTab === 'members' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'invite' ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">초대 링크</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-[var(--bg-card-secondary)] px-3 py-2.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-primary)] truncate font-mono">
                                        {inviteLink}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(inviteLink, 'link')}
                                        className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                                    >
                                        {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            {album.roomConfig?.password && (
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">비밀번호</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-[var(--bg-card-secondary)] px-3 py-2.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-primary)] font-mono tracking-widest text-center">
                                            {album.roomConfig.password}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(album.roomConfig?.password || '', 'pw')}
                                            className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                                        >
                                            {copiedPw ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">모임 설명</label>
                                <div className="bg-[var(--bg-card-secondary)] p-3 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-primary)] min-h-[80px]">
                                    {album.roomConfig?.description || "설명이 없습니다."}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {isLoadingMembers ? (
                                <div className="flex justify-center p-8">
                                    <Loader className="animate-spin text-indigo-500" />
                                </div>
                            ) : (
                                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                                    {members.map((member) => (
                                        <div key={member.userId} className="flex items-center justify-between p-3 bg-[var(--bg-card-secondary)] rounded-xl border border-[var(--border-color)]">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${member.role === 'OWNER' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    {member.nickname?.substring(0, 2).toUpperCase() || "MB"}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                                                        {member.nickname || "Unknown"}
                                                        {/* Check matches for (나) indicator via Email */}
                                                        {member.email === currentUserEmail && <span className="text-xs text-[var(--text-tertiary)]">(나)</span>}
                                                    </div>
                                                    <div className="text-xs text-[var(--text-secondary)]">{member.email}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {member.role === 'OWNER' && (
                                                    <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded">Owner</span>
                                                )}

                                                {/* Owner Actions: Kick others */}
                                                {currentUserRole === 'OWNER' && member.role !== 'OWNER' && (
                                                    <button
                                                        onClick={() => handleKick(member.userId)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="멤버 내보내기"
                                                    >
                                                        <LogOut size={16} />
                                                    </button>
                                                )}

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Leave Room Button (Only for Non-Owners) */}
                            {currentUserRole !== 'OWNER' && (
                                <div className="pt-4 border-t border-[var(--border-color)] mt-4">
                                    <button
                                        onClick={handleLeave}
                                        className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition flex items-center justify-center gap-2"
                                    >
                                        <LogOut size={16} /> 모임 나가기
                                    </button>
                                </div>
                            )}

                            {currentUserRole === 'OWNER' && (
                                <div className="pt-4 border-t border-[var(--border-color)] mt-4">
                                    <button
                                        onClick={handleDeleteRoom}
                                        className="w-full py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <LogOut size={16} className="rotate-180" /> {/* Rotate to imply 'delete/destroy' or use Trash */}
                                            <span>모임방 삭제하기 (방장 전용)</span>
                                        </div>
                                    </button>
                                    <p className="text-xs text-[var(--text-tertiary)] text-center mt-2">
                                        방장은 나갈 수 없으며, 방을 삭제해야 합니다.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomSettingsModal;
