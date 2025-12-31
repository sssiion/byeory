import React, { useState, useEffect } from 'react';
import { usePin } from '../../context/PinContext';
import { Delete, Lock, Mail, KeyRound } from 'lucide-react';

const PinScreen: React.FC = () => {
    const { isLocked, unlock, forgotPin, verifyResetCode, resetPin } = usePin();
    const [mode, setMode] = useState<'UNLOCK' | 'RESET_CODE' | 'RESET_NEW_PIN'>('UNLOCK');
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resetCode, setResetCode] = useState('');

    // Prevent context menu (right click) to hinder inspection
    useEffect(() => {
        if (isLocked) {
            const handleContextMenu = (e: MouseEvent) => e.preventDefault();
            document.addEventListener('contextmenu', handleContextMenu);
            return () => document.removeEventListener('contextmenu', handleContextMenu);
        }
    }, [isLocked]);

    useEffect(() => {
        if (!isLocked) {
            // Reset state when unlocked
            setMode('UNLOCK');
            setPin('');
            setResetCode('');
        }
    }, [isLocked]);

    // Prevent F12/DevTools DOM removal - Security Force Reload
    useEffect(() => {
        if (!isLocked) return;

        const observer = new MutationObserver(() => {
            if (!document.getElementById('pin-lock-overlay')) {
                // Detected forced removal of overlay -> Reload to re-lock
                window.location.reload();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, [isLocked]);

    if (!isLocked) return null;

    const handleNumberClick = async (num: number) => {
        if (isLoading) return;

        const currentVal = mode === 'RESET_CODE' ? resetCode : pin;
        const maxLength = mode === 'RESET_CODE' ? 6 : 4;

        if (currentVal.length < maxLength) {
            const newVal = currentVal + num;
            if (mode === 'RESET_CODE') setResetCode(newVal);
            else setPin(newVal);

            setError(false);

            // Auto-submit checks
            if (newVal.length === maxLength) {
                setIsLoading(true);
                setTimeout(async () => {
                    if (mode === 'UNLOCK') {
                        const success = await unlock(newVal);
                        if (!success) {
                            setError(true);
                            setPin('');
                        }
                    } else if (mode === 'RESET_CODE') {
                        const success = await verifyResetCode(newVal);
                        if (success) {
                            setMode('RESET_NEW_PIN');
                            setPin(''); // Clear pin for new entry
                        } else {
                            setError(true);
                            setResetCode('');
                        }
                    } else if (mode === 'RESET_NEW_PIN') {
                        const success = await resetPin(resetCode, newVal);
                        if (success) {
                            alert('PIN이 재설정되고 잠금이 해제되었습니다.');
                            // Unlock handled by context, effect will reset state
                        } else {
                            setError(true);
                            setPin('');
                        }
                    }
                    setIsLoading(false);
                }, 300);
            }
        }
    };

    const handleDelete = () => {
        if (mode === 'RESET_CODE') {
            setResetCode(prev => prev.slice(0, -1));
        } else {
            setPin(prev => prev.slice(0, -1));
        }
        setError(false);
    };

    const handleForgotPin = async () => {
        if (window.confirm('가입된 이메일로 인증 코드를 보내시겠습니까?')) {
            const success = await forgotPin();
            if (success) {
                setMode('RESET_CODE');
                setResetCode('');
                setError(false);
            }
        }
    };

    // UI Helpers
    const getTitle = () => {
        switch (mode) {
            case 'UNLOCK': return 'PIN 잠금';
            case 'RESET_CODE': return '인증 코드 입력';
            case 'RESET_NEW_PIN': return '새 PIN 설정';
        }
    };

    const getSubtitle = () => {
        switch (mode) {
            case 'UNLOCK': return '계속하려면 PIN 번호를 입력하세요';
            case 'RESET_CODE': return '이메일로 전송된 6자리 코드를 입력하세요';
            case 'RESET_NEW_PIN': return '새로운 4자리 PIN을 입력하세요';
        }
    };

    const getIcon = () => {
        switch (mode) {
            case 'UNLOCK': return <Lock className="w-8 h-8" />;
            case 'RESET_CODE': return <Mail className="w-8 h-8" />;
            case 'RESET_NEW_PIN': return <KeyRound className="w-8 h-8" />;
        }
    };

    const currentVal = mode === 'RESET_CODE' ? resetCode : pin;
    const maxLength = mode === 'RESET_CODE' ? 6 : 4;

    return (
        <div
            id="pin-lock-overlay"
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none transition-all duration-300"
            style={{
                backgroundColor: 'var(--bg-solid)',
                backgroundImage: 'var(--bg-gradient)',
                backgroundSize: 'var(--bg-size, cover)',
                backgroundRepeat: 'var(--bg-repeat, no-repeat)',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Visual Header */}
            <div className="mb-12 flex flex-col items-center animate-fade-in-up">
                <div className="w-16 h-16 rounded-full bg-[var(--btn-bg)] flex items-center justify-center mb-4 shadow-lg text-white">
                    {getIcon()}
                </div>
                <h2 className="text-2xl font-bold theme-text-primary mb-2">{getTitle()}</h2>
                <p className="theme-text-secondary text-center px-4">{getSubtitle()}</p>
            </div>

            {/* Dots feedback */}
            <div className="flex gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {[...Array(maxLength)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${i < currentVal.length
                            ? 'bg-[var(--btn-bg)] border-[var(--btn-bg)] scale-110'
                            : `border-[var(--text-secondary)] ${error ? 'border-red-500 animate-shake' : ''}`
                            }`}
                    />
                ))}
            </div>

            {/* Error Message */}
            <div className="h-6 mb-4">
                {error && <p className="text-red-500 text-sm font-medium animate-shake">
                    {mode === 'UNLOCK' ? '비밀번호가 올바르지 않습니다.' : '입력 정보가 올바르지 않습니다.'}
                </p>}
            </div>

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-x-8 gap-y-6 max-w-xs w-full px-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleNumberClick(num)}
                        className="w-16 h-16 rounded-full text-2xl font-medium theme-text-primary hover:bg-black/5 active:scale-95 transition-all flex items-center justify-center mx-auto"
                    >
                        {num}
                    </button>
                ))}
                <div className="w-16 h-16" /> {/* Empty Slot */}
                <button
                    onClick={() => handleNumberClick(0)}
                    className="w-16 h-16 rounded-full text-2xl font-medium theme-text-primary hover:bg-black/5 active:scale-95 transition-all flex items-center justify-center mx-auto"
                >
                    0
                </button>
                <button
                    onClick={handleDelete}
                    className="w-16 h-16 rounded-full theme-text-secondary hover:bg-black/5 active:scale-95 transition-all flex items-center justify-center mx-auto"
                >
                    <Delete className="w-6 h-6" />
                </button>
            </div>

            {/* Bottom Options */}
            {mode === 'UNLOCK' && (
                <button
                    onClick={handleForgotPin}
                    className="mt-12 text-sm theme-text-secondary hover:underline underline-offset-4"
                >
                    PIN 번호를 잊으셨나요?
                </button>
            )}
            {mode !== 'UNLOCK' && (
                <button
                    onClick={() => { setMode('UNLOCK'); setResetCode(''); setPin(''); setError(false); }}
                    className="mt-12 text-sm theme-text-primary hover:underline underline-offset-4 font-medium"
                >
                    취소하고 돌아가기
                </button>
            )}
        </div>
    );
};

export default PinScreen;
