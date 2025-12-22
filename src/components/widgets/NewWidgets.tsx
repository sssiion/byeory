import React, { useState, useEffect } from 'react';
import {
  PenTool, Calendar, Shuffle, Image as ImageIcon,
  History, User, Sun, CloudRain, Bell,
  Link, Flame, Lock, Send, MoreHorizontal, Check
} from 'lucide-react';
import { WidgetWrapper } from './Shared';

// 1. AI Diary (AI 다이어리)
export function AIDiary() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState('');

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setResult("오늘의 일기에서 '설렘'과 '기대'가 느껴지네요! 🌸 긍정적인 에너지가 가득해요.");
    }, 2000);
  };

  return (
    <WidgetWrapper title="AI 감정 분석관" className="bg-gradient-to-br from-indigo-50 to-white">
      <div className="p-3 h-full flex flex-col gap-2">
        <textarea
          className="w-full flex-1 bg-white/50 border border-indigo-100 rounded-lg p-2 text-xs resize-none outline-none focus:border-indigo-300 transition-colors"
          placeholder="오늘 무슨 일이 있었나요?"
        />
        {result ? (
          <div className="bg-indigo-100 p-2 rounded-lg text-[10px] text-indigo-800 animate-in fade-in slide-in-from-bottom-2">
            🤖 {result}
          </div>
        ) : (
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-1.5 bg-indigo-500 text-white text-xs rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-1"
          >
            {isAnalyzing ? <span className="animate-pulse">분석중...</span> : <><PenTool size={10} /> AI 분석하기</>}
          </button>
        )}
      </div>
    </WidgetWrapper>
  );
}

// 2. Daily Diary (오늘의 일기)
export const DailyDiary = React.memo(function DailyDiary() {
  return (
    <WidgetWrapper className="bg-[#fff9e6]">
      <div className="w-full h-full p-4 flex flex-col relative">
        <div className="absolute top-0 left-0 w-full h-4 bg-[#e6dcc8] flex items-center justify-center gap-4 border-b border-[#d4c9b3]">
          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
        </div>
        <div className="mt-4 flex-1">
          <div className="flex justify-between items-end border-b border-gray-300 pb-1 mb-2">
            <span className="text-xl font-serif font-bold text-gray-800">Dec 12</span>
            <span className="text-xs text-gray-500 font-serif">Thursday</span>
          </div>
          <textarea
            className="w-full h-[calc(100%-40px)] bg-transparent resize-none outline-none text-xs leading-5 text-gray-700 font-serif"
            placeholder="Write your story..."
            style={{ backgroundImage: 'linear-gradient(transparent 19px, #e5e5e5 20px)', backgroundSize: '100% 20px' }}
          />
        </div>
      </div>
    </WidgetWrapper>
  );
});

// 3. Random Diary (랜덤 일기)
export function RandomDiary() {
  const [isOpen, setIsOpen] = useState(false);
  const diary = { date: '2023. 10. 15', content: "가을 바람이 참 좋았던 날. 공원에서 자전거를 탔다." };

  return (
    <WidgetWrapper className="bg-gray-800 text-gray-200">
      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
        {!isOpen ? (
          <>
            <Shuffle className="w-8 h-8 mb-2 text-gray-400" />
            <p className="text-xs text-gray-400 mb-3">과거의 나를 만나보세요</p>
            <button
              onClick={() => setIsOpen(true)}
              className="px-4 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-full hover:bg-gray-200 transition-colors"
            >
              랜덤 펼쳐보기
            </button>
          </>
        ) : (
          <div className="w-full h-full bg-white text-gray-800 rounded-lg p-3 relative shadow-lg animate-in zoom-in duration-300 flex flex-col text-left">
            <div className="flex justify-between items-center mb-2 border-b pb-1">
              <span className="text-[10px] font-bold text-gray-500">{diary.date}</span>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={12} /></button>
            </div>
            <p className="text-xs leading-relaxed font-serif">{diary.content}</p>
          </div>
        )}
      </div>
    </WidgetWrapper>
  );
}

