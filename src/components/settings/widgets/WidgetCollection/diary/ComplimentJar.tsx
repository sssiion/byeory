import { useState } from 'react';
import { WidgetWrapper } from '../Common';

// --- 2. Compliment Jar (칭찬 저금통)
export const ComplimentJarConfig = {
    defaultSize: '1x1',
    validSizes: [[1, 1], [2, 1]] as [number, number][],
};

interface ComplimentJarProps {
    gridSize?: { w: number; h: number };
}

export function ComplimentJar({ gridSize }: ComplimentJarProps) {
    const compliments = [
        "오늘도 빛나고 있어! ✨",
        "너의 미소가 최고야 😊",
        "잘하고 있어, 걱정 마 💪",
        "넌 정말 소중한 사람이야 💖",
        "행운이 널 따를 거야 🍀",
        "오늘 하루도 수고했어 🌙"
    ];
    const [message, setMessage] = useState("칭찬 뽑기");
    const [isShake, setIsShake] = useState(false);

    const pickCompliment = () => {
        setIsShake(true);
        setTimeout(() => {
            const random = compliments[Math.floor(Math.random() * compliments.length)];
            setMessage(random);
            setIsShake(false);
        }, 500);
    };

    return (
        <WidgetWrapper className="bg-pink-50">
            <div
                onClick={pickCompliment}
                className={`cursor-pointer flex flex-col items-center justify-center gap-2 ${isShake ? 'animate-bounce' : ''}`}
            >
                <div className="text-4xl">🍯</div>
                <div className="bg-white/80 p-2 rounded-lg text-center min-w-[100px] shadow-sm">
                    <p className="text-xs md:text-sm font-medium text-pink-600 break-keep">{message}</p>
                </div>
            </div>
        </WidgetWrapper>
    );
}
