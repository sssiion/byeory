import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface YearModalPageProps {
    onClose: () => void;
}

const YearModalPage: React.FC<YearModalPageProps> = ({ onClose }) => {
    // Current Spread Index (0 = Pages 1-2, 1 = Pages 3-4, etc.)
    const [spreadIndex, setSpreadIndex] = useState(0);
    const totalSpreads = 6;

    const nextPage = () => {
        if (spreadIndex < totalSpreads - 1) setSpreadIndex(prev => prev + 1);
    };

    const prevPage = () => {
        if (spreadIndex > 0) setSpreadIndex(prev => prev - 1);
    };

    // Page Content Component
    const PageContent = ({ pageNum }: { pageNum: number }) => {
        // Page 1: Blank
        if (pageNum === 1) return <div className="w-full h-full bg-[#fdfbf7]"></div>;

        // Page 2: Table of Contents
        if (pageNum === 2) return (
            <div className="w-full h-full bg-[#fdfbf7] p-8 flex flex-col justify-center items-center font-serif text-[#4a4a4a]">
                <h2 className="text-3xl font-bold mb-12 border-b-2 border-[#d4c5b0] pb-4">목차</h2>
                <ul className="space-y-6 text-lg w-full max-w-[200px]">
                    <li className="flex justify-between"><span>Spring</span> <span>..... 3</span></li>
                    <li className="flex justify-between"><span>Summer</span> <span>..... 5</span></li>
                    <li className="flex justify-between"><span>Autumn</span> <span>..... 7</span></li>
                    <li className="flex justify-between"><span>Winter</span> <span>..... 9</span></li>
                </ul>
            </div>
        );

        // Page 3: Spring Field Background
        if (pageNum === 3) return (
            <div className="w-full h-full relative overflow-hidden">
                <img src={`${import.meta.env.BASE_URL}year/spring_field.png`} className="w-full h-full object-cover" alt="Spring Field" />
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-8 left-8 text-white font-serif text-4xl font-bold drop-shadow-md">Spring</div>
            </div>
        );

        // Page 4: Puppy
        if (pageNum === 4) return (
            <div className="w-full h-full bg-[#fdfbf7] p-6 flex flex-col items-center">
                <div className="w-full aspect-square bg-white p-3 shadow-md rotate-2 mb-4">
                    <img src={`${import.meta.env.BASE_URL}year/puppy_run.png`} className="w-full h-full object-cover" alt="Puppy" />
                </div>
                <div className="flex-1 flex items-center">
                    <p className="font-serif text-sm leading-7 text-gray-700 text-center">
                        긴 겨울이 풀리고 따뜻한 봄이 와서<br />
                        강아지와 함께 들판을 뛰어놀았어요.<br />
                        살랑이는 봄바람과 꽃향기가<br />
                        우리의 산책을 더욱 즐겁게 해주었답니다.
                    </p>
                </div>
                {/* Diary Deco */}
                <div className="w-full h-12 border-t border-dashed border-gray-300 mt-auto flex items-center justify-center gap-2 text-gray-400 text-xs">
                    <span>✿</span> <span>2025.04.12</span> <span>✿</span>
                </div>
            </div>
        );

        // Page 5: Summer Theme (Hot Sun)
        if (pageNum === 5) return (
            <div className="w-full h-full relative overflow-hidden">
                <img src={`${import.meta.env.BASE_URL}year/summer_heat.png`} className="w-full h-full object-cover" alt="Summer Heat" />
                <div className="absolute top-8 left-8 text-white font-serif text-4xl font-bold drop-shadow-md">Summer</div>
            </div>
        );

        // Page 6: Summer Text (Heatwave)
        if (pageNum === 6) return (
            <div className="w-full h-full bg-[#fdfbf7] p-6 flex flex-col items-center">
                <div className="w-full h-1/2 flex items-center justify-center p-4">
                    <p className="font-serif text-sm leading-7 text-gray-700 text-center">
                        폭염으로 찌는 듯한 날씨..<br />
                        힘들었지만 강의가 시작되었습니다.<br />
                        뜨거운 태양만큼이나<br />
                        우리의 열정도 뜨거웠던 여름이었죠.
                    </p>
                </div>
                <div className="w-full h-1/2 bg-yellow-50 p-4 border border-yellow-100 m-4 rounded-lg shadow-inner flex items-center justify-center">
                    <span className="text-4xl">☀️🥵💦</span>
                </div>
            </div>
        );

        // Page 7: Grandma's Food
        if (pageNum === 7) return (
            <div className="w-full h-full bg-[#fdfbf7] p-6 flex flex-col items-center">
                <div className="w-full aspect-[4/3] bg-white p-2 shadow-md -rotate-1 mb-6">
                    <img src={`${import.meta.env.BASE_URL}year/grandma_food.png`} className="w-full h-full object-cover" alt="Grandma Food" />
                </div>
                <p className="font-serif text-sm leading-7 text-gray-700 text-center">
                    "할머니 밥 그만 주세요.."<br />
                    마음까지 배불렀던 풍성한 추석.<br />
                    가족들과 함께한 따뜻한 밥상이<br />
                    가을의 가장 큰 행복이었습니다.<br />
                    <span className="text-orange-600 font-bold mt-2 block">#명절 #배터져 #할머니사랑</span>
                </p>
            </div>
        );

        // Page 8: Autumn Leaves Bg
        if (pageNum === 8) return (
            <div className="w-full h-full relative overflow-hidden">
                <img src={`${import.meta.env.BASE_URL}year/autumn_leaves.png`} className="w-full h-full object-cover" alt="Autumn Leaves" />
                <div className="absolute bottom-8 right-8 text-white font-serif text-4xl font-bold drop-shadow-md text-right">Autumn</div>
            </div>
        );

        // Page 9: Winter Study
        if (pageNum === 9) return (
            <div className="w-full h-full bg-[#fdfbf7] p-6 flex flex-col items-center">
                <div className="w-full aspect-square bg-white p-3 shadow-md rotate-1 mb-4">
                    <img src={`${import.meta.env.BASE_URL}year/winter_study.png`} className="w-full h-full object-cover" alt="Winter Study" />
                </div>
                <p className="font-serif text-sm leading-7 text-gray-700 text-center">
                    강의도 끝을 보게 되었습니다.<br />
                    유익한 수업이었고 많이 성장했어요.<br />
                    창밖엔 눈이 내리고,<br />
                    따뜻한 핫초코와 함께한 마무리.
                </p>
            </div>
        );

        // Page 10: Snowman
        if (pageNum === 10) return (
            <div className="w-full h-full relative overflow-hidden">
                <img src={`${import.meta.env.BASE_URL}year/snowman.png`} className="w-full h-full object-cover" alt="Snowman" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-12 w-full text-center text-[#2c3e50] font-serif text-2xl font-bold">Winter Wonderland</div>
            </div>
        );

        // Page 11: Reflection
        if (pageNum === 11) return (
            <div className="w-full h-full bg-[#fdfbf7] p-10 flex flex-col justify-center items-center text-center">
                <h3 className="text-xl font-bold text-indigo-900 mb-8 font-serif">Dear. Me</h3>
                <p className="font-serif text-base leading-9 text-gray-700">
                    한 해의 모습을 돌아보니 어땠나요?<br />
                    <br />
                    웃음 가득했던 순간도,<br />
                    조금은 지쳤던 순간도 있었지만<br />
                    그 모든 것이 당신의 별자리가 되었어요.<br />
                    <br />
                    이제 다가올 새해에는<br />
                    어떤 새로운 목표가 있나요?
                </p>
            </div>
        );

        // Page 12: Outro
        if (pageNum === 12) return (
            <div className="w-full h-full bg-[#1a237e] flex flex-col justify-center items-center text-[#ffd700]">
                <Sparkles className="w-12 h-12 mb-6 animate-pulse" />
                <h1 className="text-4xl font-serif font-bold mb-4 tracking-widest">Adieu 2025</h1>
                <p className="font-serif text-sm opacity-80">See you in 2026</p>
            </div>
        );

        return null;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-50"
            >
                <X size={32} />
            </button>

            {/* Book Container */}
            <div className="relative w-full max-w-4xl aspect-[3/2] flex shadow-2xl rounded-lg overflow-hidden bg-[#fdfbf7]">

                {/* Left Page (Odd Pages: 1, 3, 5, 7, 9, 11) -> spreadIndex * 2 + 1 */}
                <div className="w-1/2 h-full relative border-r border-[#e0e0e0] overflow-hidden">
                    {/* Shadow Gradient for Binding */}
                    <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-10"></div>
                    <PageContent pageNum={spreadIndex * 2 + 1} />
                </div>

                {/* Right Page (Even Pages: 2, 4, 6, 8, 10, 12) -> spreadIndex * 2 + 2 */}
                <div className="w-1/2 h-full relative overflow-hidden">
                    {/* Shadow Gradient for Binding */}
                    <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-10"></div>
                    <PageContent pageNum={spreadIndex * 2 + 2} />
                </div>

                {/* Navigation Controls */}
                {spreadIndex > 0 && (
                    <button
                        onClick={prevPage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full shadow-lg flex items-center justify-center hover:bg-white text-gray-800 z-20"
                    >
                        <ChevronLeft />
                    </button>
                )}
                {spreadIndex < totalSpreads - 1 && (
                    <button
                        onClick={nextPage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full shadow-lg flex items-center justify-center hover:bg-white text-gray-800 z-20"
                    >
                        <ChevronRight />
                    </button>
                )}

            </div>
        </div>
    );
};

export default YearModalPage;