// 4. Time Machine (타임캡슐)
export const TimeMachine = React.memo(function TimeMachine() {
  return (
    <WidgetWrapper className="bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-amber-900 border-amber-950">
      <div className="w-full h-full flex flex-col items-center justify-center text-amber-100 relative">
        <Lock className="w-10 h-10 mb-2 text-amber-400" />
        <h3 className="text-sm font-bold tracking-widest text-amber-200">TIME CAPSULE</h3>
        <div className="bg-black/30 px-3 py-1 rounded mt-2 backdrop-blur-sm border border-white/10">
          <span className="font-mono text-xs">D-365</span>
        </div>
        <p className="text-[9px] mt-2 opacity-60">2026.12.12 Open</p>
      </div>
    </WidgetWrapper>
  );
});

// 5. Photo Gallery (내 사진들)
export const PhotoGallery = React.memo(function PhotoGallery() {
  const images = [
    'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=300&h=300&fit=crop'
  ];

  return (
    <WidgetWrapper title="My Gallery">
      <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5 bg-white">
        {images.map((src, i) => (
          <div key={i} className="relative overflow-hidden group cursor-pointer">
            <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
          </div>
        ))}
      </div>
    </WidgetWrapper>
  );
});

// 6. Exchange Diary (교환 일기)
export function ExchangeDiary() {
  return (
    <WidgetWrapper className="bg-pink-50" title="너와 나의 교환일기">
      <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto scrollbar-hide">
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-200 overflow-hidden shrink-0"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="" /></div>
          <div className="bg-white p-2 rounded-r-lg rounded-bl-lg shadow-sm text-xs text-gray-700 border border-gray-100">
            오늘 떡볶이 먹었어? 😋
          </div>
        </div>
        <div className="flex items-start gap-2 flex-row-reverse">
          <div className="w-6 h-6 rounded-full bg-pink-200 overflow-hidden shrink-0"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" alt="" /></div>
          <div className="bg-pink-100 p-2 rounded-l-lg rounded-br-lg shadow-sm text-xs text-gray-700">
            응! 완전 매웠어 🔥
          </div>
        </div>
        <div className="mt-auto pt-2 flex gap-1">
          <input className="flex-1 bg-white rounded-full px-3 py-1 text-xs border border-pink-200 outline-none" placeholder="답장하기..." />
          <button className="w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center text-white"><Send size={10} /></button>
        </div>
      </div>
    </WidgetWrapper>
  );
}

