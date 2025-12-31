import React, { useState } from 'react';
import { usePin } from '../../context/PinContext';
import { useNavigate } from 'react-router-dom';
import PinKeypad from '../../components/Security/PinKeypad';
import { ArrowLeft } from 'lucide-react';

const PinSetup: React.FC = () => {
    const { setupPin } = usePin();
    const navigate = useNavigate();
    const [step, setStep] = useState<'ENTER' | 'CONFIRM'>('ENTER');
    const [firstPin, setFirstPin] = useState('');
    const [error, setError] = useState('');

    const handleEnter = (pin: string) => {
        setFirstPin(pin);
        setStep('CONFIRM');
        setError('');
    };

    const handleConfirm = async (pin: string) => {
        if (pin === firstPin) {
            const success = await setupPin(pin);
            if (success) {
                alert('PIN이 설정되었습니다.');
                navigate(-1);
            } else {
                setError('설정에 실패했습니다. 다시 시도해주세요.');
                setStep('ENTER');
                setFirstPin('');
            }
        } else {
            setError('PIN이 일치하지 않습니다. 처음부터 다시 입력해주세요.');
            setStep('ENTER');
            setFirstPin('');
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] px-4 pt-4">
            <button onClick={() => navigate(-1)} className="p-2 theme-text-primary mb-4">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="mt-10">
                {step === 'ENTER' ? (
                    <PinKeypad
                        title="PIN 설정"
                        message="사용할 4자리 PIN을 입력하세요"
                        onComplete={handleEnter}
                        error={error}
                    />
                ) : (
                    <PinKeypad
                        title="PIN 확인"
                        message="동일한 PIN을 한 번 더 입력하세요"
                        onComplete={handleConfirm}
                    />
                )}
            </div>
        </div>
    );
};

export default PinSetup;
