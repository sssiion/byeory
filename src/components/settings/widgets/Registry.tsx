import React from 'react';
import * as Diary from './WidgetCollection/diary';
import * as Tools from './WidgetCollection/tools';
import * as Decoration from './WidgetCollection/decoration';
import * as Interactive from './WidgetCollection/interactive';
import * as System from './WidgetCollection/system';
import * as Controllers from './WidgetCollection/controllers';
import { Biorhythm, BiorhythmConfig } from './WidgetCollection/tools/Biorhythm';
import { SkyMap, SkyMapConfig } from './WidgetCollection/decoration/SkyMap';
import { ASMRMixer, ASMRMixerConfig } from './WidgetCollection/interactive/ASMRMixer';
import { ReceiptPrinter, ReceiptPrinterConfig } from './WidgetCollection/decoration/ReceiptPrinter';
import { MeditationTimer, MeditationTimerConfig } from './WidgetCollection/tools/MeditationTimer';
import { Mandalart, MandalartConfig } from './WidgetCollection/tools/Mandalart';
import { Bonfire, BonfireConfig } from './WidgetCollection/interactive/Bonfire';
import { LPPlayer, LPPlayerConfig } from './WidgetCollection/interactive/LPPlayer';
import { OOTDSketch, OOTDSketchConfig } from './WidgetCollection/decoration/OOTDSketch';
import { BirthFlower, BirthFlowerConfig } from './WidgetCollection/decoration/BirthFlower';
import { WeatherStickers, WeatherStickersConfig } from './WidgetCollection/decoration/WeatherStickers';

import { Polaroid, PolaroidConfig } from './WidgetCollection/tools/Polaroid';
import { OceanWave, OceanWaveConfig } from './WidgetCollection/decoration/OceanWave';
import { MovieTicket, MovieTicketConfig } from './WidgetCollection/decoration/MovieTicket';
import { Bookshelf, BookshelfConfig } from './WidgetCollection/decoration/Bookshelf';
import { StampCollection, StampCollectionConfig } from './WidgetCollection/decoration/StampCollection';
import { RecipeCard, RecipeCardConfig } from './WidgetCollection/tools/RecipeCard';
import { Payphone, PayphoneConfig } from './WidgetCollection/decoration/Payphone';
import { Typewriter, TypewriterConfig } from './WidgetCollection/tools/Typewriter';
import { WorryDoll, WorryDollConfig } from './WidgetCollection/tools/WorryDoll';
import { ColorPalette, ColorPaletteConfig } from './WidgetCollection/tools/ColorPalette';
import { FandomCalendar, FandomCalendarConfig } from './WidgetCollection/tools/FandomCalendar';

import * as Logic from './WidgetCollection/logic';

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