// 7. Todo List (할 일)
export function TodoListWidget() {
  const [todos, setTodos] = useState([
    { id: 1, text: '일기 쓰기', done: true },
    { id: 2, text: '물 마시기', done: false },
    { id: 3, text: '영양제 먹기', done: false },
  ]);

  const toggle = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <WidgetWrapper title="TO-DO LIST" className="bg-white">
      <div className="flex-1 overflow-y-auto p-2">
        {todos.map(t => (
          <div key={t.id} onClick={() => toggle(t.id)} className="flex items-center gap-2 mb-2 cursor-pointer group">
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${t.done ? 'bg-[var(--btn-bg)] border-[var(--btn-bg)]' : 'border-gray-300 group-hover:border-[var(--btn-bg)]'}`}>
              {t.done && <Check size={10} className="text-white" />}
            </div>
            <span className={`text-xs transition-colors ${t.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{t.text}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 opacity-50 mt-2">
          <div className="w-4 h-4 border border-dashed border-gray-300 rounded"></div>
          <span className="text-xs text-gray-400">Add new...</span>
        </div>
      </div>
    </WidgetWrapper>
  );
}

// 8. Past Today (과거의 오늘)
export const PastToday = React.memo(function PastToday() {
  return (
    <WidgetWrapper className="bg-slate-50 border-slate-100">
      <div className="w-full h-full p-3 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><History size={10} /> 1년 전 오늘</h3>
          <p className="text-sm font-serif text-slate-800 leading-snug">
            "처음으로 혼자 여행을 떠난 날. 조금 무섭지만 설렌다."
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-full shadow-sm border border-slate-100">2024.12.12</span>
        </div>
      </div>
    </WidgetWrapper>
  );
});

// 9. My Persona (나의 페르소나)
export const MyPersona = React.memo(function MyPersona() {
  return (
    <WidgetWrapper className="bg-gradient-to-tr from-purple-100 to-white">
      <div className="w-full h-full flex flex-col items-center justify-center p-3">
        <div className="w-16 h-16 rounded-full bg-white p-1 shadow-md mb-2">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="Profile" className="w-full h-full rounded-full bg-purple-50" />
        </div>
        <h3 className="font-bold text-gray-800 text-sm">꿈꾸는 여행자</h3>
        <div className="flex gap-1 mt-2 flex-wrap justify-center">
          <span className="text-[9px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded">INFP</span>
          <span className="text-[9px] bg-pink-200 text-pink-800 px-1.5 py-0.5 rounded">새벽감성</span>
          <span className="text-[9px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded">음악</span>
        </div>
      </div>
    </WidgetWrapper>
  );
});

// 10. Weather Widget (날씨)
export function WeatherWidget() {
  const [weather, setWeather] = useState('sun');

  return (
    <WidgetWrapper className="bg-sky-50">
      <div className="w-full h-full flex items-center justify-between p-4">
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-gray-800">24°</span>
          <span className="text-xs text-gray-500">Seoul, KR</span>
        </div>
        <div onClick={() => setWeather(weather === 'sun' ? 'rain' : 'sun')} className="cursor-pointer">
          {weather === 'sun' ?
            <Sun className="w-12 h-12 text-orange-400 animate-spin-slow" /> :
            <CloudRain className="w-12 h-12 text-blue-400 animate-bounce" />
          }
        </div>
      </div>
    </WidgetWrapper>
  );
}

// 11. Notification (알림 설정)
export function NotificationSet() {
  const [isOn, setIsOn] = useState(true);

  return (
    <WidgetWrapper className="bg-gray-50">
      <div className="w-full h-full flex flex-col justify-center p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-600 flex items-center gap-1"><Bell size={12} /> 일기 알림</span>
          <div
            onClick={() => setIsOn(!isOn)}
            className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${isOn ? 'bg-green-400' : 'bg-gray-300'}`}
          >
            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${isOn ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
          <span className="text-lg font-mono font-bold text-gray-800">22:00</span>
        </div>
        <p className="text-[9px] text-gray-400 text-center mt-1">매일 밤, 하루를 기록하세요</p>
      </div>
    </WidgetWrapper>
  );
}

// 12. Emotion Analysis (감정 분석)
export const EmotionAnalysis = React.memo(function EmotionAnalysis() {
  return (
    <WidgetWrapper title="이번 달 감정" className="bg-white">
      <div className="w-full h-full flex items-center justify-center p-2">
        <div className="relative w-24 h-24 rounded-full border-[6px] border-gray-100 flex items-center justify-center">
          {/* Simple Pie Chart Simulation with Conic Gradient */}
          <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(#fbbf24 0% 40%, #f87171 40% 70%, #60a5fa 70% 100%)', maskImage: 'radial-gradient(transparent 55%, black 56%)', WebkitMaskImage: 'radial-gradient(transparent 55%, black 56%)' }}></div>
          <div className="text-center z-10">
            <span className="block text-xs text-gray-400">Main</span>
            <span className="block text-sm font-bold text-amber-500">Happy</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 ml-4">
          <div className="flex items-center gap-1 text-[9px] text-gray-600"><div className="w-2 h-2 rounded-full bg-amber-400"></div> 행복 40%</div>
          <div className="flex items-center gap-1 text-[9px] text-gray-600"><div className="w-2 h-2 rounded-full bg-red-400"></div> 설렘 30%</div>
          <div className="flex items-center gap-1 text-[9px] text-gray-600"><div className="w-2 h-2 rounded-full bg-blue-400"></div> 차분 30%</div>
        </div>
      </div>
    </WidgetWrapper>
  );
});

// 13. Community Widget (커뮤니티)
export function CommunityWidget() {
  const posts = [
    { title: "오늘 다꾸 팁 공유해요! 🎀", likes: 12 },
    { title: "위젯 배치 좀 봐주세요 ㅎㅎ", likes: 8 },
    { title: "저녁 메뉴 추천 받아요", likes: 5 }
  ];

  return (
    <WidgetWrapper title="커뮤니티 인기글" className="bg-white">
      <div className="flex-1 p-0">
        {posts.map((post, i) => (
          <div key={i} className="px-3 py-2 border-b border-gray-50 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors">
            <span className="text-xs text-gray-700 truncate flex-1">{post.title}</span>
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5 ml-2">❤️ {post.likes}</span>
          </div>
        ))}
        <div className="p-2 text-center text-[10px] text-gray-400 hover:text-[var(--btn-bg)] cursor-pointer">
          더보기 &gt;
        </div>
      </div>
    </WidgetWrapper>
  );
}

// 14. Clock Widget (시계)
export function ClockWidget() {
  const [time, setTime] = useState(new Date());
  const [type, setType] = useState<'digital' | 'analog' | 'flip'>('digital');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleType = () => {
    if (type === 'digital') setType('analog');
    else if (type === 'analog') setType('flip');
    else setType('digital');
  };

  const renderContent = () => {
    if (type === 'digital') {
      return (
        <div className="text-center">
          <div className="text-3xl font-mono font-bold tracking-wider text-gray-800">
            {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xs text-gray-500 font-mono mt-1">
            {time.toLocaleDateString([], { month: 'long', day: 'numeric', weekday: 'short' })}
          </div>
        </div>
      );
    }
    if (type === 'flip') {
      return (
        <div className="flex gap-1 items-center justify-center">
          <div className="bg-[#333] text-white p-2 rounded text-2xl font-bold font-mono shadow-md border-b-2 border-[#111]">
            {time.getHours().toString().padStart(2, '0')}
          </div>
          <span className="text-2xl font-bold animate-pulse">:</span>
          <div className="bg-[#333] text-white p-2 rounded text-2xl font-bold font-mono shadow-md border-b-2 border-[#111]">
            {time.getMinutes().toString().padStart(2, '0')}
          </div>
          <div className="absolute bottom-2 text-[9px] text-gray-400 tracking-widest">FLIP CLOCK</div>
        </div>
      );
    }
    // Analog
    return (
      <div className="relative w-24 h-24 rounded-full border-4 border-gray-800 bg-white shadow-inner flex items-center justify-center">
        <div className="absolute w-1 h-3 bg-gray-800 top-0 left-1/2 -translate-x-1/2"></div>
        <div className="absolute w-1 h-3 bg-gray-800 bottom-0 left-1/2 -translate-x-1/2"></div>
        <div className="absolute w-3 h-1 bg-gray-800 left-0 top-1/2 -translate-y-1/2"></div>
        <div className="absolute w-3 h-1 bg-gray-800 right-0 top-1/2 -translate-y-1/2"></div>

        {/* Hour Hand */}
        <div
          className="absolute w-1.5 h-6 bg-black rounded-full origin-bottom bottom-1/2 left-1/2 -translate-x-1/2 z-10"
          style={{ transform: `translateX(-50%) rotate(${(time.getHours() % 12) * 30 + time.getMinutes() * 0.5}deg)` }}
        ></div>
        {/* Minute Hand */}
        <div
          className="absolute w-1 h-8 bg-gray-600 rounded-full origin-bottom bottom-1/2 left-1/2 -translate-x-1/2 z-10"
          style={{ transform: `translateX(-50%) rotate(${time.getMinutes() * 6}deg)` }}
        ></div>
        {/* Second Hand */}
        <div
          className="absolute w-0.5 h-9 bg-red-500 rounded-full origin-bottom bottom-1/2 left-1/2 -translate-x-1/2 z-20"
          style={{ transform: `translateX(-50%) rotate(${time.getSeconds() * 6}deg)` }}
        ></div>

        <div className="w-2 h-2 bg-black rounded-full z-30"></div>
      </div>
    );
  };

  return (
    <WidgetWrapper className="bg-white">
      <div
        onClick={toggleType}
        className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
        title="클릭하여 디자인 변경"
      >
        {renderContent()}
      </div>
    </WidgetWrapper>
  );
}

// 15. D-Day List (디데이 리스트)
export const DDayList = React.memo(function DDayList() {
  const events = [
    { title: '여름 휴가', dday: -45 },
    { title: '친구 생일', dday: -12 },
    { title: '프로젝트 마감', dday: -3 }
  ];

  return (
    <WidgetWrapper title="D-DAY" className="bg-pink-50/50">
      <div className="p-2 flex flex-col gap-2">
        {events.map((e, i) => (
          <div key={i} className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm border border-pink-100">
            <span className="text-xs font-medium text-gray-700">{e.title}</span>
            <span className="text-xs font-bold text-pink-500">D{e.dday}</span>
          </div>
        ))}
        <button className="text-[10px] text-center text-gray-400 hover:text-pink-500 mt-1">+ Add Event</button>
      </div>
    </WidgetWrapper>
  );
});

// 16. Quick Links (즐겨찾기)
export const QuickLinks = React.memo(function QuickLinks() {
  return (
    <WidgetWrapper className="bg-gray-100">
      <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-1 p-1">
        <div className="bg-white rounded-lg flex flex-col items-center justify-center shadow-sm hover:shadow cursor-pointer hover:scale-95 transition-all">
          <Calendar className="w-5 h-5 text-blue-500 mb-1" />
          <span className="text-[9px] text-gray-600">Calendar</span>
        </div>
        <div className="bg-white rounded-lg flex flex-col items-center justify-center shadow-sm hover:shadow cursor-pointer hover:scale-95 transition-all">
          <ImageIcon className="w-5 h-5 text-green-500 mb-1" />
          <span className="text-[9px] text-gray-600">Gallery</span>
        </div>
        <div className="bg-white rounded-lg flex flex-col items-center justify-center shadow-sm hover:shadow cursor-pointer hover:scale-95 transition-all">
          <User className="w-5 h-5 text-purple-500 mb-1" />
          <span className="text-[9px] text-gray-600">Profile</span>
        </div>
        <div className="bg-white rounded-lg flex flex-col items-center justify-center shadow-sm hover:shadow cursor-pointer hover:scale-95 transition-all">
          <Link className="w-5 h-5 text-gray-500 mb-1" />
          <span className="text-[9px] text-gray-600">Blog</span>
        </div>
      </div>
    </WidgetWrapper>
  );
});

// 17. Streak Widget (연속 기록)
export const StreakWidget = React.memo(function StreakWidget() {
  return (
    <WidgetWrapper className="bg-gradient-to-b from-orange-50 to-white">
      <div className="w-full h-full flex flex-col items-center justify-center p-2">
        <div className="relative">
          <Flame className="w-10 h-10 text-orange-500 animate-pulse" fill="currentColor" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-white text-xs">12</div>
        </div>
        <span className="text-xs font-bold text-orange-600 mt-1">Days Streak!</span>
        <div className="flex gap-0.5 mt-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${i < 5 ? 'bg-orange-400' : 'bg-gray-200'}`}></div>
          ))}
        </div>
      </div>
    </WidgetWrapper>
  );
});

