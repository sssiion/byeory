import React, { useState, useRef, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Music, Zap, BookOpen, Droplets, X } from 'lucide-react';
import { WidgetWrapper as SharedWidgetWrapper } from './Shared';

// Common wrapper style - Adapter for SharedWidgetWrapper to maintain existing layout
const WidgetWrapper = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <SharedWidgetWrapper className={`items-center justify-center p-2 ${className}`}>
    {children}
  </SharedWidgetWrapper>
);

// --- 1. Moon Phase (달의 위상) ---
export function MoonPhase() {
  const [phase, setPhase] = useState(0);
  const [phaseName, setPhaseName] = useState('');

  useEffect(() => {
    // Simple Moon Phase Calculation
    // Reference: Known New Moon at 2000-01-06 18:14 UTC
    const calculateMoonPhase = () => {
      const date = new Date();

      // Simple calculation logic (Conway's algorithm adaptation or similar)
      // Or simply calculating days from a known new moon
      const knownNewMoon = new Date('2000-01-06T18:14:00Z');
      const cycleLength = 29.53058867;
      const diffTime = date.getTime() - knownNewMoon.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      const currentCycle = diffDays % cycleLength;

      // Phase from 0 to 1 (0 = New Moon, 0.5 = Full Moon, 1 = New Moon)
      const p = currentCycle / cycleLength;
      setPhase(p);

      if (p < 0.05 || p > 0.95) setPhaseName('New Moon');
      else if (p < 0.2) setPhaseName('Waxing Crescent');
      else if (p < 0.3) setPhaseName('First Quarter');
      else if (p < 0.45) setPhaseName('Waxing Gibbous');
      else if (p < 0.55) setPhaseName('Full Moon');
      else if (p < 0.7) setPhaseName('Waning Gibbous');
      else if (p < 0.8) setPhaseName('Last Quarter');
      else setPhaseName('Waning Crescent');
    };

    calculateMoonPhase();
  }, []);

  // SVG Mask calculation to simulate shadow
  // We simulate phase by shifting a shadow circle
  // This is a simplified visual representation


  return (
    <WidgetWrapper className="bg-[#0f172a] border-[#1e293b] text-slate-200">
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="relative w-24 h-24 mb-2">
          {/* Base Moon (Dark) */}
          <div className="absolute inset-0 rounded-full bg-slate-800 shadow-inner border border-slate-700"></div>

          {/* Lit Moon (White) with Mask */}
          {/* Implementing a high quality CSS Moon Phase is complex. 
              Let's use a simpler approximation: 
              We have a moon circle. We slide a shadow over it.
          */}
          <div className="w-full h-full rounded-full overflow-hidden relative shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <div
              className="w-full h-full bg-slate-100 rounded-full"
              style={{
                opacity: phase < 0.5
                  ? phase * 2 // 0 to 1
                  : (1 - phase) * 2 // 1 to 0
              }}
            ></div>

            {/* Textural overlay */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          </div>

          {/* Phase Indicator Dot */}
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full shadow-[0_0_5px_yellow]"
          ></div>
        </div>

        <div className="text-center">
          <h3 className="text-sm font-serif text-slate-100">{phaseName}</h3>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            {Math.round(phase * 29.53 * 10) / 10} days old
          </p>
        </div>
      </div>
    </WidgetWrapper>
  );
}

// --- 2. Window View (창밖 풍경) ---
export function WindowView() {
  const [weather, setWeather] = useState<'sunny' | 'rainy' | 'snowy' | 'night'>('sunny');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Set initial state based on real time
    const hour = new Date().getHours();
    if (hour < 6 || hour > 18) setWeather('night');

    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const toggleWeather = () => {
    const states: ('sunny' | 'rainy' | 'snowy' | 'night')[] = ['sunny', 'rainy', 'snowy', 'night'];
    const next = states[(states.indexOf(weather) + 1) % states.length];
    setWeather(next);
  };

  return (
    <WidgetWrapper className="p-0 border-4 border-[#5d4037] bg-[#5d4037] rounded-t-full relative overflow-hidden group">
      {/* Window Frame Inner */}
      <div
        className="w-full h-full bg-sky-300 relative overflow-hidden cursor-pointer"
        onClick={toggleWeather}
      >
        {/* Sky Backgrounds */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${weather === 'night' ? 'opacity-100' : 'opacity-0'} bg-gradient-to-b from-[#0f172a] to-[#334155]`}>
          <div className="absolute top-4 right-8 w-8 h-8 rounded-full bg-yellow-100 shadow-[0_0_20px_white]"></div>
          {/* Stars */}
          <div className="absolute top-10 left-10 w-0.5 h-0.5 bg-white animate-pulse"></div>
          <div className="absolute top-6 left-20 w-0.5 h-0.5 bg-white animate-pulse delay-75"></div>
          <div className="absolute top-16 right-16 w-1 h-1 bg-white animate-pulse delay-150"></div>
        </div>

        <div className={`absolute inset-0 transition-opacity duration-1000 ${weather === 'sunny' ? 'opacity-100' : 'opacity-0'} bg-gradient-to-b from-sky-400 to-sky-200`}>
          <div className="absolute top-[-10px] left-[-10px] w-20 h-20 rounded-full bg-yellow-400 blur-xl opacity-80"></div>
          <Sun className="absolute top-4 left-4 text-yellow-100 w-12 h-12 opacity-90 animate-spin-slow" />
        </div>

        <div className={`absolute inset-0 transition-opacity duration-1000 ${weather === 'rainy' ? 'opacity-100' : 'opacity-0'} bg-gradient-to-b from-slate-600 to-slate-400`}>
          {/* Rain CSS */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20 animate-slide-down"></div>
        </div>

        <div className={`absolute inset-0 transition-opacity duration-1000 ${weather === 'snowy' ? 'opacity-100' : 'opacity-0'} bg-gradient-to-b from-slate-300 to-white`}>
          {/* Snow CSS simplified */}
          <div className="absolute w-2 h-2 bg-white rounded-full top-2 left-1/4 animate-fall"></div>
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-0 left-1/2 animate-fall delay-700"></div>
          <div className="absolute w-2 h-2 bg-white rounded-full top-4 left-3/4 animate-fall delay-300"></div>
        </div>

        {/* Landscape (Hill) */}
        <div className={`absolute bottom-0 w-full h-1/3 rounded-t-[50%] scale-150 transition-colors duration-1000 
          ${weather === 'snowy' ? 'bg-white' : weather === 'night' ? 'bg-[#1e293b]' : 'bg-[#4ade80]'}`}></div>

        {/* Tree */}
        <div className="absolute bottom-4 right-8 w-1 h-12 bg-[#3e2723]">
          <div className={`absolute -top-8 -left-4 w-10 h-10 rounded-full transition-colors duration-1000
             ${weather === 'snowy' ? 'bg-white' : weather === 'night' ? 'bg-[#0f172a]' : 'bg-[#166534]'}`}></div>
          <div className={`absolute -top-10 -left-1 w-8 h-8 rounded-full transition-colors duration-1000
             ${weather === 'snowy' ? 'bg-gray-100' : weather === 'night' ? 'bg-[#0f172a]' : 'bg-[#15803d]'}`}></div>
        </div>

        {/* Window Crossbar */}
        <div className="absolute inset-0 pointer-events-none border-4 border-[#5d4037]/20"></div>
        <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-[#5d4037] -translate-x-1/2 shadow-sm"></div>
        <div className="absolute top-1/2 left-0 right-0 h-2 bg-[#5d4037] -translate-y-1/2 shadow-sm"></div>
      </div>

      {/* Clock overlay */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-[#5d4037] text-[#d7ccc8] text-[10px] px-2 py-0.5 rounded-full font-mono border border-[#8d6e63]">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </WidgetWrapper>
  );
}

// --- 3. Snow Globe (스노우볼) ---
export function SnowGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isShaking, setIsShaking] = useState(false);
  const particles = useRef<{ x: number, y: number, r: number, d: number, speed: number }[]>([]);
  const requestRef = useRef<number>(0);

  // Initialize particles
  useEffect(() => {
    for (let i = 0; i < 60; i++) {
      particles.current.push({
        x: Math.random() * 200,
        y: Math.random() * 200,
        r: Math.random() * 2 + 1,
        d: Math.random() * 10,
        speed: Math.random() * 0.5 + 0.5
      });
    }
  }, []);

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw particles
    ctx.fillStyle = "white";
    ctx.beginPath();

    for (let i = 0; i < particles.current.length; i++) {
      const p = particles.current[i];
      ctx.moveTo(p.x, p.y);
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);

      // Update position
      if (isShaking) {
        // Shake effect: move up randomly
        p.y -= Math.random() * 5;
        p.x += (Math.random() - 0.5) * 5;
      } else {
        // Gravity
        p.y += p.speed;
        p.x += Math.sin(p.d) * 0.5; // Sway
        p.d += 0.05;
      }

      // Boundary check
      if (p.y > canvas.height) {
        p.y = -5;
        p.x = Math.random() * canvas.width;
      }
      if (p.y < -10) {
        p.y = canvas.height;
      }
      if (p.x > canvas.width) {
        p.x = 0;
      }
      if (p.x < 0) {
        p.x = canvas.width;
      }
    }

    ctx.fill();
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isShaking]); // Re-bind when shake state changes

  const handleShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500); // Shake for 0.5s
  };

  return (
    <WidgetWrapper className="bg-transparent border-0 shadow-none overflow-visible">
      <div
        onClick={handleShake}
        className={`relative w-full h-full cursor-pointer transition-transform ${isShaking ? 'animate-shake' : ''}`}
      >
        {/* Globe Glass */}
        <div className="w-full h-[85%] rounded-full bg-gradient-to-br from-blue-200/30 to-blue-400/10 border-4 border-white/50 backdrop-blur-[2px] relative overflow-hidden shadow-inner">
          {/* Inner Scene (Snowman) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-6 h-6 bg-white rounded-full shadow-sm relative">
              <div className="absolute top-2 left-1.5 w-0.5 h-0.5 bg-black rounded-full"></div>
              <div className="absolute top-2 right-1.5 w-0.5 h-0.5 bg-black rounded-full"></div>
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1 h-0.5 bg-orange-500 rounded-full"></div>
            </div>
            <div className="w-10 h-10 bg-white rounded-full -mt-2 shadow-sm flex items-center justify-center">
              <div className="w-1 h-1 bg-gray-300 rounded-full mb-2"></div>
              <div className="w-1 h-1 bg-gray-300 rounded-full mt-2"></div>
            </div>
          </div>

          {/* Canvas for Snow */}
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* Reflection Highlight */}
          <div className="absolute top-4 left-4 w-6 h-4 bg-white/40 rounded-full transform -rotate-45 blur-sm"></div>
        </div>

        {/* Base */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-[20%] bg-[#8d6e63] rounded-t-lg rounded-b-xl shadow-lg border-t-4 border-[#6d4c41]">
          <div className="w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_12px)]"></div>
        </div>
      </div>
    </WidgetWrapper>
  );
}

// --- 4. Digital Plant (반려 식물) ---
export function DigitalPlant({ onUpdate, level = 1, exp = 0, name = '새싹이' }: { onUpdate?: (data: any) => void, level?: number, exp?: number, name?: string }) {
  const [isWatering, setIsWatering] = useState(false);
  const maxExp = level * 100;

  const water = () => {
    if (isWatering) return;
    setIsWatering(true);

    // Calculate new exp
    let newExp = exp + 20;
    let newLevel = level;

    if (newExp >= maxExp) {
      newExp = newExp - maxExp;
      newLevel = Math.min(level + 1, 4); // Max level 4
    }

    // Delay update for animation
    setTimeout(() => {
      if (onUpdate) onUpdate({ level: newLevel, exp: newExp });
      setIsWatering(false);
    }, 1000);
  };

  const getPlantImage = () => {
    if (level === 1) return (
      <div className="text-2xl animate-bounce">🌱</div>
    );
    if (level === 2) return (
      <div className="text-4xl animate-pulse">🌿</div>
    );
    if (level === 3) return (
      <div className="relative">
        <div className="text-5xl">🪴</div>
        <div className="absolute -top-2 -right-2 text-xl animate-bounce delay-100">✨</div>
      </div>
    );
    return (
      <div className="relative">
        <div className="text-6xl">🌺</div>
        <div className="absolute -top-2 -right-2 text-xl animate-spin-slow">🐝</div>
      </div>
    );
  };

  return (
    <WidgetWrapper className="bg-green-50/50 border-green-100">
      <div className="w-full h-full flex flex-col items-center justify-between py-2">
        <div className="flex justify-between w-full px-2 items-center">
          <span className="text-xs font-bold text-green-800">{name}</span>
          <span className="text-[10px] bg-green-200 px-1.5 py-0.5 rounded-full text-green-800">Lv.{level}</span>
        </div>

        <div className="relative flex-1 flex items-center justify-center w-full">
          {/* Watering Can Animation */}
          {isWatering && (
            <div className="absolute top-0 right-4 text-2xl animate-pour z-10">
              🚿
              <div className="absolute top-full left-1 w-full flex justify-center">
                <div className="w-0.5 h-4 bg-blue-400 animate-drip"></div>
              </div>
            </div>
          )}

          {/* Plant */}
          <div className="transition-transform duration-500 hover:scale-110 cursor-pointer" onClick={water}>
            {getPlantImage()}
          </div>
        </div>

        <div className="w-full px-2 flex flex-col gap-1">
          <div className="flex justify-between text-[8px] text-green-600">
            <span>EXP</span>
            <span>{Math.floor((exp / maxExp) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-green-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${(exp / maxExp) * 100}%` }}
            ></div>
          </div>
          <button
            onClick={water}
            disabled={isWatering || level >= 4}
            className="mt-1 w-full py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-1"
          >
            <Droplets size={10} />
            {level >= 4 ? 'Max Level' : 'Water'}
          </button>
        </div>
      </div>
    </WidgetWrapper>
  );
}


// --- 1. Worry Shredder (근심 파쇄기) ---
export function WorryShredder() {
  const [text, setText] = useState('');
  const [isShredding, setIsShredding] = useState(false);

  const handleShred = () => {
    if (!text) return;
    setIsShredding(true);
    setTimeout(() => {
      setText('');
      setIsShredding(false);
    }, 2000);
  };

  return (
    <WidgetWrapper className="bg-gray-800 border-gray-700">
      <div className="w-full h-full flex flex-col items-center justify-between p-2">
        <div className="w-full text-center text-gray-400 text-xs font-mono mb-2">WORRY SHREDDER</div>

        <div className="relative w-full flex-1 flex flex-col items-center overflow-hidden">
          {/* Paper Input */}
          <div
            className={`w-3/4 bg-white p-2 text-xs text-gray-800 shadow-md transition-all duration-[2000ms] ease-in-out ${isShredding ? 'translate-y-[150%] opacity-0' : 'translate-y-0 opacity-100'}`}
            style={{ minHeight: '60px' }}
          >
            {isShredding ? (
              <div className="w-full h-full flex gap-1 overflow-hidden">
                {/* Shred lines simulation */}
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex-1 bg-gray-200 h-full transform translate-y-2"></div>
                ))}
              </div>
            ) : (
              <textarea
                className="w-full h-full resize-none outline-none bg-transparent placeholder:text-gray-300"
                placeholder="걱정을 입력하세요..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isShredding}
              />
            )}
          </div>

          {/* Shredder Mouth */}
          <div className="absolute bottom-0 w-full h-4 bg-black/50 backdrop-blur-sm z-10 border-t-2 border-red-500/50"></div>
        </div>

        <button
          onClick={handleShred}
          disabled={!text || isShredding}
          className="mt-2 w-full py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white text-xs font-bold rounded shadow-lg transition-colors"
        >
          {isShredding ? 'SHREDDING...' : 'DESTROY WORRY'}
        </button>
      </div>
    </WidgetWrapper>
  );
}

// --- 2. Scrap Note (찢어진 노트) ---
export function ScrapNote({ onUpdate, text = '' }: { onUpdate?: (data: any) => void, text?: string }) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onUpdate) onUpdate({ text: e.target.value });
  };

  return (
    <div className="w-full h-full bg-[#f0e6d2] p-4 shadow-md relative overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 5% 100%, 0 95%)' }}>
      <div className="absolute top-0 left-0 w-full h-6 bg-[#e6dcc8] border-b border-[#d4c9b3] flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-[#c0b090] mx-1"></div>
        <div className="w-2 h-2 rounded-full bg-[#c0b090] mx-1"></div>
      </div>
      <textarea
        className="w-full h-full mt-4 bg-transparent resize-none outline-none text-[#5c4a35] jua-regular text-sm leading-6"
        placeholder="Type something..."
        value={text}
        onChange={handleChange}
        style={{ backgroundImage: 'linear-gradient(transparent 23px, #d4c9b3 24px)', backgroundSize: '100% 24px' }}
      />
    </div>
  );
}

// --- 3. Dream Log (꿈 기록장) ---
export function DreamLog({ onUpdate, logs = [] }: { onUpdate?: (data: any) => void, logs?: { date: string, content: string }[] }) {
  const [mode, setMode] = useState<'list' | 'write'>('list');
  const [input, setInput] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const addLog = () => {
    if (!input) return;
    const newLogs = [{ date, content: input }, ...logs];
    if (onUpdate) onUpdate({ logs: newLogs });
    setInput('');
    setMode('list');
  };

  const deleteLog = (index: number) => {
    const newLogs = logs.filter((_, i) => i !== index);
    if (onUpdate) onUpdate({ logs: newLogs });
  };

  return (
    <WidgetWrapper className="bg-[#1a1b26] border-[#24283b]">
      <div className="w-full h-full flex flex-col text-gray-300">
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-700">
          <span className="text-xs font-bold text-purple-400">DREAM LOG 🌙</span>
          <button
            onClick={() => setMode(mode === 'list' ? 'write' : 'list')}
            className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded hover:bg-purple-500/30 transition-colors"
          >
            {mode === 'list' ? '+ New' : 'List'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
          {mode === 'list' ? (
            <div className="space-y-2">
              {logs.length === 0 && <p className="text-[10px] text-gray-600 text-center py-4">No dreams recorded yet.</p>}
              {logs.map((log, i) => (
                <div key={i} className="bg-[#24283b] p-2 rounded border border-gray-700 group relative">
                  <p className="text-[10px] text-purple-400 mb-1">{log.date}</p>
                  <p className="text-xs line-clamp-2">{log.content}</p>
                  <button
                    onClick={() => deleteLog(i)}
                    className="absolute top-1 right-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2 h-full">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-[#24283b] border border-gray-700 rounded p-1 text-xs text-gray-300 outline-none focus:border-purple-500"
              />
              <textarea
                className="flex-1 bg-[#24283b] border border-gray-700 rounded p-2 text-xs text-gray-300 resize-none outline-none focus:border-purple-500"
                placeholder="What did you dream?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button onClick={addLog} className="bg-purple-600 text-white py-1 rounded text-xs hover:bg-purple-700">
                Save Dream
              </button>
            </div>
          )}
        </div>
      </div>
    </WidgetWrapper>
  );
}

// --- 4. Dessert Case (간식 진열대) ---
export function DessertCase({ onUpdate, items = [] }: { onUpdate?: (data: any) => void, items?: string[] }) {
  const desserts = ['🍩', '🍪', '🍰', '🧁', '🍮', '🍭', '🍫', '🍦'];

  const addItem = (icon: string) => {
    if (items.length >= 9) return; // Limit
    if (onUpdate) onUpdate({ items: [...items, icon] });
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    if (onUpdate) onUpdate({ items: newItems });
  };

  return (
    <WidgetWrapper className="bg-pink-50 border-pink-100">
      <div className="w-full h-full flex flex-col">
        <div className="bg-white/50 rounded-lg p-2 flex-1 mb-2 grid grid-cols-3 grid-rows-3 gap-2 border-2 border-pink-200 border-dashed">
          {items.map((item, i) => (
            <div key={i} onClick={() => removeItem(i)} className="flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform animate-in zoom-in">
              {item}
            </div>
          ))}
          {items.length < 9 && (
            <div className="flex items-center justify-center text-pink-200 text-xs">Empty</div>
          )}
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {desserts.map(d => (
            <button
              key={d}
              onClick={() => addItem(d)}
              className="min-w-[30px] h-[30px] bg-white rounded-full shadow-sm hover:bg-pink-100 flex items-center justify-center text-sm transition-colors"
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </WidgetWrapper>
  );
}

// --- 5. Cat Chaser (따라오는 고양이) ---
export function CatChaser() {
  const [eyes, setEyes] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const distance = Math.min(5, Math.hypot(e.clientX - centerX, e.clientY - centerY) / 10);

      setEyes({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <WidgetWrapper className="bg-[#333]">
      <div ref={containerRef} className="relative w-32 h-32 flex items-center justify-center">
        {/* Cat Face */}
        <div className="w-24 h-20 bg-black rounded-3xl relative">
          {/* Ears */}
          <div className="absolute -top-3 left-0 w-8 h-8 bg-black rounded-sm transform rotate-12"></div>
          <div className="absolute -top-3 right-0 w-8 h-8 bg-black rounded-sm transform -rotate-12"></div>

          {/* Eyes Container */}
          <div className="absolute top-6 left-0 right-0 flex justify-center gap-4">
            {/* Left Eye */}
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center overflow-hidden relative shadow-[0_0_10px_rgba(250,204,21,0.5)]">
              <div
                className="w-1.5 h-4 bg-black rounded-full"
                style={{ transform: `translate(${eyes.x}px, ${eyes.y}px)` }}
              ></div>
            </div>
            {/* Right Eye */}
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center overflow-hidden relative shadow-[0_0_10px_rgba(250,204,21,0.5)]">
              <div
                className="w-1.5 h-4 bg-black rounded-full"
                style={{ transform: `translate(${eyes.x}px, ${eyes.y}px)` }}
              ></div>
            </div>
          </div>

          {/* Nose */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-2 h-1 bg-pink-400 rounded-full"></div>
        </div>
      </div>
    </WidgetWrapper>
  );
}

// --- 6. D-Day Balloon (풍선 디데이) ---
export function DDayBalloon({ onUpdate, targetDate, title = "D-Day" }: { onUpdate?: (data: any) => void, targetDate?: string, title?: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const today = new Date();
  const target = targetDate ? new Date(targetDate) : new Date(new Date().setDate(today.getDate() + 7)); // Default +7 days

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Scale balloon based on days left (Closer = Bigger)
  // Max scale 1.2 (D-Day), Min scale 0.5 (100 days left)
  const scale = Math.max(0.5, Math.min(1.2, 1.2 - (diffDays / 100) * 0.7));
  const isPast = diffDays < 0;

  const handleSave = (newTitle: string, newDate: string) => {
    if (onUpdate) onUpdate({ title: newTitle, targetDate: newDate });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <WidgetWrapper className="bg-sky-50">
        <div className="w-full flex flex-col gap-2 p-2">
          <input
            type="text"
            defaultValue={title}
            className="w-full text-xs p-1 border rounded"
            placeholder="Event Name"
            id="dday-title"
          />
          <input
            type="date"
            defaultValue={targetDate}
            className="w-full text-xs p-1 border rounded"
            id="dday-date"
          />
          <button
            onClick={() => {
              const t = (document.getElementById('dday-title') as HTMLInputElement).value;
              const d = (document.getElementById('dday-date') as HTMLInputElement).value;
              handleSave(t, d);
            }}
            className="bg-sky-500 text-white text-xs py-1 rounded"
          >
            Save
          </button>
        </div>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper className="bg-sky-100 relative overflow-hidden group">
      <button
        onClick={() => setIsEditing(true)}
        className="absolute top-2 right-2 text-sky-300 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <SettingsIcon size={12} />
      </button>

      <div className="flex flex-col items-center justify-center h-full relative z-0">
        <div
          className="relative transition-transform duration-500 ease-out"
          style={{ transform: `scale(${scale}) translateY(${isPast ? 20 : 0}px)` }}
        >
          {/* Balloon SVG */}
          <svg width="60" height="80" viewBox="0 0 60 80" className={`drop-shadow-lg ${isPast ? 'grayscale opacity-50' : 'text-red-500'}`}>
            <path d="M30 0C13.4315 0 0 13.4315 0 30C0 46.5685 30 70 30 70C30 70 60 46.5685 60 30C60 13.4315 46.5685 0 30 0Z" fill="currentColor" />
            <path d="M25 10C25 10 35 15 35 25" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.3" />
            <line x1="30" y1="70" x2="30" y2="100" stroke="#999" strokeWidth="1" />
          </svg>
          <div className="absolute top-8 left-0 w-full text-center text-white font-bold text-xs">
            {isPast ? 'End' : `D-${diffDays}`}
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="font-bold text-sky-800 text-sm">{title}</p>
          <p className="text-[10px] text-sky-600">{targetDate || 'Set Date'}</p>
        </div>
      </div>

      {/* Clouds bg */}
      <Cloud className="absolute -bottom-2 -left-4 text-white w-16 h-16 opacity-50" />
      <Cloud className="absolute top-4 -right-4 text-white w-12 h-12 opacity-30" />
    </WidgetWrapper>
  );
}

const SettingsIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);


// --- Existing Simple Widgets ---
export const FavoriteCharacter = React.memo(function FavoriteCharacter({ src, name }: { src: string; name: string }) {
  return (
    <WidgetWrapper className="bg-gradient-to-br from-pink-50 to-white">
      <div className="relative w-full aspect-square max-w-[100px] rounded-full overflow-hidden border-2 border-[var(--btn-bg)] shadow-md transition-transform hover:scale-105">
        <img src={src} alt={name} className="w-full h-full object-cover" />
      </div>
      <span className="font-semibold text-xs md:text-sm text-[var(--text-primary)] mt-2 text-center truncate w-full">{name}</span>
    </WidgetWrapper>
  );
});

export const ColorChip = React.memo(function ColorChip({ color, name, code }: { color: string; name: string; code: string }) {
  return (
    <div className="w-full h-full bg-white shadow-sm rounded-lg overflow-hidden flex flex-col border border-gray-100">
      <div className="flex-1 w-full" style={{ backgroundColor: color }} />
      <div className="p-2 bg-white w-full">
        <p className="font-bold text-gray-800 text-xs truncate">{name}</p>
        <p className="text-gray-500 text-[10px] truncate">{code}</p>
      </div>
    </div>
  );
});

export const MovieScene = React.memo(function MovieScene({ src, quote }: { src: string; quote: string }) {
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-md group border border-gray-800">
      <img src={src} alt="Movie Scene" className="w-full h-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent pt-8 pb-2 px-2 text-center">
        <p className="text-white text-xs md:text-sm font-medium font-serif italic drop-shadow-md line-clamp-2">
          "{quote}"
        </p>
      </div>
    </div>
  );
});

export const Polaroid = React.memo(function Polaroid({ src, date, rotation = 0 }: { src: string; date: string; rotation?: number }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div
        className="bg-white p-2 pb-6 shadow-lg w-full max-w-[160px] aspect-[4/5] flex flex-col transition-transform hover:scale-105 hover:z-10"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="w-full aspect-square bg-gray-100 overflow-hidden mb-2 shadow-inner">
          <img src={src} alt="Polaroid" className="w-full h-full object-cover" />
        </div>
        <div className="text-center mt-auto">
          <p className="text-gray-400 jua-regular text-[10px] truncate">{date}</p>
        </div>
      </div>
    </div>
  );
});

export const TicketStub = React.memo(function TicketStub({ title, date, seat }: { title: string; date: string; seat: string }) {
  return (
    <div className="w-full h-full flex bg-[#fffbf0] rounded-lg overflow-hidden shadow-sm border border-[#e5e0d0]">
      <div className="flex-1 p-2 flex flex-col justify-center border-r-2 border-dashed border-[#dcdcdc] relative min-w-0">
        <h3 className="font-bold text-[#2c2c2c] text-sm truncate leading-tight tracking-tighter">{title}</h3>
        <p className="text-[#888] text-[10px] mt-1 truncate">{date}</p>
        <div className="absolute -top-2 -right-1.5 w-3 h-3 bg-[var(--bg-card)] rounded-full border border-[#e5e0d0]" />
        <div className="absolute -bottom-2 -right-1.5 w-3 h-3 bg-[var(--bg-card)] rounded-full border border-[#e5e0d0]" />
      </div>
      <div className="w-8 md:w-12 flex flex-col items-center justify-center bg-[#2c2c2c] text-[#fffbf0] p-1">
        <span className="text-[10px] font-bold rotate-90 whitespace-nowrap">{seat}</span>
      </div>
    </div>
  );
});

export const InstantBooth = React.memo(function InstantBooth({ images, date }: { images: string[]; date: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-1">
      <div className="h-full max-h-full aspect-[1/2.5] bg-[#1a1a1a] p-1.5 pb-3 shadow-lg flex flex-col gap-1 items-center justify-between overflow-hidden rounded-sm">
        {images.slice(0, 4).map((img, i) => (
          <div key={i} className="w-full aspect-[3/2] bg-gray-800 overflow-hidden flex-shrink-0">
            <img src={img} alt={`Cut ${i + 1}`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
          </div>
        ))}
        <span className="text-white/50 text-[8px] tracking-widest uppercase shrink-0">{date}</span>
      </div>
    </div>
  );
});

export const FilmStrip = React.memo(function FilmStrip({ images }: { images: string[] }) {
  return (
    <div className="relative w-full h-full bg-black p-1 md:p-2 overflow-x-auto scrollbar-hide rounded-lg flex items-center shadow-lg">
      <div className="flex gap-2 min-w-max h-full">
        {images.map((img, i) => (
          <div key={i} className="relative h-full aspect-[3/2] bg-gray-900 border-y-2 md:border-y-4 border-dashed border-gray-700 flex-shrink-0">
            <img src={img} alt={`Film ${i}`} className="h-full w-full object-cover opacity-70 hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
});

export const TextScroller = React.memo(function TextScroller({ text }: { text: string }) {
  return (
    <div className="w-full h-full bg-black text-[#00ff00] p-2 rounded-lg overflow-hidden font-mono flex items-center relative border-2 md:border-4 border-gray-800 shadow-inner">
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
      <div className="whitespace-nowrap animate-[scroll-left_10s_linear_infinite] text-sm md:text-xl font-bold tracking-widest">
        {text}
      </div>
    </div>
  );
});

export const NeonSign = React.memo(function NeonSign({ text, color = '#ff00ff' }: { text: string; color?: string }) {
  const glowStyle = {
    textShadow: `
      0 0 5px #fff,
      0 0 10px #fff,
      0 0 20px ${color},
      0 0 40px ${color},
      0 0 80px ${color}
    `,
    fontFamily: 'cursive',
    color: '#fff'
  };

  return (
    <div className="w-full h-full bg-black/95 rounded-xl border border-gray-800 flex items-center justify-center p-2 overflow-hidden shadow-2xl">
      <h2 className="text-xl md:text-3xl font-bold text-center truncate animate-pulse" style={glowStyle}>
        {text}
      </h2>
    </div>
  );
});

export const Candle = React.memo(function Candle() {
  return (
    <WidgetWrapper className="bg-gray-900 border-gray-800">
      <div className="flex flex-col items-center justify-end h-full relative min-h-[60px] w-full">
        <style>{`
          @keyframes flicker {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            25% { transform: scale(0.9, 1.1) skewX(2deg); opacity: 0.8; }
            50% { transform: scale(1.1, 0.9) skewX(-2deg); opacity: 1; }
            75% { transform: scale(0.95, 1.05); opacity: 0.85; }
          }
        `}</style>

        <div
          className="w-4 h-8 bg-gradient-to-t from-orange-500 via-yellow-400 to-white rounded-[50%] absolute top-[20%] blur-[2px]"
          style={{ animation: 'flicker 1.5s infinite alternate' }}
        >
          <div className="absolute inset-0 bg-yellow-200 blur-md opacity-40 animate-pulse"></div>
        </div>

        <div className="w-0.5 h-3 bg-black/50 mt-8 mb-1 z-10"></div>

        <div className="w-10 h-16 bg-gradient-to-r from-[#fdfbf7] to-[#e6dfd1] rounded-t-sm shadow-inner relative mt-1">
          <div className="w-full h-2 bg-gradient-to-r from-[#fdfbf7] to-[#e6dfd1] rounded-[50%] absolute -top-1"></div>
        </div>
      </div>
    </WidgetWrapper>
  );
});

// --- 1. Switch Board (똑딱이)
export function SwitchBoard() {
  const [isOn, setIsOn] = useState(false);

  return (
    <WidgetWrapper className={`${isOn ? 'bg-[#fffbeb]' : 'bg-[#1a1a1a]'} transition-colors duration-300`}>
      <button
        onClick={() => setIsOn(!isOn)}
        className={`relative w-16 h-28 rounded-xl border-4 ${isOn ? 'border-[#e5e5e5] bg-white' : 'border-[#333] bg-[#2a2a2a]'} shadow-xl transition-all flex flex-col items-center justify-between py-2`}
      >
        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
        <div className={`w-8 h-12 rounded-lg border-2 ${isOn ? 'bg-white border-gray-200 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] translate-y-[-2px]' : 'bg-[#333] border-black shadow-[0_-4px_0_0_rgba(255,255,255,0.1)] translate-y-[2px]'} transition-all`}></div>
        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
      </button>
      <span className={`mt-2 text-xs font-bold ${isOn ? 'text-gray-800' : 'text-gray-400'}`}>
        {isOn ? 'ON' : 'OFF'}
      </span>
    </WidgetWrapper>
  );
}

// --- 2. Compliment Jar (칭찬 저금통)
export function ComplimentJar() {
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

// --- 3. Fortune Cookie (포춘 쿠키)
export function FortuneCookie() {
  const [isCracked, setIsCracked] = useState(false);
  const fortunes = ["대길! 🍀", "행운 가득!", "기대해!", "좋은 예감"];
  const [fortune, setFortune] = useState("");

  const crack = () => {
    if (!isCracked) {
      setFortune(fortunes[Math.floor(Math.random() * fortunes.length)]);
      setIsCracked(true);
    } else {
      setIsCracked(false);
    }
  };

  return (
    <WidgetWrapper className="bg-amber-50">
      <div onClick={crack} className="cursor-pointer text-center group">
        <div className="text-5xl transition-transform group-hover:scale-110 mb-2">
          {isCracked ? '🥠' : '🥠'}
        </div>
        {isCracked ? (
          <div className="bg-white border border-amber-200 p-1 px-2 text-xs text-amber-800 animate-in zoom-in font-serif">
            {fortune}
          </div>
        ) : (
          <span className="text-xs text-amber-800/50">Click me!</span>
        )}
      </div>
    </WidgetWrapper>
  );
}

// --- 4. Emotional Weather (마음 날씨)
export function EmotionalWeather() {
  const [weather, setWeather] = useState<'sun' | 'cloud' | 'rain'>('sun');

  return (
    <WidgetWrapper className={`${weather === 'sun' ? 'bg-blue-50' : weather === 'rain' ? 'bg-gray-800' : 'bg-gray-100'} transition-colors duration-500`}>
      <div className="flex-1 flex items-center justify-center">
        {weather === 'sun' && <Sun className="w-10 h-10 text-orange-500 animate-spin-slow" />}
        {weather === 'cloud' && <Cloud className="w-10 h-10 text-gray-500" />}
        {weather === 'rain' && <CloudRain className="w-10 h-10 text-blue-300 animate-bounce" />}
      </div>
      <div className="flex gap-2 bg-white/50 p-1 rounded-full backdrop-blur-sm">
        <button onClick={() => setWeather('sun')} className="p-1 hover:bg-white rounded-full transition-colors"><Sun size={14} className="text-orange-500" /></button>
        <button onClick={() => setWeather('cloud')} className="p-1 hover:bg-white rounded-full transition-colors"><Cloud size={14} className="text-gray-500" /></button>
        <button onClick={() => setWeather('rain')} className="p-1 hover:bg-white rounded-full transition-colors"><CloudRain size={14} className="text-blue-500" /></button>
      </div>
    </WidgetWrapper>
  );
}

// --- 5. Battery Widget (내 에너지)
export const BatteryWidget = React.memo(function BatteryWidget() {
  const [level, setLevel] = useState(50);

  return (
    <WidgetWrapper className="bg-gray-50">
      <div className="flex flex-col items-center gap-2 w-full px-2">
        <div className="flex items-center gap-1 font-mono text-xs font-bold text-gray-600">
          <Zap size={14} className={level < 20 ? 'text-red-500' : 'text-yellow-500'} fill="currentColor" />
          {level}%
        </div>
        <div className="relative w-full h-8 border-2 border-gray-300 rounded-lg p-0.5 flex items-center">
          <div
            className={`h-full rounded-md transition-all duration-300 ${level < 20 ? 'bg-red-400' : level < 60 ? 'bg-yellow-400' : 'bg-green-400'}`}
            style={{ width: `${level}%` }}
          />
          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1 h-3 bg-gray-300 rounded-r-sm"></div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--btn-bg)]"
        />
      </div>
    </WidgetWrapper>
  );
});

// --- 6. OOTD Sketch (오늘의 옷)
export const OOTDSketch = React.memo(function OOTDSketch() {
  const [topIdx, setTopIdx] = useState(0);
  const [bottomIdx, setBottomIdx] = useState(0);
  const tops = ['👕', '👚', '🧥', '👔', '👗'];
  const bottoms = ['👖', '🩳', '👙', '🩰', '👢'];

  return (
    <WidgetWrapper className="bg-purple-50">
      <h3 className="text-[10px] font-bold text-purple-400 mb-1 tracking-widest">OOTD</h3>
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => setTopIdx((p) => (p + 1) % tops.length)}
          className="text-3xl hover:scale-110 transition-transform p-1 bg-white rounded-lg shadow-sm"
        >
          {tops[topIdx]}
        </button>
        <button
          onClick={() => setBottomIdx((p) => (p + 1) % bottoms.length)}
          className="text-3xl hover:scale-110 transition-transform p-1 bg-white rounded-lg shadow-sm"
        >
          {bottoms[bottomIdx]}
        </button>
      </div>
    </WidgetWrapper>
  );
});

// --- 7. Book Cover (읽는 책)
export const BookCover = React.memo(function BookCover() {
  const [page] = useState(42);
  const total = 300;
  const progress = Math.min(100, Math.round((page / total) * 100));

  return (
    <WidgetWrapper className="bg-[#f5e6d3]">
      <div className="flex items-start gap-2 w-full h-full">
        <div className="w-12 h-16 bg-[#8b4513] rounded-sm shadow-md flex items-center justify-center text-white/50">
          <BookOpen size={16} />
        </div>
        <div className="flex-1 flex flex-col justify-between h-full py-1">
          <div>
            <p className="text-xs font-serif font-bold text-[#5c4033] line-clamp-1">데미안</p>
            <p className="text-[10px] text-[#8b4513]/70">H. Hesse</p>
          </div>
          <div className="w-full">
            <div className="flex justify-between text-[8px] text-[#5c4033] mb-0.5">
              <span>p.{page}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#d2b48c] rounded-full overflow-hidden">
              <div className="h-full bg-[#8b4513]" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
});

// --- 8. Bubble Wrap (뽁뽁이)
export function BubbleWrap() {
  const [popped, setPopped] = useState<Set<number>>(new Set());

  const pop = (i: number) => {
    if (!popped.has(i)) {
      const next = new Set(popped);
      next.add(i);
      setPopped(next);
    }
  };

  return (
    <WidgetWrapper className="bg-blue-50/50 p-2 overflow-auto"> {/* 스크롤 허용 */}
      <div className="grid grid-cols-20 gap-2 w-full min-w-[400px]"> {/* 열 개수를 줄여 개별 원의 공간 확보 */}
        {Array.from({ length: 200 }).map((_, i) => ( // 200개 유지
          <button
            key={i}
            onClick={() => pop(i)}
            className={`aspect-square rounded-full shadow-inner border transition-all ${popped.has(i)
              ? 'bg-transparent border-blue-100 scale-90'
              : 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 hover:scale-105 active:scale-95'
              } w-full`} // 부모 그리드 너비에 맞춰 꽉 채움
          />
        ))}
      </div>
    </WidgetWrapper>
  );
}

// --- 9. Daily Stamp (참잘했어요)
export function DailyStamp() {
  const [stamps, setStamps] = useState<{ x: number, y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const addStamp = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStamps([...stamps, { x, y }]);
  };

  return (
    <WidgetWrapper className="bg-white p-0 overflow-hidden relative group">
      <div
        ref={containerRef}
        onClick={addStamp}
        className="w-full h-full relative cursor-cell bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"
      >
        <span className="absolute top-2 left-2 text-[10px] text-gray-400 font-mono">DAILY LOG</span>
        {stamps.map((s, i) => (
          <div
            key={i}
            className="absolute w-8 h-8 flex items-center justify-center text-red-500 font-bold border-2 border-red-500 rounded-full text-[8px] rotate-[-15deg] animate-in zoom-in fade-in duration-200 pointer-events-none"
            style={{ left: s.x - 16, top: s.y - 16 }}
          >
            Good!
          </div>
        ))}
        {stamps.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs pointer-events-none group-hover:hidden">
            Click anywhere!
          </div>
        )}
      </div>
    </WidgetWrapper>
  );
}

// --- 10. Transparent Spacer (투명 위젯)
export function TransparentSpacer() {
  return <div className="w-full h-full"></div>;
}

// --- 11. LP Player (턴테이블)
export function LPPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <WidgetWrapper className="bg-[#2a2a2a] p-3">
      <div className="relative w-full aspect-square flex items-center justify-center">
        <div className={`w-full h-full rounded-full bg-black border-4 border-[#1a1a1a] flex items-center justify-center shadow-xl ${isPlaying ? 'animate-spin-slow' : ''}`}>
          {/* LP Lines */}
          <div className="absolute inset-2 rounded-full border border-gray-800 opacity-50"></div>
          <div className="absolute inset-4 rounded-full border border-gray-800 opacity-50"></div>
          <div className="absolute inset-6 rounded-full border border-gray-800 opacity-50"></div>

          {/* Center Label */}
          <div className="w-1/3 h-1/3 rounded-full bg-yellow-500 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
          </div>
        </div>

        {/* Tone Arm (Simple visual) */}
        <div className={`absolute top-0 right-0 w-1 h-1/2 bg-gray-400 origin-top transition-transform duration-500 ${isPlaying ? 'rotate-12' : 'rotate-[-20deg]'}`}></div>
      </div>

      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="mt-2 text-white/80 hover:text-white transition-colors"
      >
        {isPlaying ? <div className="w-3 h-3 bg-current rounded-sm" /> : <Music size={14} />}
      </button>
      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </WidgetWrapper>
  );
}
