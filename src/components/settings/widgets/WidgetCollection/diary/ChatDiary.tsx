import React, { useState, useRef, useEffect } from 'react';
import { WidgetWrapper } from '../../Shared';
import { Send, User, Bot, MoreVertical } from 'lucide-react';

interface ComponentProps {
    className?: string;
    style?: React.CSSProperties;
    initialMessages?: Array<{ id: number; text: string; sender: 'me' | 'other'; time: string }>;
    gridSize?: { w: number; h: number };
}

export const ChatDiaryConfig = {
    defaultSize: '2x2',
    validSizes: [[2, 2], [2, 3]] as [number, number][],
};

export const ChatDiary = ({ className, style, initialMessages = [], gridSize }: ComponentProps) => {
    const [messages, setMessages] = useState(initialMessages.length > 0 ? initialMessages : [
        { id: 1, text: '오늘 하루는 어땠어?', sender: 'other', time: '09:00' },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isMyTurn, setIsMyTurn] = useState(true); // Toggle between me and 'other' (myself as narrator)
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const newMessage = {
            id: Date.now(),
            text: inputValue,
            sender: isMyTurn ? 'me' : 'other',
            time: timeString
        } as const;

        setMessages([...messages, newMessage]);
        setInputValue('');
        setIsMyTurn(!isMyTurn); // Auto toggle for conversation feel
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <WidgetWrapper className={`bg-[#bacee0] flex flex-col ${className || ''}`} style={style}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-[#bacee0] bg-opacity-90 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-[12px] bg-[#d6e4f0] flex items-center justify-center text-gray-600">
                        <User size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">나와의 채팅</span>
                        <span className="text-[10px] text-gray-600">참여자 2</span>
                    </div>
                </div>
                <MoreVertical size={16} className="text-gray-600 cursor-pointer" />
            </div>

            {/* Chat Area */}
            <div
                className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar"
                ref={scrollRef}
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-2 max-w-[85%] ${msg.sender === 'me' ? 'self-end flex-row-reverse' : 'self-start'}`}
                    >
                        {msg.sender === 'other' && (
                            <div className="w-8 h-8 rounded-[12px] bg-white flex-shrink-0 flex items-center justify-center shadow-sm overflow-hidden mt-1">
                                <Bot size={18} className="text-[#5b3c3c]" />
                            </div>
                        )}
                        <div className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-end gap-1">
                                {msg.sender === 'me' && (
                                    <span className="text-[10px] text-gray-500 min-w-fit mb-1">{msg.time}</span>
                                )}
                                <div
                                    className={`px-3 py-2 rounded-[12px] text-sm shadow-sm break-words ${msg.sender === 'me'
                                        ? 'bg-[#ffeb3b] text-black rounded-tr-[4px]'
                                        : 'bg-white text-black rounded-tl-[4px]'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                                {msg.sender === 'other' && (
                                    <span className="text-[10px] text-gray-500 min-w-fit mb-1">{msg.time}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white">
                <div className="flex gap-2 bg-[#f3f3f3] rounded-[18px] px-3 py-2 items-center">
                    <div
                        className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setIsMyTurn(!isMyTurn)}
                        title={isMyTurn ? "Switch to Narrator" : "Switch to Me"}
                    >
                        {isMyTurn ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <input
                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-400"
                        placeholder="메시지 입력..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        onClick={handleSend}
                        className={`p-1.5 rounded-full transition-colors ${inputValue.trim() ? 'bg-[#ffeb3b] text-black' : 'bg-gray-200 text-gray-400'
                            }`}
                    >
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </WidgetWrapper>
    );
};