// 18. Stats Widget (기록 통계)
export const StatsWidget = React.memo(function StatsWidget() {
  return (
    <WidgetWrapper title="Monthly Log" className="bg-white">
      <div className="w-full h-full flex flex-col items-end justify-end p-3 pb-0 relative">
        <div className="absolute top-8 left-3 text-xs text-gray-400">Total <strong className="text-gray-800">24</strong></div>
        <div className="flex items-end justify-between w-full h-24 gap-1">
          <div className="w-full bg-blue-100 rounded-t-sm h-[40%] relative group"><div className="absolute -top-4 left-0 w-full text-center text-[9px] opacity-0 group-hover:opacity-100">8</div></div>
          <div className="w-full bg-blue-200 rounded-t-sm h-[70%] relative group"><div className="absolute -top-4 left-0 w-full text-center text-[9px] opacity-0 group-hover:opacity-100">14</div></div>
          <div className="w-full bg-blue-300 rounded-t-sm h-[50%] relative group"><div className="absolute -top-4 left-0 w-full text-center text-[9px] opacity-0 group-hover:opacity-100">10</div></div>
          <div className="w-full bg-blue-400 rounded-t-sm h-[90%] relative group"><div className="absolute -top-4 left-0 w-full text-center text-[9px] opacity-0 group-hover:opacity-100">18</div></div>
          <div className="w-full bg-blue-500 rounded-t-sm h-[30%] relative group"><div className="absolute -top-4 left-0 w-full text-center text-[9px] opacity-0 group-hover:opacity-100">6</div></div>
        </div>
        <div className="flex justify-between w-full text-[8px] text-gray-400 py-1">
          <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span>
        </div>
      </div>
    </WidgetWrapper>
  );
});
