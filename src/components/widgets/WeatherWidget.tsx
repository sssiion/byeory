import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Settings, MapPin } from 'lucide-react';
import { useState } from 'react';
import type { WidgetSize } from '../../App';

interface WeatherWidgetProps {
  size: WidgetSize;
}

export function WeatherWidget({ size }: WeatherWidgetProps) {
  const [design, setDesign] = useState<'modern' | 'card' | 'minimal' | 'glass'>('modern');
  const [showSettings, setShowSettings] = useState(false);

  if (size === 'small') {
    return (
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm text-gray-900">날씨</h3>
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
              onClick={() => setDesign('modern')}
              className={`px-2 py-1 text-xs rounded ${design === 'modern' ? 'bg-yellow-500 text-white' : 'bg-gray-100'}`}
            >
              모던
            </button>
            <button
              onClick={() => setDesign('card')}
              className={`px-2 py-1 text-xs rounded ${design === 'card' ? 'bg-yellow-500 text-white' : 'bg-gray-100'}`}
            >
              카드
            </button>
            <button
              onClick={() => setDesign('minimal')}
              className={`px-2 py-1 text-xs rounded ${design === 'minimal' ? 'bg-yellow-500 text-white' : 'bg-gray-100'}`}
            >
              미니멀
            </button>
          </div>
        ) : (
          <div className="text-center flex-1 flex flex-col items-center justify-center">
            <Sun className="w-8 h-8 text-yellow-500 mb-1" />
            <p className="text-xl text-gray-900">23°</p>
          </div>
        )}
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-yellow-500" />
            <h3 className="text-gray-900">날씨</h3>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {showSettings && (
          <div className="mb-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => setDesign('modern')}
              className={`px-3 py-2 text-xs rounded-lg transition-colors ${design === 'modern' ? 'bg-yellow-500 text-white' : 'bg-gray-100'}`}
            >
              모던
            </button>
            <button
              onClick={() => setDesign('card')}
              className={`px-3 py-2 text-xs rounded-lg transition-colors ${design === 'card' ? 'bg-yellow-500 text-white' : 'bg-gray-100'}`}
            >
              카드
            </button>
            <button
              onClick={() => setDesign('minimal')}
              className={`px-3 py-2 text-xs rounded-lg transition-colors ${design === 'minimal' ? 'bg-yellow-500 text-white' : 'bg-gray-100'}`}
            >
              미니멀
            </button>
            <button
              onClick={() => setDesign('glass')}
              className={`px-3 py-2 text-xs rounded-lg transition-colors ${design === 'glass' ? 'bg-yellow-500 text-white' : 'bg-gray-100'}`}
            >
              글래스
            </button>
          </div>
        )}

        <div className="flex-1">
          {design === 'modern' && (
            <div className="h-full bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 flex flex-col items-center justify-center">
              <Sun className="w-16 h-16 text-yellow-500 mb-3" />
              <p className="text-4xl text-gray-900 mb-1">23°</p>
              <p className="text-sm text-gray-600 mb-3">맑음</p>
              <div className="flex gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  45%
                </span>
                <span className="flex items-center gap-1">
                  <Wind className="w-3 h-3" />
                  2m/s
                </span>
              </div>
            </div>
          )}

          {design === 'card' && (
            <div className="h-full bg-white border-2 border-yellow-200 rounded-xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-3xl text-gray-900">23°C</p>
                  <p className="text-sm text-gray-500">맑음</p>
                </div>
                <Sun className="w-12 h-12 text-yellow-500" />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">45%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <Wind className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">2m/s</p>
                </div>
              </div>
            </div>
          )}

          {design === 'minimal' && (
            <div className="h-full flex flex-col items-center justify-center">
              <Sun className="w-20 h-20 text-yellow-500 mb-4" />
              <p className="text-5xl text-gray-900 mb-2">23°</p>
              <div className="h-px bg-gray-300 w-16 my-2" />
              <p className="text-sm text-gray-500 uppercase tracking-wider">Clear</p>
            </div>
          )}

          {design === 'glass' && (
            <div className="h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl p-4 text-white backdrop-blur relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 backdrop-blur" />
              <div className="relative z-10 h-full flex flex-col items-center justify-center">
                <Sun className="w-16 h-16 mb-3 drop-shadow-lg" />
                <p className="text-4xl mb-2 drop-shadow">23°</p>
                <p className="text-sm opacity-90">맑음</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
          <MapPin className="w-3 h-3" />
          서울시 강남구
        </div>
      </div>
    );
  }

  // Large size
  const weekForecast = [
    { day: '월', icon: <Sun className="w-6 h-6 text-yellow-500" />, high: 24, low: 15, condition: '맑음' },
    { day: '화', icon: <Cloud className="w-6 h-6 text-gray-400" />, high: 22, low: 14, condition: '구름많음' },
    { day: '수', icon: <CloudRain className="w-6 h-6 text-blue-400" />, high: 19, low: 12, condition: '비' },
    { day: '목', icon: <Sun className="w-6 h-6 text-yellow-500" />, high: 23, low: 14, condition: '맑음' },
    { day: '금', icon: <Cloud className="w-6 h-6 text-gray-400" />, high: 21, low: 13, condition: '구름많음' },
    { day: '토', icon: <Sun className="w-6 h-6 text-yellow-500" />, high: 25, low: 16, condition: '맑음' },
    { day: '일', icon: <Sun className="w-6 h-6 text-yellow-500" />, high: 26, low: 17, condition: '맑음' },
  ];

  const hourlyForecast = [
    { time: '지금', temp: 23, icon: <Sun className="w-5 h-5 text-yellow-500" /> },
    { time: '14시', temp: 24, icon: <Sun className="w-5 h-5 text-yellow-500" /> },
    { time: '15시', temp: 25, icon: <Sun className="w-5 h-5 text-yellow-500" /> },
    { time: '16시', temp: 24, icon: <Cloud className="w-5 h-5 text-gray-400" /> },
    { time: '17시', temp: 23, icon: <Cloud className="w-5 h-5 text-gray-400" /> },
    { time: '18시', temp: 22, icon: <Cloud className="w-5 h-5 text-gray-400" /> },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900">날씨</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              서울시 강남구
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
            위치 변경
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-4 grid grid-cols-4 gap-2">
          <button
            onClick={() => setDesign('modern')}
            className={`px-4 py-2 rounded-lg transition-all ${design === 'modern' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            모던
          </button>
          <button
            onClick={() => setDesign('card')}
            className={`px-4 py-2 rounded-lg transition-all ${design === 'card' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            카드
          </button>
          <button
            onClick={() => setDesign('minimal')}
            className={`px-4 py-2 rounded-lg transition-all ${design === 'minimal' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            미니멀
          </button>
          <button
            onClick={() => setDesign('glass')}
            className={`px-4 py-2 rounded-lg transition-all ${design === 'glass' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            글래스
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {design === 'modern' && (
          <>
            {/* Current Weather */}
            <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 rounded-xl p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Sun className="w-20 h-20 text-yellow-500" />
                    <div>
                      <p className="text-6xl text-gray-900">23°</p>
                      <p className="text-gray-600 mt-1">맑음</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">체감온도</p>
                  <p className="text-3xl text-gray-800">22°</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 pt-4 border-t border-orange-200">
                <div className="text-center">
                  <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">습도</p>
                  <p className="text-sm text-gray-900">45%</p>
                </div>
                <div className="text-center">
                  <Wind className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">풍속</p>
                  <p className="text-sm text-gray-900">2m/s</p>
                </div>
                <div className="text-center">
                  <Eye className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">가시거리</p>
                  <p className="text-sm text-gray-900">10km</p>
                </div>
                <div className="text-center">
                  <Sun className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">자외선</p>
                  <p className="text-sm text-gray-900">보통</p>
                </div>
              </div>
            </div>

            {/* Hourly Forecast */}
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">시간별 예보</p>
              <div className="flex gap-2 overflow-x-auto">
                {hourlyForecast.map((hour, i) => (
                  <div key={i} className="min-w-[80px] bg-white rounded-lg p-3 text-center border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">{hour.time}</p>
                    <div className="flex justify-center mb-2">{hour.icon}</div>
                    <p className="text-sm text-gray-900">{hour.temp}°</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Forecast */}
            <div>
              <p className="text-sm text-gray-700 mb-2">주간 예보</p>
              <div className="space-y-2">
                {weekForecast.map((day, i) => (
                  <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-700 w-8">{day.day}</p>
                    <div className="flex-1 flex justify-center">{day.icon}</div>
                    <p className="text-xs text-gray-500 w-16 text-center">{day.condition}</p>
                    <div className="flex gap-3 text-sm">
                      <span className="text-gray-900">{day.high}°</span>
                      <span className="text-gray-400">{day.low}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {design === 'card' && (
          <div className="grid grid-cols-2 gap-4">
            {/* Current Weather Card */}
            <div className="col-span-2 bg-white border-2 border-yellow-200 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-6xl text-gray-900 mb-2">23°C</p>
                  <p className="text-lg text-gray-600">맑음</p>
                  <p className="text-sm text-gray-500 mt-1">체감 22°C</p>
                </div>
                <Sun className="w-24 h-24 text-yellow-500" />
              </div>
            </div>

            {/* Detail Cards */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <Droplets className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-gray-600">습도</p>
              <p className="text-2xl text-gray-900">45%</p>
            </div>
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
              <Wind className="w-8 h-8 text-gray-500 mb-2" />
              <p className="text-sm text-gray-600">풍속</p>
              <p className="text-2xl text-gray-900">2m/s</p>
            </div>
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
              <Eye className="w-8 h-8 text-purple-500 mb-2" />
              <p className="text-sm text-gray-600">가시거리</p>
              <p className="text-2xl text-gray-900">10km</p>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <Sun className="w-8 h-8 text-yellow-500 mb-2" />
              <p className="text-sm text-gray-600">자외선</p>
              <p className="text-2xl text-gray-900">보통</p>
            </div>

            {/* Weekly in cards */}
            {weekForecast.slice(0, 4).map((day, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-sm text-gray-600 mb-2">{day.day}요일</p>
                <div className="flex justify-center mb-2">{day.icon}</div>
                <p className="text-xs text-gray-500 mb-1">{day.condition}</p>
                <p className="text-sm text-gray-900">{day.high}° / {day.low}°</p>
              </div>
            ))}
          </div>
        )}

        {design === 'minimal' && (
          <div className="flex flex-col items-center justify-center h-full">
            <Sun className="w-32 h-32 text-yellow-500 mb-8" />
            <p className="text-9xl text-gray-900 mb-4">23°</p>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent w-64 mb-4" />
            <p className="text-2xl text-gray-600 uppercase tracking-[0.3em] mb-8">Clear Sky</p>
            
            <div className="grid grid-cols-4 gap-8 mt-8">
              <div className="text-center">
                <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Humidity</p>
                <p className="text-xl text-gray-900">45%</p>
              </div>
              <div className="text-center">
                <Wind className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Wind</p>
                <p className="text-xl text-gray-900">2m/s</p>
              </div>
              <div className="text-center">
                <Eye className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Visibility</p>
                <p className="text-xl text-gray-900">10km</p>
              </div>
              <div className="text-center">
                <Sun className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">UV Index</p>
                <p className="text-xl text-gray-900">5</p>
              </div>
            </div>
          </div>
        )}

        {design === 'glass' && (
          <div className="relative h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md" />
            
            {/* Animated background circles */}
            <div className="absolute top-10 right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 left-10 w-60 h-60 bg-white/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            
            <div className="relative z-10 h-full p-6 text-white flex flex-col">
              {/* Current Weather */}
              <div className="bg-white/20 backdrop-blur rounded-2xl p-8 mb-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-7xl drop-shadow-lg mb-2">23°</p>
                    <p className="text-2xl opacity-90">맑음</p>
                  </div>
                  <Sun className="w-24 h-24 drop-shadow-lg" />
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <Droplets className="w-6 h-6 mx-auto mb-1 drop-shadow" />
                    <p className="text-xs opacity-80 mb-1">습도</p>
                    <p className="text-lg">45%</p>
                  </div>
                  <div className="text-center">
                    <Wind className="w-6 h-6 mx-auto mb-1 drop-shadow" />
                    <p className="text-xs opacity-80 mb-1">풍속</p>
                    <p className="text-lg">2m/s</p>
                  </div>
                  <div className="text-center">
                    <Eye className="w-6 h-6 mx-auto mb-1 drop-shadow" />
                    <p className="text-xs opacity-80 mb-1">가시거리</p>
                    <p className="text-lg">10km</p>
                  </div>
                  <div className="text-center">
                    <Sun className="w-6 h-6 mx-auto mb-1 drop-shadow" />
                    <p className="text-xs opacity-80 mb-1">자외선</p>
                    <p className="text-lg">보통</p>
                  </div>
                </div>
              </div>

              {/* Hourly */}
              <div className="mb-4">
                <p className="text-sm opacity-90 mb-2 drop-shadow">시간별 예보</p>
                <div className="flex gap-2 overflow-x-auto">
                  {hourlyForecast.map((hour, i) => (
                    <div key={i} className="min-w-[80px] bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                      <p className="text-xs opacity-80 mb-2">{hour.time}</p>
                      <div className="flex justify-center mb-2 invert">{hour.icon}</div>
                      <p className="text-sm">{hour.temp}°</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly */}
              <div className="flex-1 overflow-auto">
                <p className="text-sm opacity-90 mb-2 drop-shadow">주간 예보</p>
                <div className="space-y-2">
                  {weekForecast.map((day, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/20 backdrop-blur rounded-lg p-3">
                      <p className="text-sm w-8">{day.day}</p>
                      <div className="flex-1 flex justify-center invert">{day.icon}</div>
                      <p className="text-xs w-16 text-center opacity-90">{day.condition}</p>
                      <div className="flex gap-3 text-sm">
                        <span>{day.high}°</span>
                        <span className="opacity-60">{day.low}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
