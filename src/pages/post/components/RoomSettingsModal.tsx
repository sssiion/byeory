import React, { useState } from 'react';
import { X, Copy, Check, Users, Settings } from 'lucide-react';
import type { CustomAlbum } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    album: CustomAlbum;
}

const RoomSettingsModal: React.FC<Props> = ({ isOpen, onClose, album }) => {
    const [activeTab, setActiveTab] = useState<'invite' | 'members'>('invite');
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedPw, setCopiedPw] = useState(false);

    if (!isOpen) return null;

    const inviteLink = `${window.location.origin}/invite/${album.id}`;

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
                            <div className="flex items-center justify-between p-3 bg-[var(--bg-card-secondary)] rounded-xl border border-[var(--border-color)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                        ME
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-[var(--text-primary)]">나 (방장)</div>
                                        <div className="text-xs text-[var(--text-secondary)]">online</div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded">Owner</span>
                            </div>

                            {/* Mock friend */}
                            <div className="flex items-center justify-between p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] opacity-60">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-[var(--text-primary)]">친구 초대 대기중...</div>
                                        <div className="text-xs text-[var(--text-secondary)]">초대 링크를 공유해보세요</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomSettingsModal;