export const WIDGET_REGISTRY: Record<string, { component: React.ComponentType<any>, label: string, defaultProps?: any, defaultSize?: string, category: string, minW?: number, minH?: number, validSizes?: [number, number][] }> = {
    // System
    'welcome': {
        component: System.WelcomeWidget,
        label: '환영 메시지',
        defaultSize: System.WelcomeWidgetConfig.defaultSize,
        validSizes: System.WelcomeWidgetConfig.validSizes,
        category: 'System'
    },
    'theme-guide': {
        component: System.ThemeGuideWidget,
        label: '테마 가이드',
        defaultSize: System.ThemeGuideWidgetConfig.defaultSize,
        validSizes: System.ThemeGuideWidgetConfig.validSizes,
        category: 'System'
    },
    'feature-card': {
        component: System.FeatureCard,
        label: '기능 카드',
        defaultSize: System.FeatureCardConfig.defaultSize,
        validSizes: System.FeatureCardConfig.validSizes,
        category: 'System'
    },

    // Data & Logic (New)
    'formula-block': {
        component: Logic.FormulaBlock,
        label: '수식 블록',
        defaultSize: Logic.FormulaBlockConfig.defaultSize,
        validSizes: Logic.FormulaBlockConfig.validSizes,
        category: 'Data & Logic'
    },
    'relation-link': {
        component: Logic.RelationLink,
        label: '관계형 링크',
        defaultSize: Logic.RelationLinkConfig.defaultSize,
        validSizes: Logic.RelationLinkConfig.validSizes,
        category: 'Data & Logic'
    },
    'rollup': {
        component: Logic.Rollup,
        label: '롤업',
        defaultSize: Logic.RollupConfig.defaultSize,
        validSizes: Logic.RollupConfig.validSizes,
        category: 'Data & Logic'
    },
    'property-toggle': {
        component: Logic.PropertyToggle,
        label: '속성 토글',
        defaultSize: Logic.PropertyToggleConfig.defaultSize,
        validSizes: Logic.PropertyToggleConfig.validSizes,
        category: 'Data & Logic'
    },

    // Diary & Emotion
    // Diary & Emotion
    'ai-diary': {
        component: Diary.AIDiary,
        label: 'AI 감정 분석',
        defaultSize: Diary.AIDiaryConfig.defaultSize,
        validSizes: Diary.AIDiaryConfig.validSizes,
        category: 'Diary & Emotion'
    },
    'daily-diary': {
        component: Diary.DailyDiary,
        label: '오늘의 일기',
        defaultSize: Diary.DailyDiaryConfig.defaultSize,
        validSizes: Diary.DailyDiaryConfig.validSizes,
        category: 'Diary & Emotion'
    },
    'random-diary': {
        component: Diary.RandomDiary,
        label: '랜덤 일기',
        defaultSize: Diary.RandomDiaryConfig.defaultSize,
        validSizes: Diary.RandomDiaryConfig.validSizes,
        category: 'Diary & Emotion'
    },
    'exchange-diary': {
        component: Diary.ExchangeDiary,
        label: '교환 일기',
        defaultSize: Diary.ExchangeDiaryConfig.defaultSize,
        validSizes: Diary.ExchangeDiaryConfig.validSizes,
        category: 'Diary & Emotion'
    },
    'past-today': {
        component: Diary.PastToday,
        label: '과거의 오늘',
        defaultSize: Diary.PastTodayConfig.defaultSize,
        validSizes: Diary.PastTodayConfig.validSizes,
        category: 'Diary & Emotion'
    },
    'my-persona': {
        component: System.MyPersona,
        label: '나의 페르소나',
        defaultSize: System.MyPersonaConfig.defaultSize,
        validSizes: System.MyPersonaConfig.validSizes,
        category: 'Diary & Emotion'
    },
    'emotion-analysis': {
        component: Diary.EmotionAnalysis,
        label: '감정 분석',
        defaultSize: Diary.EmotionAnalysisConfig.defaultSize,
        validSizes: Diary.EmotionAnalysisConfig.validSizes,
        category: 'Diary & Emotion'
    },
    'compliment-jar': {
        component: Diary.ComplimentJar,
        label: '칭찬 저금통',
        defaultSize: Diary.ComplimentJarConfig.defaultSize,
        validSizes: Diary.ComplimentJarConfig.validSizes,
        category: 'Diary & Emotion'
    },
    'emotional-weather': {
        component: Diary.EmotionalWeather,
        label: '마음 날씨',
        defaultSize: Diary.EmotionalWeatherConfig.defaultSize,
        validSizes: Diary.EmotionalWeatherConfig.validSizes,
        category: 'Diary & Emotion'
    },
    'dream-log': {
        component: Diary.DreamLog,
        label: '꿈 기록장',
        defaultSize: Diary.DreamLogConfig.defaultSize,
        validSizes: Diary.DreamLogConfig.validSizes,
        category: 'Diary & Emotion'
    },
    'daily-stamp': {
        component: Diary.DailyStamp,
        label: '참 잘했어요',
        defaultSize: Diary.DailyStampConfig.defaultSize,
        validSizes: Diary.DailyStampConfig.validSizes,
        category: 'Diary & Emotion'
    },

    // Utility
    'time-machine': {
        component: Interactive.TimeMachine,
        label: '타임머신',
        defaultSize: Interactive.TimeMachineConfig.defaultSize,
        validSizes: Interactive.TimeMachineConfig.validSizes,
        category: 'Utility'
    },
    'todo-list': {
        component: Tools.TodoListWidget,
        label: '할 일 목록',
        defaultSize: Tools.TodoListConfig.defaultSize,
        validSizes: Tools.TodoListConfig.validSizes,
        category: 'Utility'
    },
    'weather': {
        component: Tools.WeatherWidget,
        label: '날씨',
        defaultSize: Tools.WeatherWidgetConfig.defaultSize,
        validSizes: Tools.WeatherWidgetConfig.validSizes,
        category: 'Utility'
    },
    'notification': {
        component: Tools.NotificationSet,
        label: '알림 설정',
        defaultSize: Tools.NotificationConfig.defaultSize,
        validSizes: Tools.NotificationConfig.validSizes,
        category: 'Utility'
    },
    'clock': {
        component: Tools.ClockWidget,
        label: '시계',
        defaultSize: Tools.ClockWidgetConfig.defaultSize,
        validSizes: Tools.ClockWidgetConfig.validSizes,
        category: 'Utility'
    },
    'dday': {
        component: Tools.DDayList,
        label: 'D-Day',
        defaultSize: Tools.DDayListConfig.defaultSize,
        validSizes: Tools.DDayListConfig.validSizes,
        category: 'Utility'
    },
    'dday-balloon': {
        component: Tools.DDayBalloon,
        label: '풍선 D-Day',
        defaultSize: Tools.DDayBalloonConfig.defaultSize,
        validSizes: Tools.DDayBalloonConfig.validSizes,
        category: 'Utility'
    },
    'quick-links': {
        component: Tools.QuickLinks,
        label: '바로가기',
        defaultSize: Tools.QuickLinksConfig.defaultSize,
        validSizes: Tools.QuickLinksConfig.validSizes,
        category: 'Utility'
    },
    'streak': {
        component: Tools.StreakWidget,
        label: '연속 기록',
        defaultSize: Tools.StreakWidgetConfig.defaultSize,
        validSizes: Tools.StreakWidgetConfig.validSizes,
        category: 'Utility'
    },
    'stats': {
        component: Tools.StatsWidget,
        label: '통계',
        defaultSize: Tools.StatsWidgetConfig.defaultSize,
        validSizes: Tools.StatsWidgetConfig.validSizes,
        category: 'Utility'
    },
    'battery': {
        component: Tools.BatteryWidget,
        label: '내 에너지',
        defaultSize: Tools.BatteryWidgetConfig.defaultSize,
        validSizes: Tools.BatteryWidgetConfig.validSizes,
        category: 'Utility'
    },
    'worry-shredder': {
        component: Tools.WorryShredder,
        label: '근심 파쇄기',
        defaultSize: Tools.WorryShredderConfig.defaultSize,
        validSizes: Tools.WorryShredderConfig.validSizes,
        category: 'Utility'
    },
    'scrap-note': {
        component: Tools.ScrapNote,
        label: '찢어진 노트',
        defaultSize: Tools.ScrapNoteConfig.defaultSize,
        validSizes: Tools.ScrapNoteConfig.validSizes,
        category: 'Utility'
    },
    'biorhythm': {
        component: Biorhythm,
        label: '바이오리듬',
        defaultSize: BiorhythmConfig.defaultSize,
        validSizes: BiorhythmConfig.validSizes,
        category: 'Utility'
    },
    'meditation-timer': {
        component: MeditationTimer,
        label: '명상 타이머',
        defaultSize: MeditationTimerConfig.defaultSize,
        validSizes: MeditationTimerConfig.validSizes,
        category: 'Utility'
    },
    'mandalart': {
        component: Mandalart,
        label: '만다라트 계획표',
        defaultSize: MandalartConfig.defaultSize,
        validSizes: MandalartConfig.validSizes,
        category: 'Utility'
    },
    'recipe-card': {
        component: RecipeCard,
        label: '레시피 카드',
        defaultSize: RecipeCardConfig.defaultSize,
        validSizes: RecipeCardConfig.validSizes,
        category: 'Utility'
    },
    'fandom-calendar': {
        component: FandomCalendar,
        label: '덕질 캘린더',
        defaultSize: FandomCalendarConfig.defaultSize,
        validSizes: FandomCalendarConfig.validSizes,
        category: 'Utility'
    },
    'worry-doll': {
        component: WorryDoll,
        label: '걱정 인형',
        defaultSize: WorryDollConfig.defaultSize,
        validSizes: WorryDollConfig.validSizes,
        category: 'Utility'
    },

    // Decoration & Collection
    'photo-gallery': {
        component: Decoration.PhotoGallery,
        label: '사진 갤러리',
        defaultSize: Decoration.PhotoGalleryConfig.defaultSize,
        validSizes: Decoration.PhotoGalleryConfig.validSizes,
        category: 'Decoration'
    },
    'polaroid': {
        component: Polaroid,
        label: '폴라로이드',
        defaultProps: { date: '2023.12.25', src: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400' },
        defaultSize: PolaroidConfig.defaultSize,
        validSizes: PolaroidConfig.validSizes,
        category: 'Decoration'
    },
    'instant-booth': {
        component: Decoration.InstantBooth,
        label: '인생네컷',
        defaultProps: {
            date: '2023.12.25',
            images: ['https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400']
        },
        defaultSize: Decoration.InstantBoothConfig.defaultSize,
        validSizes: Decoration.InstantBoothConfig.validSizes,
        category: 'Decoration'
    },
    'film-strip': {
        component: Decoration.FilmStrip,
        label: '필름 스트립',
        defaultProps: { images: ['https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400'] },
        defaultSize: Decoration.FilmStripConfig.defaultSize,
        validSizes: Decoration.FilmStripConfig.validSizes,
        category: 'Decoration'
    },
    'ocean-wave': {
        component: OceanWave,
        label: '바다 (파도)',
        defaultSize: OceanWaveConfig.defaultSize,
        validSizes: OceanWaveConfig.validSizes,
        category: 'Decoration'
    },
    'movie-ticket': {
        component: MovieTicket,
        label: '영화 티켓',
        defaultSize: MovieTicketConfig.defaultSize,
        validSizes: MovieTicketConfig.validSizes,
        category: 'Collection'
    },
    'bookshelf': {
        component: Bookshelf,
        label: '책장',
        defaultSize: BookshelfConfig.defaultSize,
        validSizes: BookshelfConfig.validSizes,
        category: 'Collection'
    },
    'stamp-collection': {
        component: StampCollection,
        label: '우표 수집',
        defaultSize: StampCollectionConfig.defaultSize,
        validSizes: StampCollectionConfig.validSizes,
        category: 'Collection'
    },
    'sky-map': {
        component: SkyMap,
        label: '하늘 지도',
        defaultSize: SkyMapConfig.defaultSize,
        validSizes: SkyMapConfig.validSizes,
        category: 'Decoration'
    },
    'birth-flower': {
        component: BirthFlower,
        label: '탄생화',
        defaultSize: BirthFlowerConfig.defaultSize,
        validSizes: BirthFlowerConfig.validSizes,
        category: 'Decoration'
    },
    'receipt-printer': {
        component: ReceiptPrinter,
        label: '영수증',
        defaultSize: ReceiptPrinterConfig.defaultSize,
        validSizes: ReceiptPrinterConfig.validSizes,
        category: 'Decoration'
    },
    'weather-stickers': {
        component: WeatherStickers,
        label: '날씨 스티커',
        defaultSize: WeatherStickersConfig.defaultSize,
        validSizes: WeatherStickersConfig.validSizes,
        category: 'Decoration'
    },

    'unit-converter': {
        component: Tools.UnitConverter,
        label: '단위 변환기',
        defaultSize: Tools.UnitConverterConfig.defaultSize,
        validSizes: Tools.UnitConverterConfig.validSizes,
        category: 'Utility'
    },
    'calculator': {
        component: Tools.Calculator,
        label: '계산기',
        defaultSize: Tools.CalculatorConfig.defaultSize,
        validSizes: Tools.CalculatorConfig.validSizes,
        category: 'Utility',
        minH: 2
    },
    'markdown-viewer': {
        component: Tools.MarkdownViewer,
        label: '마크다운 뷰어',
        defaultSize: Tools.MarkdownViewerConfig.defaultSize,
        validSizes: Tools.MarkdownViewerConfig.validSizes,
        category: 'Utility'
    },
    'random-picker': {
        component: Tools.RandomPicker,
        label: '랜덤 뽑기',
        defaultSize: Tools.RandomPickerConfig.defaultSize,
        validSizes: Tools.RandomPickerConfig.validSizes,
        category: 'Utility'
    },
    'ladder-game': {
        component: Tools.LadderGame,
        label: '사다리 타기',
        defaultSize: Tools.LadderGameConfig.defaultSize,
        validSizes: Tools.LadderGameConfig.validSizes,
        category: 'Utility'
    },
    'map-pin': {
        component: Tools.MapPin,
        label: '지도 핀',
        defaultSize: Tools.MapPinConfig.defaultSize,
        validSizes: Tools.MapPinConfig.validSizes,
        category: 'Utility'
    },
    'rss-reader': {
        component: Tools.RSSReader,
        label: 'RSS 리더',
        defaultSize: Tools.RSSReaderConfig.defaultSize,
        validSizes: Tools.RSSReaderConfig.validSizes,
        category: 'Utility'
    },
    'file-viewer': {
        component: Tools.FileViewer,
        label: '파일 뷰어',
        defaultSize: Tools.FileViewerConfig.defaultSize,
        validSizes: Tools.FileViewerConfig.validSizes,
        category: 'Utility'
    },


    'community': {
        component: Interactive.CommunityWidget,
        label: '커뮤니티',
        defaultSize: Interactive.CommunityWidgetConfig.defaultSize,
        validSizes: Interactive.CommunityWidgetConfig.validSizes,
        category: 'Decoration'
    },
    'moon-phase': {
        component: Decoration.MoonPhase,
        label: '달의 위상',
        defaultSize: Decoration.MoonPhaseConfig.defaultSize,
        validSizes: Decoration.MoonPhaseConfig.validSizes,
        category: 'Decoration'
    },
    'switch-board': {
        component: Decoration.SwitchBoard,
        label: '스위치',
        defaultSize: Decoration.SwitchBoardConfig.defaultSize,
        validSizes: Decoration.SwitchBoardConfig.validSizes,
        category: 'Decoration'
    },
    'fortune-cookie': {
        component: Decoration.FortuneCookie,
        label: '포춘 쿠키',
        defaultSize: Decoration.FortuneCookieConfig.defaultSize,
        validSizes: Decoration.FortuneCookieConfig.validSizes,
        category: 'Decoration'
    },
    'ootd': {
        component: OOTDSketch,
        label: 'OOTD',
        defaultSize: OOTDSketchConfig.defaultSize,
        validSizes: OOTDSketchConfig.validSizes,
        category: 'Decoration'
    },
    'book-cover': {
        component: Decoration.BookCover,
        label: '읽는 책',
        defaultSize: Decoration.BookCoverConfig.defaultSize,
        validSizes: Decoration.BookCoverConfig.validSizes,
        category: 'Decoration'
    },
    'bubble-wrap': {
        component: Decoration.BubbleWrap,
        label: '뽁뽁이',
        defaultSize: Decoration.BubbleWrapConfig.defaultSize,
        validSizes: Decoration.BubbleWrapConfig.validSizes,
        category: 'Decoration'
    },
    'transparent': {
        component: Decoration.TransparentSpacer,
        label: '투명 (공백)',
        defaultSize: Decoration.TransparentSpacerConfig.defaultSize,
        validSizes: Decoration.TransparentSpacerConfig.validSizes,
        category: 'Decoration'
    },

    // Static Items
    'favorite-char': {
        component: Decoration.FavoriteCharacter,
        label: '최애 캐릭터',
        defaultProps: { name: 'Kirby', src: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Kirby' },
        defaultSize: Decoration.FavoriteCharacterConfig.defaultSize,
        validSizes: Decoration.FavoriteCharacterConfig.validSizes,
        category: 'Decoration'
    },
    'color-chip': {
        component: Decoration.ColorChip,
        label: '컬러칩',
        defaultProps: { color: '#FFD700', name: 'Golden', code: '#FFD700' },
        defaultSize: Decoration.ColorChipConfig.defaultSize,
        validSizes: Decoration.ColorChipConfig.validSizes,
        category: 'Decoration'
    },
    'color-palette': {
        component: ColorPalette,
        label: '컬러 팔레트',
        defaultSize: ColorPaletteConfig.defaultSize,
        validSizes: ColorPaletteConfig.validSizes,
        category: 'Tool'
    },
    'movie-scene': {
        component: Decoration.MovieScene,
        label: '영화 명장면',
        defaultProps: { src: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400', quote: 'Here\'s looking at you, kid.' },
        defaultSize: Decoration.MovieSceneConfig.defaultSize,
        validSizes: Decoration.MovieSceneConfig.validSizes,
        category: 'Decoration'
    },
    'ticket': {
        component: Decoration.TicketStub,
        label: '티켓',
        defaultProps: { title: 'Movie Night', date: '24.12.24', seat: 'H12' },
        defaultSize: Decoration.TicketStubConfig.defaultSize,
        validSizes: Decoration.TicketStubConfig.validSizes,
        category: 'Decoration'
    },
    'neon': {
        component: Decoration.NeonSign,
        label: '네온 사인',
        defaultProps: { text: 'DREAM', color: '#ff00ff' },
        defaultSize: Decoration.NeonSignConfig.defaultSize,
        validSizes: Decoration.NeonSignConfig.validSizes,
        category: 'Decoration'
    },
    'candle': {
        component: Decoration.Candle,
        label: '양초',
        defaultSize: Decoration.CandleConfig.defaultSize,
        validSizes: Decoration.CandleConfig.validSizes,
        category: 'Decoration'
    },
    'text-scroller': {
        component: Decoration.TextScroller,
        label: '텍스트 전광판',
        defaultProps: { text: 'HELLO WORLD' },
        defaultSize: Decoration.TextScrollerConfig.defaultSize,
        validSizes: Decoration.TextScrollerConfig.validSizes,
        category: 'Decoration'
    },
    'window-view': {
        component: Decoration.WindowView,
        label: '창밖 풍경',
        defaultSize: Decoration.WindowViewConfig.defaultSize,
        validSizes: Decoration.WindowViewConfig.validSizes,
        category: 'Decoration'
    },
    'payphone': {
        component: Payphone,
        label: '공중전화',
        defaultSize: PayphoneConfig.defaultSize,
        validSizes: PayphoneConfig.validSizes,
        category: 'Interactive'
    },
    'typewriter': {
        component: Typewriter,
        label: '타자기',
        defaultSize: TypewriterConfig.defaultSize,
        validSizes: TypewriterConfig.validSizes,
        category: 'Tool'
    },

    // Interactive
    'digital-plant': {
        component: Interactive.DigitalPlant,
        label: '반려 식물',
        defaultSize: Interactive.DigitalPlantConfig.defaultSize,
        validSizes: Interactive.DigitalPlantConfig.validSizes,
        category: 'Interactive'
    },
    'dessert-case': {
        component: Interactive.DessertCase,
        label: '간식 진열대',
        defaultSize: Interactive.DessertCaseConfig.defaultSize,
        validSizes: Interactive.DessertCaseConfig.validSizes,
        category: 'Interactive'
    },
    'cat-chaser': {
        component: Interactive.CatChaser,
        label: '따라오는 고양이',
        defaultSize: Interactive.CatChaserConfig.defaultSize,
        validSizes: Interactive.CatChaserConfig.validSizes,
        category: 'Interactive'
    },
    'snow-globe': {
        component: Interactive.SnowGlobe,
        label: '스노우볼',
        defaultSize: Interactive.SnowGlobeConfig.defaultSize,
        validSizes: Interactive.SnowGlobeConfig.validSizes,
        category: 'Interactive'
    },
    'lp-player': {
        component: LPPlayer,
        label: '턴테이블',
        defaultSize: LPPlayerConfig.defaultSize,
        validSizes: LPPlayerConfig.validSizes,
        category: 'Interactive'
    },
    'asmr-mixer': {
        component: ASMRMixer,
        label: 'ASMR 믹서',
        defaultSize: ASMRMixerConfig.defaultSize,
        validSizes: ASMRMixerConfig.validSizes,
        category: 'Interactive'
    },
    'bonfire': {
        component: Bonfire,
        label: '모닥불',
        defaultSize: BonfireConfig.defaultSize,
        validSizes: BonfireConfig.validSizes,
        category: 'Interactive'
    },

    // New Standard Widgets
    'chat-diary': {
        component: Diary.ChatDiary,
        label: '나와의 채팅',
        defaultSize: Diary.ChatDiaryConfig.defaultSize,
        validSizes: Diary.ChatDiaryConfig.validSizes,
        category: 'Diary & Emotion'
    },
    'tag-cloud': { component: Tools.TagCloud, label: '태그 구름', defaultSize: '2x2', category: 'Utility' },
    'timeline': { component: Tools.Timeline, label: '세로 타임라인', defaultSize: '1x2', category: 'Utility' },
    'scratch-card': {
        component: Interactive.ScratchCard,
        label: '복권 긁기',
        defaultSize: Interactive.ScratchCardConfig.defaultSize,
        validSizes: Interactive.ScratchCardConfig.validSizes,
        category: 'Interactive'
    },
    'switches': {
        component: Interactive.Switches,
        label: '스위치 & 레버',
        defaultSize: Interactive.SwitchesConfig.defaultSize,
        validSizes: Interactive.SwitchesConfig.validSizes,
        category: 'Interactive'
    },

    // Global Effect Controllers
    'cursor-trail': { component: Controllers.CursorTrail, label: '커서 트레일', defaultSize: '1x1', category: 'Global' },
    'highlighter': { component: Controllers.Highlighter, label: '형광펜 모드', defaultSize: '1x1', category: 'Global' },
    'physics-box': { component: Controllers.PhysicsBox, label: '물리 상자', defaultSize: '1x1', category: 'Global' },
    'magnifier': { component: Controllers.Magnifier, label: '돋보기', defaultSize: '1x1', category: 'Global' },
    'ruby-text': { component: Controllers.RubyText, label: '루비 문자', defaultSize: '1x1', category: 'Global' },
};

// Auto-load saved configurations from DB (localStorage)
if (typeof window !== 'undefined') {
    try {
        Object.keys(WIDGET_REGISTRY).forEach(type => {
            const savedConfig = localStorage.getItem(`widget-config-${type}`);
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                if (config.defaultSize) {
                    WIDGET_REGISTRY[type].defaultSize = config.defaultSize;
                }
            }
        });
    } catch (e) {
        console.error('Failed to load widget configurations:', e);
    }
}

export type WidgetType = keyof typeof WIDGET_REGISTRY;
