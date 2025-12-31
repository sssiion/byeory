import React, { useState } from 'react';
import { usePin } from '../../context/PinContext';
import PinKeypad from './PinKeypad';

const PinLockOverlay: React.FC = () => {
    const { isLocked, verifyPin, failedAttempts, verifyLockCode, resendLockCode } = usePin();
    const [mode, setMode] = useState<'PIN' | 'CODE'>('PIN');
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // Detect switch to CODE mode if attempts > 5
    // Note: This relies on PinContext keeping track and rendering PinLockOverlay.
    // Ideally useEffect to watch failedAttempts.
    React.useEffect(() => {
        if (failedAttempts >= 5 && mode === 'PIN') {
            setMode('CODE');
            setError('PIN 입력 횟수 5회 초과. 이메일로 전송된 코드를 입력하세요.');
            resendLockCode(); // Automatically send code on switch? Or ask user?
            // Let's assume auto-send or just prompt.
            // We can do manual send call:
            // resendLockCode(); 
        }
    }, [failedAttempts, mode]);

    if (!isLocked) return null;

    const handlePinComplete = async (pin: string) => {
        setIsLoading(true);
        setError('');
        const success = await verifyPin(pin);
        setIsLoading(false);
        if (!success) {
            setError(`PIN이 일치하지 않습니다. (실패 ${failedAttempts + 1}/5)`);
        }
    };

    const handleCodeComplete = async (code: string) => {
        setIsLoading(true);
        setError('');
        const success = await verifyLockCode(code);
        setIsLoading(false);
        if (!success) {
            setError('코드가 일치하지 않습니다.');
        }
    };

    const handleResendCode = async () => {
        setIsLoading(true);
        await resendLockCode();
        setIsLoading(false);
        setMessage('인증 코드가 이메일로 재전송되었습니다.');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md p-6 bg-[var(--bg-primary)] rounded-3xl shadow-2xl border theme-border mx-4">
                {mode === 'PIN' ? (
                    <PinKeypad
                        title="잠금 해제"
                        message="PIN 번호를 입력하세요"
                        onComplete={handlePinComplete}
                        error={error}
                        onForgot={() => {
                            setMode('CODE');
                            resendLockCode();
                            setError('이메일로 인증 코드를 전송했습니다.');
                        }}
                    />
                ) : (
                    <div className="text-center space-y-6">
                        <h2 className="text-xl font-bold theme-text-primary">비상 잠금 해제</h2>
                        <p className="text-sm theme-text-secondary">
                            등록된 이메일로 전송된 6자리 코드를 입력하세요.
                        </p>
                        {/* We can re-use PinKeypad for 6 digit code too! */}
                        <PinKeypad
                            title=""
                            message="인증 코드 입력"
                            length={6}
                            onComplete={handleCodeComplete}
                            error={error}
                        />

                        <button
                            onClick={handleResendCode}
                            disabled={isLoading}
                            className="text-sm theme-text-secondary hover:theme-text-primary underline"
                        >
                            코드 재전송
                        </button>
                        {message && <p className="text-xs text-green-500">{message}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PinLockOverlay;
