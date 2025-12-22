import React from 'react';
import {
  AIDiary, DailyDiary, RandomDiary, TimeMachine, PhotoGallery, ExchangeDiary,
  TodoListWidget, PastToday, MyPersona, WeatherWidget, NotificationSet,
  EmotionAnalysis, CommunityWidget, ClockWidget, DDayList, QuickLinks,
  StreakWidget, StatsWidget
} from './NewWidgets';

import {
  MoonPhase, WindowView, SnowGlobe, DigitalPlant, WorryShredder, ScrapNote,
  DreamLog, DessertCase, CatChaser, DDayBalloon, FavoriteCharacter, ColorChip,
  MovieScene, Polaroid, TicketStub, InstantBooth, FilmStrip, TextScroller,
  NeonSign, Candle, SwitchBoard, ComplimentJar, FortuneCookie, EmotionalWeather,
  BatteryWidget, OOTDSketch, BookCover, BubbleWrap, DailyStamp, LPPlayer
} from './WidgetCollection';

export function WidgetGallery() {
  const sampleImages = [
    "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop"
  ];

  return (
    <div className="p-8 bg-[var(--bg-solid)] min-h-screen text-[var(--text-primary)]">
      <style>{`
        @keyframes slide-down {
          0% { background-position: 0 0; }
          100% { background-position: 20px 20px; }
        }
        @keyframes fall {
          0% { transform: translateY(-10px); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(50px); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        @keyframes pour {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(-30deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes drip {
          0% { height: 0; opacity: 0; }
          50% { height: 8px; opacity: 1; }
          100% { height: 0; opacity: 0; transform: translateY(10px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-slide-down { animation: slide-down 2s linear infinite; }
        .animate-fall { animation: fall 3s linear infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-pour { animation: pour 2s ease-in-out infinite; }
        .animate-drip { animation: drip 1s linear infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
      <h1 className="text-3xl font-bold mb-8 text-[var(--text-primary)] border-b border-[var(--border-color)] pb-4">
        Widget Gallery
      </h1>

      {/* New Widgets Section */}
      <h2 className="text-xl font-semibold mb-6 mt-12 text-[var(--text-secondary)] uppercase tracking-widest pl-2 border-l-4 border-[var(--btn-bg)]">
        New Interactive Widgets
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[300px]">
        <WidgetContainer title="AI Diary"><AIDiary /></WidgetContainer>
        <WidgetContainer title="Daily Diary"><DailyDiary /></WidgetContainer>
        <WidgetContainer title="Random Diary"><RandomDiary /></WidgetContainer>
        <WidgetContainer title="Time Machine"><TimeMachine /></WidgetContainer>
        <WidgetContainer title="Photo Gallery"><PhotoGallery /></WidgetContainer>
        <WidgetContainer title="Exchange Diary"><ExchangeDiary /></WidgetContainer>
        <WidgetContainer title="Todo List"><TodoListWidget /></WidgetContainer>
        <WidgetContainer title="Past Today"><PastToday /></WidgetContainer>
        <WidgetContainer title="My Persona"><MyPersona /></WidgetContainer>
        <WidgetContainer title="Weather"><WeatherWidget /></WidgetContainer>
        <WidgetContainer title="Notification"><NotificationSet /></WidgetContainer>
        <WidgetContainer title="Emotion Analysis"><EmotionAnalysis /></WidgetContainer>
        <WidgetContainer title="Community"><CommunityWidget /></WidgetContainer>
        <WidgetContainer title="Clock"><ClockWidget /></WidgetContainer>
        <WidgetContainer title="D-Day"><DDayList /></WidgetContainer>
        <WidgetContainer title="Quick Links"><QuickLinks /></WidgetContainer>
        <WidgetContainer title="Streak"><StreakWidget /></WidgetContainer>
        <WidgetContainer title="Stats"><StatsWidget /></WidgetContainer>
      </div>

      {/* Collection Widgets Section */}
      <h2 className="text-xl font-semibold mb-6 mt-16 text-[var(--text-secondary)] uppercase tracking-widest pl-2 border-l-4 border-[var(--btn-bg)]">
        Collection Widgets
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[300px]">
        {/* Interactive / Complex */}
        <WidgetContainer title="Moon Phase"><MoonPhase /></WidgetContainer>
        <WidgetContainer title="Window View"><WindowView /></WidgetContainer>
        <WidgetContainer title="Snow Globe"><SnowGlobe /></WidgetContainer>
        <WidgetContainer title="Digital Plant"><DigitalPlant /></WidgetContainer>
        <WidgetContainer title="Worry Shredder"><WorryShredder /></WidgetContainer>
        <WidgetContainer title="Scrap Note"><ScrapNote /></WidgetContainer>
        <WidgetContainer title="Dream Log"><DreamLog /></WidgetContainer>
        <WidgetContainer title="Dessert Case"><DessertCase /></WidgetContainer>
        <WidgetContainer title="Cat Chaser"><CatChaser /></WidgetContainer>
        <WidgetContainer title="D-Day Balloon"><DDayBalloon /></WidgetContainer>

        {/* Small / Toy Widgets */}
        <WidgetContainer title="Switch Board"><SwitchBoard /></WidgetContainer>
        <WidgetContainer title="Compliment Jar"><ComplimentJar /></WidgetContainer>
        <WidgetContainer title="Fortune Cookie"><FortuneCookie /></WidgetContainer>
        <WidgetContainer title="Emotional Weather"><EmotionalWeather /></WidgetContainer>
        <WidgetContainer title="Battery Widget"><BatteryWidget /></WidgetContainer>
        <WidgetContainer title="OOTD Sketch"><OOTDSketch /></WidgetContainer>
        <WidgetContainer title="Book Cover"><BookCover /></WidgetContainer>
        <WidgetContainer title="Bubble Wrap"><BubbleWrap /></WidgetContainer>
        <WidgetContainer title="Daily Stamp"><DailyStamp /></WidgetContainer>
        <WidgetContainer title="LP Player"><LPPlayer /></WidgetContainer>

        {/* Static / Presentational */}
        <WidgetContainer title="Favorite Character">
          <FavoriteCharacter
            src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=200&h=200&fit=crop"
            name="My Pet"
          />
        </WidgetContainer>
        <WidgetContainer title="Color Chip">
          <ColorChip color="#FF6B6B" name="Coral Red" code="PANTONE 16-1546" />
        </WidgetContainer>
        <div className="md:col-span-2">
          <WidgetContainer title="Movie Scene">
            <MovieScene
              src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=400&fit=crop"
              quote="Here's looking at you, kid."
            />
          </WidgetContainer>
        </div>
        <WidgetContainer title="Polaroid">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute w-3/4"><Polaroid src={sampleImages[0]} date="2024.12.25" rotation={-5} /></div>
          </div>
        </WidgetContainer>
        <WidgetContainer title="Ticket Stub">
          <TicketStub title="SEOUL JAZZ FESTIVAL" date="MAY 28, 2025" seat="A-12" />
        </WidgetContainer>
        <WidgetContainer title="Photo Booth" className="row-span-2">
          <InstantBooth images={sampleImages} date="2025.12.11" />
        </WidgetContainer>
        <div className="md:col-span-2">
          <WidgetContainer title="Film Strip">
            <FilmStrip images={[...sampleImages, ...sampleImages]} />
          </WidgetContainer>
        </div>
        <div className="md:col-span-2">
          <WidgetContainer title="Marquee">
            <TextScroller text="WELCOME TO BYEORY WORLD ★ HAVE A NICE DAY ★ DON'T FORGET YOUR TASKS ★" />
          </WidgetContainer>
        </div>
        <div className="md:col-span-2">
          <WidgetContainer title="Neon Sign" className="bg-gray-900 text-white">
            <NeonSign text="Open 24/7" color="#00ffcc" />
          </WidgetContainer>
        </div>
        <WidgetContainer title="Candle">
          <Candle />
        </WidgetContainer>
      </div>
    </div>
  );
}

function WidgetContainer({ children, title, className = '' }: { children: React.ReactNode; title: string; className?: string }) {
  return (
    <section className={`flex flex-col items-center w-full h-full ${className}`}>
      <h2 className="text-xs text-[var(--text-secondary)] mb-3 uppercase tracking-wider font-bold w-full text-center pb-2">
        {title}
      </h2>
      <div className="w-full flex-1 overflow-hidden flex items-center justify-center">
        {children}
      </div>
    </section>
  );
}
