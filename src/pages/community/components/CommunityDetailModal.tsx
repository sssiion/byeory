import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Eye, Send, Trash2, PenLine } from 'lucide-react';
import type { CommunityResponse, CommunityMessage } from '../types';
import {
    toggleCommunityLike,
    getCommunityMessages,
    createCommunityMessage,
    deleteCommunityMessage,
    getCommunityDetail,
    updateCommunityMessage
} from '../api';
import EditorCanvas from '../../post/components/editor/EditorCanvas';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

interface CommunityDetailModalProps {
    data: CommunityResponse;
    isOpen: boolean;
    onClose: () => void;
    currentUserId?: number;
    onLikeToggle: (newStatus: boolean) => void;
    initialView?: 'content' | 'comments';
}

const CommunityDetailModal: React.FC<CommunityDetailModalProps> = ({
    data,
    isOpen,
    onClose,
    currentUserId,
    onLikeToggle,
    initialView = 'content'
}) => {
    // Detailed Post Data
    const [postDetail, setPostDetail] = useState<CommunityResponse | null>(null);

    const [likeState, setLikeState] = useState({
        isLiked: data.isLiked,
        count: data.likeCount
    });

    // Messages State
    const [messages, setMessages] = useState<CommunityMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const commentsRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Edit State
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');

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

    // Reset state when data changes
    useEffect(() => {
        setLikeState({
            isLiked: data.isLiked,
            count: data.likeCount
        });
        setPostDetail(null); // Reset detail to trigger loading state
        if (isOpen) {
            fetchMessages();
            fetchDetail();
        }
    }, [data, isOpen]);

    // Scroll to comments if initialView is 'comments'
    useEffect(() => {
        if (isOpen && initialView === 'comments' && commentsRef.current) {
            setTimeout(() => {
                commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                inputRef.current?.focus();
            }, 300);
        }
    }, [isOpen, initialView]);

    const fetchDetail = async () => {
        try {
            const detail = await getCommunityDetail(data.postId, currentUserId);
            if (detail) setPostDetail(detail);
        } catch (error) {
            console.error("Failed to fetch community detail:", error);
        }
    };

    const fetchMessages = async () => {
        try {
            const msgs = await getCommunityMessages(data.postId);
            // Calculate isOwner based on currentUserId
            const processedMsgs = msgs.map(m => ({
                ...m,
                isOwner: currentUserId ? (Number(m.userId) === Number(currentUserId)) : false
            }));
            setMessages(processedMsgs);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    const handleMessageSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUserId) return;

        setIsSubmitting(true);
        try {
            const created = await createCommunityMessage(data.postId, newMessage, currentUserId);
            // Optimistically add with isOwner: true
            setMessages(prev => [...prev, { ...created, isOwner: true }]);
            setNewMessage('');
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (error) {
            setConfirmModal({
                isOpen: true,
                title: "작성 실패",
                message: "댓글 작성 중 오류가 발생했습니다.",
                type: 'danger',
                singleButton: true,
                onConfirm: closeConfirmModal
            });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleDeleteMessage = (messageId: number) => {
        if (!currentUserId) return;

        const executeDelete = async () => {
            // Optimistic Delete
            const backup = [...messages];
            setMessages(prev => prev.filter(m => m.messageId !== messageId));
            closeConfirmModal();

            try {
                await deleteCommunityMessage(messageId, currentUserId);
            } catch (error) {
                setConfirmModal({
                    isOpen: true,
                    title: "삭제 실패",
                    message: "댓글 삭제에 실패했습니다.",
                    type: 'danger',
                    singleButton: true,
                    onConfirm: () => {
                        setMessages(backup); // Revert
                        closeConfirmModal();
                    }
                });
            }
        };

        setConfirmModal({
            isOpen: true,
            title: "댓글 삭제",
            message: "이 댓글을 정말 삭제하시겠습니까?",
            type: 'danger',
            onConfirm: executeDelete
        });
    };

    const handleUpdateMessage = async (messageId: number) => {
        if (!currentUserId || !editContent.trim()) return;

        // Optimistic Update
        const backup = [...messages];
        setMessages(prev => prev.map(m =>
            m.messageId === messageId ? { ...m, content: editContent } : m
        ));
        setEditingMessageId(null);

        try {
            await updateCommunityMessage(messageId, editContent, currentUserId);
        } catch (error) {
            setConfirmModal({
                isOpen: true,
                title: "수정 실패",
                message: "댓글 수정에 실패했습니다.",
                type: 'danger',
                singleButton: true,
                onConfirm: () => {
                    setMessages(backup); // Revert
                    setEditingMessageId(messageId);
                    closeConfirmModal();
                }
            });
        }
    };

    const handleLikeClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUserId) {
            setConfirmModal({
                isOpen: true,
                title: "로그인 필요",
                message: "이 기능을 사용하려면 로그인이 필요합니다.",
                type: 'info',
                singleButton: true,
                onConfirm: closeConfirmModal
            });
            return;
        }

        // Optimistic Update
        const newIsLiked = !likeState.isLiked;
        const newCount = newIsLiked ? likeState.count + 1 : likeState.count - 1;

        setLikeState({ isLiked: newIsLiked, count: newCount });
        onLikeToggle(newIsLiked);

        try {
            await toggleCommunityLike(data.postId, currentUserId);
        } catch (error) {
            // Revert on error
            setLikeState({ isLiked: !newIsLiked, count: likeState.count });
            onLikeToggle(!newIsLiked);
            console.error("Failed to toggle like:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col theme-bg-modal rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-6 border-b theme-border theme-bg-header backdrop-blur-md text-white z-10">
                    <h2 className="text-xl font-bold truncate pr-8 theme-text-primary">
                        {data.title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-black/5 transition-colors theme-icon"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                    {/* Meta Info */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                                {data.writerNickname.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold theme-text-primary">{data.writerNickname}</p>
                                <p className="text-xs theme-text-secondary opacity-70">
                                    {new Date(data.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content Area - Detailed View */}
                    <div className="flex-1 min-h-[400px] relative rounded-xl overflow-hidden flex flex-col items-center">
                        {postDetail ? (
                            <div className="w-full h-full transform scale-95 origin-top">
                                <EditorCanvas
                                    title={postDetail.title || data.title}
                                    setTitle={() => { }}
                                    titleStyles={postDetail.titleStyles || data.titleStyles || {}}
                                    viewMode="read"
                                    paperStyles={postDetail.styles || data.styles || {}}
                                    blocks={postDetail.blocks || []}
                                    setBlocks={() => { }}
                                    stickers={postDetail.stickers || []}
                                    floatingTexts={postDetail.floatingTexts || []}
                                    floatingImages={postDetail.floatingImages || []}
                                    selectedId={null}
                                    onSelect={() => { }}
                                    onUpdate={() => { }}
                                    onDelete={() => { }}
                                    onBlockImageUpload={() => { }}
                                    onBackgroundClick={() => { }}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-full h-64 text-gray-400">
                                <div className="animate-pulse">게시글 불러오는 중...</div>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    {(postDetail?.tags || data.tags) && (postDetail?.tags || data.tags)!.length > 0 && (
                        <div className="w-full flex flex-wrap gap-2 px-1 mt-4">
                            {(postDetail?.tags || data.tags)!.map((tag, idx) => (
                                <span key={idx} className="px-3 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-sm font-medium hover:text-indigo-500 transition-colors cursor-default">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 py-4 border-t theme-border mt-4">
                        <button
                            onClick={handleLikeClick}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 font-medium ${likeState.isLiked
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600'
                                : 'theme-bg-card border theme-border theme-text-primary hover:bg-black/5'
                                }`}
                        >
                            <Heart
                                size={20}
                                className={likeState.isLiked ? 'fill-current' : ''}
                            />
                            <span>좋아요 {likeState.count}</span>
                        </button>

                        <div className="flex items-center gap-2 px-4 py-2 theme-text-secondary">
                            <Eye size={20} />
                            <span>{data.viewCount} 읽음</span>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div ref={commentsRef} className="space-y-6 pt-4 border-t theme-border">
                        <h3 className="text-lg font-bold theme-text-primary flex items-center gap-2">
                            댓글 <span className="text-indigo-500">{messages.length}</span>
                        </h3>

                        <div className="space-y-4">
                            {messages.length === 0 ? (
                                <p className="text-center text-gray-400 py-8 text-sm">첫 댓글을 남겨보세요!</p>
                            ) : (
                                messages.map((msg, index) => (
                                    <div key={`comment-${msg.messageId || 'none'}-${index}`} className="group flex gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300">
                                            {(msg.nickname || "?").charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline justify-between mb-1">
                                                <span className="font-bold text-sm theme-text-primary">{msg.nickname || "알 수 없음"}</span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(msg.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {editingMessageId === msg.messageId ? (
                                                <div className="mt-1">
                                                    <textarea
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        className="w-full p-2 text-sm rounded-lg border theme-border bg-white dark:bg-black/20 theme-text-primary focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                                        rows={2}
                                                        autoFocus
                                                    />
                                                    <div className="flex justify-end gap-2 mt-2">
                                                        <button
                                                            onClick={() => setEditingMessageId(null)}
                                                            className="px-3 py-1 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 theme-text-secondary"
                                                        >
                                                            취소
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateMessage(msg.messageId)}
                                                            className="px-3 py-1 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                                                        >
                                                            수정 완료
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-700 dark:text-gray-300 break-words leading-relaxed whitespace-pre-wrap">
                                                    {msg.content}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions for Owner */}
                                        {msg.isOwner && !editingMessageId && (
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingMessageId(msg.messageId);
                                                        setEditContent(msg.content);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-indigo-500 transition-colors"
                                                    title="수정"
                                                >
                                                    <PenLine size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMessage(msg.messageId)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                    title="삭제"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                </div>

                {/* Footer Input */}
                <div className="flex-shrink-0 p-4 border-t theme-border theme-bg-header bg-opacity-95 backdrop-blur-sm z-10">
                    <form onSubmit={handleMessageSubmit} className="flex gap-2 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={currentUserId ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
                            disabled={!currentUserId || isSubmitting}
                            className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 border-transparent focus:bg-white dark:focus:bg-black/30 focus:ring-2 focus:ring-indigo-500 transition-all outline-none theme-text-primary text-sm"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || !currentUserId || isSubmitting}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-500/20 active:scale-95 flex items-center justify-center min-w-[50px]"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Send size={20} />
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Confirmation Modal */}
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

export default CommunityDetailModal;
