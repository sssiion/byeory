import React, { useState } from 'react';
import { usePin } from '../../context/PinContext';
import { useNavigate } from 'react-router-dom';
import PinKeypad from '../../components/Security/PinKeypad';
import { ArrowLeft } from 'lucide-react';

const PinChange: React.FC = () => {
    const { verifyPin, changePin } = usePin();
    const navigate = useNavigate();
    const [step, setStep] = useState<'VERIFY_OLD' | 'ENTER_NEW' | 'CONFIRM_NEW'>('VERIFY_OLD');
    const [newPin, setNewPin] = useState('');
    const [error, setError] = useState('');

    const handleVerifyOld = async (pin: string) => {
        const isValid = await verifyPin(pin);
        if (isValid) {
            setStep('ENTER_NEW');
            setError('');
        } else {
            setError('기존 PIN이 일치하지 않습니다.');
        }
    };

    const handleEnterNew = (pin: string) => {
        setNewPin(pin);
        setStep('CONFIRM_NEW');
        setError('');
    };

    const handleConfirmNew = async (pin: string) => {
        if (pin === newPin) {
            const success = await changePin(pin);
            if (success) {
                alert('PIN이 변경되었습니다.');
                navigate(-1);
            } else {
                setError('변경에 실패했습니다.');
                setStep('ENTER_NEW');
            }
        } else {
            setError('새 PIN이 일치하지 않습니다.');
            setStep('ENTER_NEW');
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] px-4 pt-4">
            <button onClick={() => navigate(-1)} className="p-2 theme-text-primary mb-4">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="mt-10">
                {step === 'VERIFY_OLD' && (
                    <PinKeypad
                        title="PIN 변경"
                        message="현재 PIN을 입력하세요"
                        onComplete={handleVerifyOld}
                        error={error}
                    />
                )}
                {step === 'ENTER_NEW' && (
                    <PinKeypad
                        title="새 PIN 설정"
                        message="새로운 4자리 PIN을 입력하세요"
                        onComplete={handleEnterNew}
                        error={error}
                    />
                )}
                {step === 'CONFIRM_NEW' && (
                    <PinKeypad
                        title="새 PIN 확인"
                        message="새로운 PIN을 한 번 더 입력하세요"
                        onComplete={handleConfirmNew}
                    />
                )}
            </div>
        </div>
    );
};

export default PinChange;
