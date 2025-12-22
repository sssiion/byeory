import React from 'react';
import * as Collection from './WidgetCollection';
import * as NewWidgets from './NewWidgets';
import * as System from './SystemWidgets';

export interface WidgetLayout {
    cols: number; // 1 | 2 | 3 | 4
    rows: number; // 1 | 2 | 3
}

export interface WidgetInstance {
    id: string;
    type: WidgetType;
    props?: any;
    layout: WidgetLayout;
}

export const WIDGET_REGISTRY: Record<string, { component: React.ComponentType<any>, label: string, defaultProps?: any, defaultSize?: 'small' | 'medium' | 'large' | 'wide' }> = {
    // System
    'welcome': { component: System.WelcomeWidget, label: '환영 메시지', defaultSize: 'wide' },
    'theme-guide': { component: System.ThemeGuideWidget, label: '테마 가이드', defaultSize: 'medium' },
    'feature-card': { component: System.FeatureCardWidget, label: '기능 카드', defaultSize: 'small' },

    // New Widgets
    'ai-diary': { component: NewWidgets.AIDiary, label: 'AI 감정 분석', defaultSize: 'medium' },
    'daily-diary': { component: NewWidgets.DailyDiary, label: '오늘의 일기', defaultSize: 'large' },
    'random-diary': { component: NewWidgets.RandomDiary, label: '랜덤 일기', defaultSize: 'small' },
    'time-machine': { component: NewWidgets.TimeMachine, label: '타임머신', defaultSize: 'small' },
    'photo-gallery': { component: NewWidgets.PhotoGallery, label: '사진 갤러리', defaultSize: 'medium' },
    'exchange-diary': { component: NewWidgets.ExchangeDiary, label: '교환 일기', defaultSize: 'medium' },
    'todo-list': { component: NewWidgets.TodoListWidget, label: '할 일 목록', defaultSize: 'medium' },
    'past-today': { component: NewWidgets.PastToday, label: '과거의 오늘', defaultSize: 'medium' },
    'my-persona': { component: NewWidgets.MyPersona, label: '나의 페르소나', defaultSize: 'small' },
    'weather': { component: NewWidgets.WeatherWidget, label: '날씨', defaultSize: 'medium' },
    'notification': { component: NewWidgets.NotificationSet, label: '알림 설정', defaultSize: 'small' },
    'emotion-analysis': { component: NewWidgets.EmotionAnalysis, label: '감정 분석', defaultSize: 'medium' },
    'community': { component: NewWidgets.CommunityWidget, label: '커뮤니티', defaultSize: 'medium' },
    'clock': { component: NewWidgets.ClockWidget, label: '시계', defaultSize: 'small' },
    'dday': { component: NewWidgets.DDayList, label: 'D-Day', defaultSize: 'small' },
    'quick-links': { component: NewWidgets.QuickLinks, label: '바로가기', defaultSize: 'small' },
    'streak': { component: NewWidgets.StreakWidget, label: '연속 기록', defaultSize: 'small' },
    'stats': { component: NewWidgets.StatsWidget, label: '통계', defaultSize: 'medium' },

    // Collection
    'moon-phase': { component: Collection.MoonPhase, label: '달의 위상', defaultSize: 'small' },
    'switch-board': { component: Collection.SwitchBoard, label: '스위치', defaultSize: 'small' },
    'compliment-jar': { component: Collection.ComplimentJar, label: '칭찬 저금통', defaultSize: 'small' },
    'fortune-cookie': { component: Collection.FortuneCookie, label: '포춘 쿠키', defaultSize: 'small' },
    'emotional-weather': { component: Collection.EmotionalWeather, label: '마음 날씨', defaultSize: 'small' },
    'battery': { component: Collection.BatteryWidget, label: '내 에너지', defaultSize: 'medium' },
    'ootd': { component: Collection.OOTDSketch, label: 'OOTD', defaultSize: 'small' },
    'book-cover': { component: Collection.BookCover, label: '읽는 책', defaultSize: 'medium' },
    'bubble-wrap': { component: Collection.BubbleWrap, label: '뽁뽁이', defaultSize: 'small' },

    // Static Collection Items (Need wrapper or props)
    'favorite-char': { component: Collection.FavoriteCharacter, label: '최애 캐릭터', defaultProps: { name: 'Kirby', src: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Kirby' }, defaultSize: 'small' },
    'color-chip': { component: Collection.ColorChip, label: '컬러칩', defaultProps: { color: '#FFD700', name: 'Golden', code: '#FFD700' }, defaultSize: 'small' },
    'movie-scene': { component: Collection.MovieScene, label: '영화 명장면', defaultProps: { src: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400', quote: 'Here\'s looking at you, kid.' }, defaultSize: 'medium' },
    'polaroid': { component: Collection.Polaroid, label: '폴라로이드', defaultProps: { date: '2023.12.25', src: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400' }, defaultSize: 'small' },
    'ticket': { component: Collection.TicketStub, label: '티켓', defaultProps: { title: 'Movie Night', date: '24.12.24', seat: 'H12' }, defaultSize: 'wide' },
    'neon': { component: Collection.NeonSign, label: '네온 사인', defaultProps: { text: 'DREAM', color: '#ff00ff' }, defaultSize: 'medium' },
    'candle': { component: Collection.Candle, label: '양초', defaultSize: 'small' },
};

export type WidgetType = keyof typeof WIDGET_REGISTRY;
