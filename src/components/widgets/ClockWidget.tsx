import { Clock, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { WidgetSize } from '../../App';

interface ClockWidgetProps {
  size: WidgetSize;
}

export function ClockWidget({ size }: ClockWidgetProps) {
  const [time, setTime] = useState(new Date());
  const [design, setDesign] = useState<'digital' | 'analog' | 'minimal' | 'gradient'>('digital');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date, includeSeconds = false) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getAnalogClockStyle = () => {
    const hours = time.getHours() % 12;
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    const hourDeg = (hours * 30) + (minutes * 0.5);
    const minuteDeg = minutes * 6;
    const secondDeg = seconds * 6;

    return { hourDeg, minuteDeg, secondDeg };
  };

  if (size === 'small') {
    return (
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm text-gray-900">시계</h3>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Settings className="w-3 h-3 text-gray-400" />
          </button>
        </div>

        {showSettings ? (
          <div className="flex-1 flex flex-col gap-1 py-2">
            <button
              onClick={() => setDesign('digital')}
              className={`px-2 py-1 text-xs rounded ${design === 'digital' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              디지털
            </button>
            <button
              onClick={() => setDesign('analog')}
              className={`px-2 py-1 text-xs rounded ${design === 'analog' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              아날로그
            </button>
            <button
              onClick={() => setDesign('minimal')}
              className={`px-2 py-1 text-xs rounded ${design === 'minimal' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              미니멀
            </button>
          </div>
        ) : (
          <div className="text-center flex-1 flex items-center justify-center">
            {design === 'analog' ? (
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-2 border-gray-300 rounded-full" />
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-1 bg-gray-400 top-1 left-1/2 -translate-x-1/2"
                    style={{ transform: `rotate(${i * 30}deg) translateY(0px)`, transformOrigin: 'center 32px' }}
                  />
                ))}
                <div
                  className="absolute w-0.5 h-5 bg-gray-800 bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom rounded-full"
                  style={{ transform: `translateX(-50%) rotate(${getAnalogClockStyle().hourDeg}deg)` }}
                />
                <div
                  className="absolute w-0.5 h-6 bg-blue-600 bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom rounded-full"
                  style={{ transform: `translateX(-50%) rotate(${getAnalogClockStyle().minuteDeg}deg)` }}
                />
                <div className="absolute w-1.5 h-1.5 bg-blue-600 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
            ) : (
              <p className="text-xl text-gray-900">{formatTime(time)}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (size === 'medium') {
    const { hourDeg, minuteDeg, secondDeg } = getAnalogClockStyle();

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="text-gray-900">시계</h3>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {showSettings && (
          <div className="mb-3 flex gap-2">
            <button
              onClick={() => setDesign('digital')}
              className={`flex-1 px-3 py-2 text-xs rounded-lg transition-colors ${design === 'digital' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              디지털
            </button>
            <button
              onClick={() => setDesign('analog')}
              className={`flex-1 px-3 py-2 text-xs rounded-lg transition-colors ${design === 'analog' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              아날로그
            </button>
            <button
              onClick={() => setDesign('minimal')}
              className={`flex-1 px-3 py-2 text-xs rounded-lg transition-colors ${design === 'minimal' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              미니멀
            </button>
            <button
              onClick={() => setDesign('gradient')}
              className={`flex-1 px-3 py-2 text-xs rounded-lg transition-colors ${design === 'gradient' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              그라데이션
            </button>
          </div>
        )}

        <div className="flex-1 flex items-center justify-center">
          {design === 'digital' && (
            <div className="text-center">
              <p className="text-4xl text-gray-900 mb-2">{formatTime(time, true)}</p>
              <p className="text-sm text-gray-500">
                {time.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
              </p>
            </div>
          )}

          {design === 'analog' && (
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 border-4 border-gray-300 rounded-full shadow-inner" />
              <div className="absolute inset-2 border-2 border-gray-200 rounded-full" />
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-3 bg-gray-400 top-2 left-1/2 -translate-x-1/2"
                  style={{ transform: `rotate(${i * 30}deg) translateY(0px)`, transformOrigin: 'center 78px' }}
                />
              ))}
              {[...Array(60)].map((_, i) => (
                i % 5 !== 0 && (
                  <div
                    key={i}
                    className="absolute w-0.5 h-1.5 bg-gray-300 top-2 left-1/2 -translate-x-1/2"
                    style={{ transform: `rotate(${i * 6}deg) translateY(0px)`, transformOrigin: 'center 78px' }}
                  />
                )
              ))}
              <div
                className="absolute w-1.5 h-12 bg-gray-800 bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom rounded-full"
                style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
              />
              <div
                className="absolute w-1 h-16 bg-blue-600 bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom rounded-full"
                style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
              />
              <div
                className="absolute w-0.5 h-16 bg-red-500 bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom"
                style={{ transform: `translateX(-50%) rotate(${secondDeg}deg)` }}
              />
              <div className="absolute w-3 h-3 bg-blue-600 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow" />
            </div>
          )}

          {design === 'minimal' && (
            <div className="text-center">
              <p className="text-6xl text-gray-900 tracking-tight">{formatTime(time)}</p>
              <div className="mt-4 h-px bg-gray-300 w-32 mx-auto" />
              <p className="text-sm text-gray-400 mt-4 tracking-widest uppercase">
                {time.toLocaleDateString('ko-KR', { weekday: 'long' })}
              </p>
            </div>
          )}

          {design === 'gradient' && (
            <div className="text-center w-full">
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                <p className="text-5xl mb-3">{formatTime(time, true)}</p>
                <p className="text-sm opacity-90">
                  {time.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Large size
  const { hourDeg, minuteDeg, secondDeg } = getAnalogClockStyle();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900">시계</h3>
            <p className="text-sm text-gray-500">실시간 시간 표시</p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {showSettings && (
        <div className="mb-4 grid grid-cols-4 gap-2">
          <button
            onClick={() => setDesign('digital')}
            className={`px-4 py-2 rounded-lg transition-all ${design === 'digital' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            디지털
          </button>
          <button
            onClick={() => setDesign('analog')}
            className={`px-4 py-2 rounded-lg transition-all ${design === 'analog' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            아날로그
          </button>
          <button
            onClick={() => setDesign('minimal')}
            className={`px-4 py-2 rounded-lg transition-all ${design === 'minimal' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            미니멀
          </button>
          <button
            onClick={() => setDesign('gradient')}
            className={`px-4 py-2 rounded-lg transition-all ${design === 'gradient' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            그라데이션
          </button>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center">
        {design === 'digital' && (
          <div className="text-center w-full">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 text-white shadow-2xl">
              <p className="text-7xl mb-4 font-mono tracking-wider">{formatTime(time, true)}</p>
              <p className="text-xl opacity-80">{formatDate(time)}</p>
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                  <p className="text-3xl">{time.getHours()}</p>
                  <p className="text-xs opacity-70 mt-1">시</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                  <p className="text-3xl">{time.getMinutes()}</p>
                  <p className="text-xs opacity-70 mt-1">분</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                  <p className="text-3xl">{time.getSeconds()}</p>
                  <p className="text-xs opacity-70 mt-1">초</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {design === 'analog' && (
          <div className="relative w-80 h-80">
            {/* Outer circle */}
            <div className="absolute inset-0 border-8 border-gray-300 rounded-full shadow-2xl bg-white" />
            <div className="absolute inset-4 border-4 border-gray-200 rounded-full" />
            
            {/* Hour markers */}
            {[...Array(12)].map((_, i) => (
              <div key={i} className="absolute top-8 left-1/2 -translate-x-1/2 text-center" style={{ transform: `rotate(${i * 30}deg) translateY(0px)`, transformOrigin: 'center 152px' }}>
                <span className="inline-block text-xl text-gray-700" style={{ transform: `rotate(-${i * 30}deg)` }}>
                  {i === 0 ? 12 : i}
                </span>
              </div>
            ))}
            
            {/* Minute markers */}
            {[...Array(60)].map((_, i) => (
              i % 5 !== 0 && (
                <div
                  key={i}
                  className="absolute w-1 h-3 bg-gray-300 top-4 left-1/2 -translate-x-1/2"
                  style={{ transform: `rotate(${i * 6}deg) translateY(0px)`, transformOrigin: 'center 156px' }}
                />
              )
            ))}
            
            {/* Hour hand */}
            <div
              className="absolute w-3 h-24 bg-gray-800 bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom rounded-full shadow-lg"
              style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
            />
            
            {/* Minute hand */}
            <div
              className="absolute w-2 h-32 bg-blue-600 bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom rounded-full shadow-lg"
              style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
            />
            
            {/* Second hand */}
            <div
              className="absolute w-1 h-36 bg-red-500 bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom shadow"
              style={{ transform: `translateX(-50%) rotate(${secondDeg}deg)` }}
            />
            
            {/* Center dot */}
            <div className="absolute w-6 h-6 bg-blue-600 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-white shadow-lg" />
            
            {/* Digital display at bottom */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-mono">
              {formatTime(time, true)}
            </div>
          </div>
        )}

        {design === 'minimal' && (
          <div className="text-center w-full">
            <p className="text-9xl text-gray-900 tracking-tighter mb-8">{formatTime(time)}</p>
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent flex-1" />
              <p className="text-xl text-gray-400 tracking-[0.3em] uppercase">{time.getSeconds()}s</p>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent flex-1" />
            </div>
            <p className="text-2xl text-gray-500 tracking-widest uppercase mb-4">
              {time.toLocaleDateString('ko-KR', { weekday: 'long' })}
            </p>
            <p className="text-lg text-gray-400">
              {time.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        )}

        {design === 'gradient' && (
          <div className="text-center w-full">
            <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-12 text-white shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <p className="text-8xl mb-6 drop-shadow-lg">{formatTime(time, true)}</p>
                <p className="text-2xl mb-8 opacity-90">{formatDate(time)}</p>
                
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white/20 backdrop-blur rounded-2xl p-6">
                    <p className="text-5xl mb-2">{String(time.getHours()).padStart(2, '0')}</p>
                    <p className="text-sm uppercase tracking-wider opacity-80">Hours</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-2xl p-6">
                    <p className="text-5xl mb-2">{String(time.getMinutes()).padStart(2, '0')}</p>
                    <p className="text-sm uppercase tracking-wider opacity-80">Minutes</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-2xl p-6">
                    <p className="text-5xl mb-2">{String(time.getSeconds()).padStart(2, '0')}</p>
                    <p className="text-sm uppercase tracking-wider opacity-80">Seconds</p>
                  </div>
                </div>
              </div>
              
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
