import React, { useState, useEffect } from 'react';
import { Delete, Lock } from 'lucide-react';

interface PinKeypadProps {
    title?: string;
    message?: string;
    onComplete: (pin: string) => void;
    onForgot?: () => void;
    length?: number;
    error?: string;
}

const PinKeypad: React.FC<PinKeypadProps> = ({
    title = "PIN 입력",
    message = "4자리 비밀번호를 입력해주세요",
    onComplete,
    onForgot,
    length = 4,
    error
}) => {
    const [pin, setPin] = useState("");
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (pin.length === length) {
            setIsAnimating(true);
            setTimeout(() => {
                onComplete(pin);
                setPin("");
                setIsAnimating(false);
            }, 200);
        }
    }, [pin, length, onComplete]);

    const handleNumberClick = (num: number) => {
        if (pin.length < length) {
            setPin(prev => prev + num.toString());
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto p-4 animate-in fade-in zoom-in duration-300">
            <div className="mb-8 text-center">
                <div className="w-16 h-16 rounded-full theme-bg-card border theme-border flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Lock className="w-8 h-8 theme-text-primary" />
                </div>
                <h2 className="text-xl font-bold theme-text-primary mb-2">{title}</h2>
                <p className={`text-sm ${error ? 'text-red-500 font-medium' : 'theme-text-secondary'}`}>
                    {error || message}
                </p>
            </div>

            {/* Dots */}
            <div className="flex gap-4 mb-10">
                {Array.from({ length }).map((_, i) => (
                    <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all duration-200 ${i < pin.length
                            ? 'bg-[var(--btn-bg)] scale-110 shadow-md'
                            : 'theme-bg-card-secondary theme-border border'
                            }`}
                    />
                ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleNumberClick(num)}
                        className="w-16 h-16 rounded-full theme-bg-card hover:bg-[var(--bg-hover)] theme-text-primary text-2xl font-medium transition-colors shadow-sm border theme-border flex items-center justify-center active:scale-95"
                    >
                        {num}
                    </button>
                ))}

                <div className="w-16 h-16" /> {/* Empty Slot */}

                <button
                    onClick={() => handleNumberClick(0)}
                    className="w-16 h-16 rounded-full theme-bg-card hover:bg-[var(--bg-hover)] theme-text-primary text-2xl font-medium transition-colors shadow-sm border theme-border flex items-center justify-center active:scale-95"
                >
                    0
                </button>

                <button
                    onClick={handleDelete}
                    className="w-16 h-16 rounded-full hover:bg-[var(--bg-hover)] text-[var(--icon-color)] transition-colors flex items-center justify-center active:scale-95"
                >
                    <Delete className="w-6 h-6" />
                </button>
            </div>

            {onForgot && (
                <button
                    onClick={onForgot}
                    className="mt-8 text-sm theme-text-secondary hover:theme-text-primary underline underline-offset-4"
                >
                    PIN을 잊으셨나요?
                </button>
            )}
        </div>
    );
};

export default PinKeypad;
