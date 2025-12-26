import React from 'react';
import * as Diary from './WidgetCollection/diary';
import * as Tools from './WidgetCollection/tools';
import * as Decoration from './WidgetCollection/decoration';
import * as Interactive from './WidgetCollection/interactive';
import * as System from './WidgetCollection/system';
import { Biorhythm } from './WidgetCollection/tools/Biorhythm';
import { SkyMap } from './WidgetCollection/decoration/SkyMap';
import { ASMRMixer } from './WidgetCollection/interactive/ASMRMixer';
import { ReceiptPrinter } from './WidgetCollection/decoration/ReceiptPrinter';
import { MeditationTimer } from './WidgetCollection/tools/MeditationTimer';
import { Mandalart } from './WidgetCollection/tools/Mandalart';
import { Bonfire } from './WidgetCollection/interactive/Bonfire';
import { LPPlayer } from './WidgetCollection/interactive/LPPlayer';
import { OOTDSketch } from './WidgetCollection/decoration/OOTDSketch';
import { BirthFlower } from './WidgetCollection/decoration/BirthFlower';
import { WeatherStickers } from './WidgetCollection/decoration/WeatherStickers';

import { Polaroid } from './WidgetCollection/tools/Polaroid';
import { OceanWave } from './WidgetCollection/decoration/OceanWave';
import { MovieTicket } from './WidgetCollection/decoration/MovieTicket';
import { Bookshelf } from './WidgetCollection/decoration/Bookshelf';
import { StampCollection } from './WidgetCollection/decoration/StampCollection';
import { RecipeCard } from './WidgetCollection/tools/RecipeCard';
import { Payphone } from './WidgetCollection/decoration/Payphone';
import { Typewriter } from './WidgetCollection/tools/Typewriter';
import { WorryDoll } from './WidgetCollection/tools/WorryDoll';
import { ColorPalette } from './WidgetCollection/tools/ColorPalette';
import { FandomCalendar } from './WidgetCollection/tools/FandomCalendar';

