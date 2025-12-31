import React, { useState } from 'react';
import { usePin } from '../../context/PinContext';
import { X, Lock, Check } from 'lucide-react';

interface PinSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PinSetupModal: React.FC<PinSetupModalProps> = ({ isOpen, onClose }) => {
    const { setupPin } = usePin();
    const [step, setStep] = useState<'ENTER_PIN' | 'CONFIRM_PIN'>('ENTER_PIN');

    // Form States
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const resetState = () => {
        setStep('ENTER_PIN');
        setPin('');
        setConfirmPin('');
        setError('');
        setIsLoading(false);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length !== 4) {
            setError('PIN 번호는 4자리여야 합니다.');
            return;
        }
        setError('');
        setStep('CONFIRM_PIN');
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin !== confirmPin) {
            setError('PIN 번호가 일치하지 않습니다.');
            return;
        }

        setIsLoading(true);
        // Password argument removed/ignored as per request
        const success = await setupPin(pin);

        if (success) {
            alert('PIN 잠금 설정이 완료되었습니다.');
            handleClose();
        } else {
            setError('설정에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={handleClose}>
            <div className="theme-bg-modal theme-border w-full max-w-sm overflow-hidden rounded-2xl border shadow-xl transition-all" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="relative p-6 text-center border-b theme-border">
                    <button onClick={handleClose} className="absolute right-4 top-4 p-2 theme-text-secondary hover:bg-black/5 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="w-12 h-12 rounded-full bg-[var(--btn-bg)] flex items-center justify-center mx-auto mb-3 shadow-md text-white">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold theme-text-primary">PIN 잠금 설정</h3>
                    <p className="text-sm theme-text-secondary mt-1">
                        {step === 'ENTER_PIN' && "새로운 PIN 번호 4자리를 입력해주세요."}
                        {step === 'CONFIRM_PIN' && "한 번 더 입력하여 확인해주세요."}
                    </p>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Step 1: Enter PIN */}
                    {step === 'ENTER_PIN' && (
                        <form onSubmit={handlePinSubmit} className="space-y-4 animate-fade-in-right">
                            <div className="flex justify-center mb-6">
                                <div className="text-4xl font-mono tracking-widest theme-text-primary border-b-2 theme-border px-4 py-2 min-w-[120px] text-center">
                                    {pin.replace(/./g, '•')}
                                </div>
                            </div>
                            <input
                                type="password" // Number type sometimes shows spinners
                                inputMode="numeric"
                                maxLength={4}
                                value={pin}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    if (val.length <= 4) setPin(val);
                                }}
                                className="w-full p-3 text-center text-lg tracking-widest rounded-xl theme-bg-input theme-border border focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)] transition-all"
                                placeholder="PIN 입력"
                                autoFocus
                            />
                            {error && <p className="text-sm text-center text-red-500 animate-shake">{error}</p>}
                            <button
                                type="submit"
                                disabled={pin.length < 4}
                                className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${pin.length < 4 ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                                style={{ backgroundColor: 'var(--btn-bg)' }}
                            >
                                <span>다음</span>
                            </button>
                        </form>
                    )}

                    {/* Step 3: Confirm PIN */}
                    {step === 'CONFIRM_PIN' && (
                        <form onSubmit={handleFinalSubmit} className="space-y-4 animate-fade-in-right">
                            <div className="flex justify-center mb-6">
                                <div className="text-4xl font-mono tracking-widest theme-text-primary border-b-2 theme-border px-4 py-2 min-w-[120px] text-center">
                                    {confirmPin.replace(/./g, '•')}
                                </div>
                            </div>
                            <input
                                type="password"
                                inputMode="numeric"
                                maxLength={4}
                                value={confirmPin}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    if (val.length <= 4) setConfirmPin(val);
                                }}
                                className="w-full p-3 text-center text-lg tracking-widest rounded-xl theme-bg-input theme-border border focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)] transition-all"
                                placeholder="PIN 확인"
                                autoFocus
                            />
                            {error && <p className="text-sm text-center text-red-500 animate-shake">{error}</p>}
                            <button
                                type="submit"
                                disabled={confirmPin.length < 4 || isLoading}
                                className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${confirmPin.length < 4 ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                                style={{ backgroundColor: 'var(--btn-bg)' }}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        <span>설정 완료</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PinSetupModal;
