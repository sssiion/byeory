import { Cloud, CloudRain, Sun, Wind, Droplets, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { WidgetSize } from '../../App';

interface WeatherClockWidgetProps {
  size: WidgetSize;
}

export function WeatherClockWidget({ size }: WeatherClockWidgetProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: size === 'large' ? '2-digit' : undefined
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

  if (size === 'small') {
    return (
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-yellow-500" />
          <h3 className="text-sm text-gray-900">날씨·시계</h3>
        </div>
        <div className="text-center">
          <p className="text-xl text-gray-900">{formatTime(time)}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Sun className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-700">23°</span>
          </div>
        </div>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Sun className="w-5 h-5 text-yellow-500" />
          <h3 className="text-gray-900">날씨 & 시계</h3>
        </div>

        {/* Current Time */}
        <div className="text-center mb-4">
          <p className="text-3xl text-gray-900 mb-1">{formatTime(time)}</p>
          <p className="text-sm text-gray-500">
            {time.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })}
          </p>
        </div>

        {/* Current Weather */}
        <div className="flex-1 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 flex flex-col items-center justify-center">
          <Sun className="w-16 h-16 text-yellow-500 mb-2" />
          <p className="text-3xl text-gray-900 mb-1">23°</p>
          <p className="text-sm text-gray-600">맑음</p>
          <div className="flex gap-3 mt-3 text-xs text-gray-500">
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

        <div className="mt-3 text-center text-xs text-gray-500">
          서울시 강남구
        </div>
      </div>
    );
  }

  // Large size
  const weekForecast = [
    { day: '월', icon: <Sun className="w-6 h-6 text-yellow-500" />, high: 24, low: 15 },
    { day: '화', icon: <Cloud className="w-6 h-6 text-gray-400" />, high: 22, low: 14 },
    { day: '수', icon: <CloudRain className="w-6 h-6 text-blue-400" />, high: 19, low: 12 },
    { day: '목', icon: <Sun className="w-6 h-6 text-yellow-500" />, high: 23, low: 14 },
    { day: '금', icon: <Cloud className="w-6 h-6 text-gray-400" />, high: 21, low: 13 },
    { day: '토', icon: <Sun className="w-6 h-6 text-yellow-500" />, high: 25, low: 16 },
    { day: '일', icon: <Sun className="w-6 h-6 text-yellow-500" />, high: 26, low: 17 },
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
            <h3 className="text-gray-900">날씨 & 시계</h3>
            <p className="text-sm text-gray-500">서울시 강남구</p>
          </div>
        </div>
        <button className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
          위치 변경
        </button>
      </div>

      {/* Current Time & Date */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 mb-4">
        <div className="text-center">
          <p className="text-4xl text-gray-900 mb-2">{formatTime(time)}</p>
          <p className="text-sm text-gray-600">{formatDate(time)}</p>
        </div>
      </div>

      {/* Current Weather */}
      <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Sun className="w-20 h-20 text-yellow-500" />
              <div>
                <p className="text-5xl text-gray-900">23°</p>
                <p className="text-gray-600 mt-1">맑음</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">체감온도</p>
            <p className="text-2xl text-gray-800">22°</p>
          </div>
        </div>

        {/* Weather Details */}
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
            <div
              key={i}
              className="min-w-[80px] bg-white rounded-lg p-3 text-center border border-gray-200"
            >
              <p className="text-xs text-gray-500 mb-2">{hour.time}</p>
              <div className="flex justify-center mb-2">{hour.icon}</div>
              <p className="text-sm text-gray-900">{hour.temp}°</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Forecast */}
      <div className="flex-1 overflow-auto">
        <p className="text-sm text-gray-700 mb-2">주간 예보</p>
        <div className="space-y-2">
          {weekForecast.map((day, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200"
            >
              <p className="text-sm text-gray-700 w-8">{day.day}</p>
              <div className="flex-1 flex justify-center">{day.icon}</div>
              <div className="flex gap-3 text-sm">
                <span className="text-gray-900">{day.high}°</span>
                <span className="text-gray-400">{day.low}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update Time */}
      <div className="mt-3 text-center text-xs text-gray-400">
        마지막 업데이트: {time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}
