import { WidgetWrapper } from '../Common';

interface OceanWaveProps {
    gridSize?: { w: number; h: number };
}

export function OceanWave({ gridSize }: OceanWaveProps) {
    return (
        <WidgetWrapper className="bg-sky-900 border-none relative overflow-hidden p-0">
            {/* Sky Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 to-sky-700 h-[60%]">
                {/* Moon/Sun Reflect */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
            </div>

            {/* Waves Container */}
            <div className="absolute bottom-0 left-0 right-0 h-[50%] overflow-hidden">

                {/* Back Wave */}
                <div className="absolute bottom-0 w-[200%] h-full animate-wave-slow opacity-60">
                    <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
                        <path fill="#0ea5e9" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>

                {/* Middle Wave */}
                <div className="absolute bottom-[-10%] w-[200%] h-full animate-wave opacity-80">
                    <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
                        <path fill="#0284c7" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>

                {/* Front Wave */}
                <div className="absolute bottom-[-20%] w-[200%] h-full animate-wave-fast">
                    <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
                        <path fill="#0369a1" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            </div>

            <style>{`
                @keyframes wave {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-wave { animation: wave 15s linear infinite; }
                .animate-wave-slow { animation: wave 25s linear infinite; }
                .animate-wave-fast { animation: wave 10s linear infinite; }
             `}</style>
        </WidgetWrapper>
    );
}