export interface WidgetLayout {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface WidgetInstance {
    id: string;
    type: WidgetType;
    props?: any;
    layout: WidgetLayout;
}

export const WIDGET_REGISTRY: Record<string, { component: React.ComponentType<any>, label: string, defaultProps?: any, defaultSize?: 'small' | 'medium' | 'large' | 'wide', category: string }> = {
    // System
    'welcome': { component: System.WelcomeWidget, label: '환영 메시지', defaultSize: 'wide', category: 'System' },
    'theme-guide': { component: System.ThemeGuideWidget, label: '테마 가이드', defaultSize: 'medium', category: 'System' },
    'feature-card': { component: System.FeatureCard, label: '기능 카드', defaultSize: 'small', category: 'System' },

    // Diary & Emotion
    'ai-diary': { component: Diary.AIDiary, label: 'AI 감정 분석', defaultSize: 'medium', category: 'Diary & Emotion' },
    'daily-diary': { component: Diary.DailyDiary, label: '오늘의 일기', defaultSize: 'large', category: 'Diary & Emotion' },
    'random-diary': { component: Diary.RandomDiary, label: '랜덤 일기', defaultSize: 'small', category: 'Diary & Emotion' },
    'exchange-diary': { component: Diary.ExchangeDiary, label: '교환 일기', defaultSize: 'medium', category: 'Diary & Emotion' },
    'past-today': { component: Diary.PastToday, label: '과거의 오늘', defaultSize: 'medium', category: 'Diary & Emotion' },
    'my-persona': { component: System.MyPersona, label: '나의 페르소나', defaultSize: 'small', category: 'Diary & Emotion' },
    'emotion-analysis': { component: Diary.EmotionAnalysis, label: '감정 분석', defaultSize: 'medium', category: 'Diary & Emotion' },
    'compliment-jar': { component: Diary.ComplimentJar, label: '칭찬 저금통', defaultSize: 'small', category: 'Diary & Emotion' },
    'emotional-weather': { component: Diary.EmotionalWeather, label: '마음 날씨', defaultSize: 'small', category: 'Diary & Emotion' },
    'dream-log': { component: Diary.DreamLog, label: '꿈 기록장', defaultSize: 'medium', category: 'Diary & Emotion' },
    'daily-stamp': { component: Diary.DailyStamp, label: '참 잘했어요', defaultSize: 'small', category: 'Diary & Emotion' },

    // Utility
    'time-machine': { component: Interactive.TimeMachine, label: '타임머신', defaultSize: 'small', category: 'Utility' },
    'todo-list': { component: Tools.TodoListWidget, label: '할 일 목록', defaultSize: 'medium', category: 'Utility' },
    'weather': { component: Tools.WeatherWidget, label: '날씨', defaultSize: 'medium', category: 'Utility' },
    'notification': { component: Tools.NotificationSet, label: '알림 설정', defaultSize: 'small', category: 'Utility' },
    'clock': { component: Tools.ClockWidget, label: '시계', defaultSize: 'small', category: 'Utility' },
    'dday': { component: Tools.DDayList, label: 'D-Day', defaultSize: 'small', category: 'Utility' },
    'dday-balloon': { component: Tools.DDayBalloon, label: '풍선 D-Day', defaultSize: 'small', category: 'Utility' },
    'quick-links': { component: Tools.QuickLinks, label: '바로가기', defaultSize: 'small', category: 'Utility' },
    'streak': { component: Tools.StreakWidget, label: '연속 기록', defaultSize: 'small', category: 'Utility' },
    'stats': { component: Tools.StatsWidget, label: '통계', defaultSize: 'medium', category: 'Utility' },
    'battery': { component: Tools.BatteryWidget, label: '내 에너지', defaultSize: 'medium', category: 'Utility' },
    'worry-shredder': { component: Tools.WorryShredder, label: '근심 파쇄기', defaultSize: 'medium', category: 'Utility' },
    'scrap-note': { component: Tools.ScrapNote, label: '찢어진 노트', defaultSize: 'medium', category: 'Utility' },
    'biorhythm': { component: Biorhythm, label: '바이오리듬', defaultSize: 'medium', category: 'Utility' },

    // Decoration & Collection
    'photo-gallery': { component: Decoration.PhotoGallery, label: '사진 갤러리', defaultSize: 'medium', category: 'Decoration' },

    'instant-booth': { component: Decoration.InstantBooth, label: '인생네컷', defaultProps: { date: '2023.12.25', images: ['https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400'] }, defaultSize: 'small', category: 'Decoration' },
    'film-strip': { component: Decoration.FilmStrip, label: '필름 스트립', defaultProps: { images: ['https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400'] }, defaultSize: 'wide', category: 'Decoration' },

    'community': { component: Interactive.CommunityWidget, label: '커뮤니티', defaultSize: 'medium', category: 'Decoration' },
    'moon-phase': { component: Decoration.MoonPhase, label: '달의 위상', defaultSize: 'small', category: 'Decoration' },
    'sky-map': { component: SkyMap, label: '하늘 지도', defaultSize: 'medium', category: 'Decoration' },
    'receipt-printer': { component: ReceiptPrinter, label: '영수증', defaultSize: 'medium', category: 'Decoration' },
    'switch-board': { component: Decoration.SwitchBoard, label: '스위치', defaultSize: 'small', category: 'Decoration' },
    'fortune-cookie': { component: Decoration.FortuneCookie, label: '포춘 쿠키', defaultSize: 'small', category: 'Decoration' },
    'ootd': { component: OOTDSketch, label: 'OOTD (데일리룩)', defaultSize: 'small', category: 'Decoration' },
    'book-cover': { component: Decoration.BookCover, label: '읽는 책', defaultSize: 'medium', category: 'Decoration' },
    'bubble-wrap': { component: Decoration.BubbleWrap, label: '뽁뽁이', defaultSize: 'small', category: 'Decoration' },
    'transparent': { component: Decoration.TransparentSpacer, label: '투명 (공백)', defaultSize: 'small', category: 'Decoration' },

    // Static Items
    'favorite-char': { component: Decoration.FavoriteCharacter, label: '최애 캐릭터', defaultProps: { name: 'Kirby', src: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Kirby' }, defaultSize: 'small', category: 'Decoration' },
    'color-chip': { component: Decoration.ColorChip, label: '컬러칩', defaultProps: { color: '#FFD700', name: 'Golden', code: '#FFD700' }, defaultSize: 'small', category: 'Decoration' },
    'movie-scene': { component: Decoration.MovieScene, label: '영화 명장면', defaultProps: { src: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400', quote: 'Here\'s looking at you, kid.' }, defaultSize: 'medium', category: 'Decoration' },
    'ticket': { component: Decoration.TicketStub, label: '티켓', defaultProps: { title: 'Movie Night', date: '24.12.24', seat: 'H12' }, defaultSize: 'wide', category: 'Decoration' },
    'neon': { component: Decoration.NeonSign, label: '네온 사인', defaultProps: { text: 'DREAM', color: '#ff00ff' }, defaultSize: 'medium', category: 'Decoration' },
    'candle': { component: Decoration.Candle, label: '양초', defaultSize: 'small', category: 'Decoration' },
    'text-scroller': { component: Decoration.TextScroller, label: '텍스트 전광판', defaultProps: { text: 'HELLO WORLD' }, defaultSize: 'wide', category: 'Decoration' },
    'window-view': { component: Decoration.WindowView, label: '창밖 풍경', defaultSize: 'medium', category: 'Decoration' },

    // Interactive
    'digital-plant': { component: Interactive.DigitalPlant, label: '반려 식물', defaultSize: 'medium', category: 'Interactive' },
    'dessert-case': { component: Interactive.DessertCase, label: '간식 진열대', defaultSize: 'medium', category: 'Interactive' },
    'cat-chaser': { component: Interactive.CatChaser, label: '따라오는 고양이', defaultSize: 'medium', category: 'Interactive' },
    'snow-globe': { component: Interactive.SnowGlobe, label: '스노우볼', defaultSize: 'small', category: 'Interactive' },
    'lp-player': { component: LPPlayer, label: '턴테이블', defaultSize: 'medium', category: 'Interactive' },
    'asmr-mixer': { component: ASMRMixer, label: 'ASMR 믹서', defaultSize: 'medium', category: 'Interactive' },
    'bonfire': { component: Bonfire, label: '모닥불', defaultSize: 'medium', category: 'Interactive' },

    // Tools (New)
    'meditation-timer': { component: MeditationTimer, label: '명상 타이머', defaultSize: 'medium', category: 'Utility' },
    'mandalart': { component: Mandalart, label: '만다라트 계획표', defaultSize: 'medium', category: 'Utility' },
    'birth-flower': { component: BirthFlower, label: '탄생화', defaultSize: 'medium', category: 'Decoration' },
    'weather-stickers': { component: WeatherStickers, label: '날씨 스티커', defaultSize: 'small', category: 'Decoration' },

    'polaroid': { component: Polaroid, label: '폴라로이드', defaultSize: 'medium', category: 'Tool' },
    'ocean-wave': { component: OceanWave, label: '바다 (파도)', defaultSize: 'medium', category: 'Decoration' },
    'movie-ticket': { component: MovieTicket, label: '영화 티켓', defaultSize: 'medium', category: 'Collection' },
    'bookshelf': { component: Bookshelf, label: '책장', defaultSize: 'medium', category: 'Collection' },
    'stamp-collection': { component: StampCollection, label: '우표 수집', defaultSize: 'medium', category: 'Collection' },
    'recipe-card': { component: RecipeCard, label: '레시피 카드', defaultSize: 'medium', category: 'Utility' },
    'payphone': { component: Payphone, label: '공중전화', defaultSize: 'medium', category: 'Interactive' },
    'typewriter': { component: Typewriter, label: '타자기', defaultSize: 'wide', category: 'Tool' },
    'worry-doll': { component: WorryDoll, label: '걱정 인형', defaultSize: 'medium', category: 'Utility' },
    'color-palette': { component: ColorPalette, label: '컬러 팔레트', defaultSize: 'medium', category: 'Tool' },
    'fandom-calendar': { component: FandomCalendar, label: '덕질 캘린더', defaultSize: 'medium', category: 'Utility' },
};

export type WidgetType = keyof typeof WIDGET_REGISTRY;
