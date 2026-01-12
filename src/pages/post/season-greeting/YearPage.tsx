import React, { useState, useEffect } from 'react';
import Navigation from '../../../components/header/Navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import YearModalPage from './YearModalPage';

const YearPage: React.FC = () => {
    const [stage, setStage] = useState<'intro' | 'album' | 'opened'>('intro');
    const [postCount] = useState(82);
    const [coverImage] = useState<string | null>('/year/cat.jpg');
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Removed API Call for Easter Egg Hardcoding

    // Intro papers animation data
    const papers = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: Math.random() * 1000 - 500, // Random start X relative to center
        y: Math.random() * 1000 - 500, // Random start Y relative to center
        rotate: Math.random() * 360,
        delay: Math.random() * 0.5,
    }));

    useEffect(() => {
        // Transition from intro to album after animation
        if (stage === 'intro') {
            const timer = setTimeout(() => {
                setStage('album');
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [stage]);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pb-32 overflow-hidden perspective-1000">
            <Navigation />

            <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[80vh] text-center relative">

                {/* Intro Animation: Flying Papers */}
                <AnimatePresence>
                    {stage === 'intro' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {papers.map((paper) => (
                                <motion.div
                                    key={paper.id}
                                    initial={{
                                        opacity: 0,
                                        x: paper.x * 2,
                                        y: paper.y * 2,
                                        scale: 0.5,
                                        rotate: paper.rotate
                                    }}
                                    animate={{
                                        opacity: [0, 1, 1, 0],
                                        x: 0,
                                        y: 0,
                                        scale: [1, 1, 0.2],
                                        rotate: paper.rotate + 720
                                    }}
                                    transition={{
                                        duration: 2,
                                        ease: "easeInOut",
                                        delay: paper.delay
                                    }}
                                    className="absolute w-24 h-32 bg-white shadow-lg border border-gray-200"
                                />
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: stage !== 'intro' ? 1 : 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="flex flex-col items-center w-full z-10"
                >
                    {/* Text Section */}
                    <div className="mb-12 space-y-4">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-4xl md:text-6xl font-black text-[var(--text-primary)]"
                        >
                            Good Bye 2025!
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            className="text-lg md:text-xl text-[var(--text-secondary)] font-medium max-w-2xl whitespace-pre-line leading-relaxed"
                        >
                            한 해 고생 많으셨습니다! 지난 한 해동안 작성한 글을 가지고 앨범을 만들어봤어요!<br />
                            벼리가 준비한 선물을 확인해보세요!
                        </motion.p>
                    </div>

                    {/* Album Interaction */}
                    <motion.div
                        className="relative w-64 h-80 md:w-80 md:h-[400px] cursor-pointer perspective-1000"
                        onClick={() => setStage('opened')}
                        animate={{
                            x: stage === 'opened' ? '50%' : '0%'
                        }}
                        transition={{
                            duration: 1,
                            ease: "easeInOut"
                        }}
                    >
                        {/* Book Spine/Base (Right Page) */}
                        <div className="absolute inset-0 bg-[#fdfbf7] rounded-r-lg shadow-xl shadow-black/20">
                            {/* Right Page Content */}
                            <div className="h-full w-full p-6 flex flex-col items-center justify-center">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: stage === 'opened' ? 1 : 0 }}
                                    transition={{ delay: 0.5, duration: 1 }}
                                    className="text-center w-full"
                                >
                                    <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg mb-6 flex flex-col items-center justify-center text-gray-400 text-xs border-2 border-dashed border-gray-200 group-hover:border-indigo-200 transition-colors overflow-hidden relative">
                                        {coverImage ? (
                                            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <Sparkles className="w-8 h-8 text-gray-300 mb-2" />
                                                <span>2025 Memories</span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-gray-700 font-serif text-sm leading-relaxed mb-6">
                                        당신의 2025년 기록<br />
                                        <span className="font-bold text-indigo-600 text-2xl">{postCount}</span>개의 이야기
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsDetailOpen(true);
                                        }}
                                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2 mx-auto"
                                    >
                                        자세히 보기
                                    </button>
                                </motion.div>
                            </div>

                            {/* Pages Stack Effect (Right side) */}
                            <div className="absolute top-1 bottom-1 -right-2 w-2 bg-white rounded-r border border-gray-100 -z-10"></div>
                            <div className="absolute top-2 bottom-2 -right-3 w-2 bg-white rounded-r border border-gray-100 -z-20"></div>
                        </div>

                        {/* Front Cover (Left Page Wrapper) */}
                        <motion.div
                            className="absolute inset-0 w-full h-full preserve-3d origin-left"
                            animate={{
                                rotateY: stage === 'opened' ? -180 : 0
                            }}
                            transition={{
                                duration: 1.5,
                                ease: [0.4, 0, 0.2, 1] // Custom bezier for realistic book opening
                            }}
                        >
                            {/* Front Face (Cover) */}
                            <div className="absolute inset-0 bg-[#1a237e] rounded-r-lg shadow-2xl backface-hidden z-20 flex flex-col items-center justify-center border-l-4 border-[#0d1450]">
                                <div className="absolute inset-3 border border-[#ffd700]/30 rounded-r-md"></div>
                                <div className="absolute inset-4 border-2 border-[#ffd700] rounded-r-md"></div>

                                <div className="text-[#ffd700] font-serif text-4xl font-bold tracking-widest text-center relative z-10">
                                    MEMORIES<br />
                                    <span className="text-2xl font-light opacity-80">2025</span>
                                </div>

                                <Sparkles className="text-[#ffd700] mt-6 animate-pulse" size={40} />
                                <div className="absolute bottom-8 text-[#ffd700]/60 text-xs font-serif tracking-widest">BYEORY YEARBOOK</div>
                            </div>

                            {/* Back Face (Left Page Content) */}
                            <div
                                className="absolute inset-0 bg-[#fdfbf7] rounded-l-lg shadow-inner backface-hidden z-10"
                                style={{ transform: 'rotateY(180deg)' }}
                            >
                                <div className="h-full w-full p-8 flex flex-col justify-center items-center text-center">
                                    <div className="mb-6">
                                        <Sparkles className="text-indigo-400 w-8 h-8 mx-auto" strokeWidth={1} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-6 font-serif">Dear. You</h3>
                                    <p className="text-gray-600 leading-8 font-serif">
                                        당신의 하루하루가 모여<br />
                                        하나의 별자리가 되었습니다.<br />
                                        <br />
                                        2025년의 모든 순간들이<br />
                                        당신에게 따뜻한 위로와<br />
                                        힘이 되었기를 바랍니다.
                                    </p>
                                    <div className="mt-10 text-indigo-900 font-script text-3xl">Thank you</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Hint Text */}
                        <AnimatePresence>
                            {stage === 'album' && (
                                <motion.div
                                    className="absolute -bottom-16 left-0 right-0 text-center"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <p className="text-[var(--text-tertiary)] text-sm animate-bounce mb-2">
                                        앨범을 눌러서 열어보세요
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                </motion.div>
            </div>

            <style>{`
                .preserve-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
                .font-script {
                    font-family: 'Dancing Script', cursive, sans-serif;
                }
            `}</style>

            {/* Detail Modal */}
            <AnimatePresence>
                {isDetailOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50"
                    >
                        <YearModalPage onClose={() => setIsDetailOpen(false)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default YearPage;
