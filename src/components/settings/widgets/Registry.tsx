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
import BlockRenderer from "./customwidget/components/BlockRenderer.tsx";

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

export const WIDGET_REGISTRY: Record<string, { component: React.ComponentType<any>, label: string, description?: string, defaultProps?: any, defaultSize?: string, category: string, minW?: number, minH?: number, validSizes?: [number, number][], keywords?: string[] }> = {
    // System
    'welcome': {
        component: System.WelcomeWidget,
        label: '환영 메시지',
        description: '사용자에게 환영 인사를 전하는 위젯입니다.',
        defaultSize: System.WelcomeWidgetConfig.defaultSize,
        validSizes: System.WelcomeWidgetConfig.validSizes,
        category: 'System',
        keywords: ['인사', 'welcome', 'hello']
    },
    'theme-guide': {
        component: System.ThemeGuideWidget,
        label: '테마 가이드',
        description: '현재 적용된 테마의 색상과 스타일 가이드를 보여줍니다.',
        defaultSize: System.ThemeGuideWidgetConfig.defaultSize,
        validSizes: System.ThemeGuideWidgetConfig.validSizes,
        category: 'System',
        keywords: ['color', 'font', 'style', '정보']
    },
    'feature-card': {
        component: System.FeatureCard,
        label: '기능 카드',
        description: '주요 기능을 소개하는 카드형 위젯입니다.',
        defaultSize: System.FeatureCardConfig.defaultSize,
        validSizes: System.FeatureCardConfig.validSizes,
        category: 'System'
    },

    // Data & Logic (New)
    'formula-block': {
        component: Logic.FormulaBlock,
        label: '수식 블록',
        description: '간단한 수식을 계산하고 결과를 보여줍니다.',
        defaultSize: Logic.FormulaBlockConfig.defaultSize,
        validSizes: Logic.FormulaBlockConfig.validSizes,
        category: 'Data & Logic',
        keywords: ['계산', 'math', 'calc']
    },
    'relation-link': {
        component: Logic.RelationLink,
        label: '관계형 링크',
        description: '다른 위젯이나 데이터 간의 관계를 시각화합니다.',
        defaultSize: Logic.RelationLinkConfig.defaultSize,
        validSizes: Logic.RelationLinkConfig.validSizes,
        category: 'Data & Logic',
        keywords: ['link', 'connect', '연결']
    },
    'rollup': {
        component: Logic.Rollup,
        label: '롤업',
        description: '데이터를 요약하고 집계하여 보여줍니다.',
        defaultSize: Logic.RollupConfig.defaultSize,
        validSizes: Logic.RollupConfig.validSizes,
        category: 'Data & Logic',
        keywords: ['sum', 'summary', '집계']
    },
    'property-toggle': {
        component: Logic.PropertyToggle,
        label: '속성 토글',
        description: '객체의 속성을 켜거나 끌 수 있는 스위치입니다.',
        defaultSize: Logic.PropertyToggleConfig.defaultSize,
        validSizes: Logic.PropertyToggleConfig.validSizes,
        category: 'Data & Logic',
        keywords: ['switch', 'on', 'off']
    },

    // Diary & Emotion
    // Diary & Emotion
    'ai-diary': {
        component: Diary.AIDiary,
        label: 'AI 감정 분석',
        description: '작성된 일기를 바탕으로 감정을 분석해줍니다.',
        defaultSize: Diary.AIDiaryConfig.defaultSize,
        validSizes: Diary.AIDiaryConfig.validSizes,
        category: 'Diary & Emotion',
        keywords: ['ai', 'emotion', '분석']
    },
    'daily-diary': {
        component: Diary.DailyDiary,
        label: '오늘의 일기',
        description: '오늘 하루 있었던 일을 기록하는 기본적인 일기장입니다.',
        defaultSize: Diary.DailyDiaryConfig.defaultSize,
        validSizes: Diary.DailyDiaryConfig.validSizes,
        category: 'Diary & Emotion',
        keywords: ['diary', 'journal', '기록', '글쓰기']
    },
    'random-diary': {
        component: Diary.RandomDiary,
        label: '랜덤 일기',
        description: '무작위 주제로 일기를 쓸 수 있게 도와줍니다.',
        defaultSize: Diary.RandomDiaryConfig.defaultSize,
        validSizes: Diary.RandomDiaryConfig.validSizes,
        category: 'Diary & Emotion',
        keywords: ['random', 'topic', '주제']
    },
    'exchange-diary': {
        component: Diary.ExchangeDiary,
        label: '교환 일기',
        description: '친구와 함께 일기를 공유하고 교환할 수 있습니다.',
        defaultSize: Diary.ExchangeDiaryConfig.defaultSize,
        validSizes: Diary.ExchangeDiaryConfig.validSizes,
        category: 'Diary & Emotion',
        keywords: ['share', 'friend', '공유']
    },
    'past-today': {
        component: Diary.PastToday,
        label: '과거의 오늘',
        description: '과거의 오늘 날짜에 썼던 일기를 보여줍니다.',
        defaultSize: Diary.PastTodayConfig.defaultSize,
        validSizes: Diary.PastTodayConfig.validSizes,
        category: 'Diary & Emotion',
        keywords: ['past', 'history', '추억']
    },
    'my-persona': {
        component: System.MyPersona,
        label: '나의 페르소나',
        description: '나의 성격이나 특성을 페르소나 카드로 표현합니다.',
        defaultSize: System.MyPersonaConfig.defaultSize,
        validSizes: System.MyPersonaConfig.validSizes,
        category: 'Diary & Emotion',
        keywords: ['profile', 'character', '성격']
    },
    'emotion-analysis': {
        component: Diary.EmotionAnalysis,
        label: '감정 분석',
        description: '감정 상태를 분석하여 시각적인 데이터로 보여줍니다.',
        defaultSize: Diary.EmotionAnalysisConfig.defaultSize,
        validSizes: Diary.EmotionAnalysisConfig.validSizes,
        category: 'Diary & Emotion',
        keywords: ['chart', 'graph', '통계']
    },
    'compliment-jar': {
        component: Diary.ComplimentJar,
        label: '칭찬 저금통',
        description: '스스로에게 해준 칭찬을 모아두는 저금통입니다.',
        defaultSize: Diary.ComplimentJarConfig.defaultSize,
        validSizes: Diary.ComplimentJarConfig.validSizes,
        category: 'Diary & Emotion',
        keywords: ['praise', 'jar', '저금']
    },
    'emotional-weather': {
        component: Diary.EmotionalWeather,
        label: '마음 날씨',
        description: '오늘의 기분을 날씨 아이콘으로 표현합니다.',
        defaultSize: Diary.EmotionalWeatherConfig.defaultSize,
        validSizes: Diary.EmotionalWeatherConfig.validSizes,
        category: 'Diary & Emotion',
        keywords: ['mood', 'weather', '기분']
    },
    'dream-log': {
        component: Diary.DreamLog,
        label: '꿈 기록장',
        description: '지난 밤에 꾼 꿈을 기록하고 해몽을 찾아봅니다.',
        defaultSize: Diary.DreamLogConfig.defaultSize,
        validSizes: Diary.DreamLogConfig.validSizes,
        category: 'Diary & Emotion',
        keywords: ['dream', 'sleep', '잠']
    },
    'daily-stamp': {
        component: Diary.DailyStamp,
        label: '참 잘했어요',
        description: '하루 동안 잘한 일에 도장을 찍어 칭찬합니다.',
        defaultSize: Diary.DailyStampConfig.defaultSize,
        validSizes: Diary.DailyStampConfig.validSizes,
        category: 'Diary & Emotion',
        keywords: ['stamp', 'check', '도장']
    },

    // Utility
    'time-machine': {
        component: Interactive.TimeMachine,
        label: '타임머신',
        description: '미래의 나에게 편지를 보내거나 과거를 회상합니다.',
        defaultSize: Interactive.TimeMachineConfig.defaultSize,
        validSizes: Interactive.TimeMachineConfig.validSizes,
        category: 'Utility',
        keywords: ['letter', 'future', 'past', '편지']
    },
    'todo-list': {
        component: Tools.TodoListWidget,
        label: '할 일 목록',
        description: '해야 할 일들을 목록으로 관리하고 체크합니다.',
        defaultSize: Tools.TodoListConfig.defaultSize,
        validSizes: Tools.TodoListConfig.validSizes,
        category: 'Utility',
        keywords: ['todo', 'list', 'check', '투두', '리스트', '체크', '할일']
    },
    'weather': {
        component: Tools.WeatherWidget,
        label: '날씨',
        description: '현재 위치의 실시간 날씨 정보를 제공합니다.',
        defaultSize: Tools.WeatherWidgetConfig.defaultSize,
        validSizes: Tools.WeatherWidgetConfig.validSizes,
        category: 'Utility',
        keywords: ['weather', 'temp', '온도', '기온']
    },
    'notification': {
        component: Tools.NotificationSet,
        label: '알림 설정',
        description: '앱 내 알림을 설정하고 관리합니다.',
        defaultSize: Tools.NotificationConfig.defaultSize,
        validSizes: Tools.NotificationConfig.validSizes,
        category: 'Utility',
        keywords: ['alert', 'alarm', 'push', '알람']
    },
    'clock': {
        component: Tools.ClockWidget,
        label: '시계',
        description: '다양한 스타일의 시계로 현재 시간을 확인합니다.',
        defaultSize: Tools.ClockWidgetConfig.defaultSize,
        validSizes: Tools.ClockWidgetConfig.validSizes,
        category: 'Utility',
        keywords: ['time', 'watch', '시간']
    },
    'dday': {
        component: Tools.DDayList,
        label: 'D-Day',
        description: '중요한 날까지 남은 날짜를 카운트다운합니다.',
        defaultSize: Tools.DDayListConfig.defaultSize,
        validSizes: Tools.DDayListConfig.validSizes,
        category: 'Utility',
        keywords: ['calendar', 'date', 'anniversary', '기념일', '날짜']
    },
    'dday-balloon': {
        component: Tools.DDayBalloon,
        label: '풍선 D-Day',
        description: '다가오는 D-Day를 풍선 애니메이션과 함께 보여줍니다.',
        defaultSize: Tools.DDayBalloonConfig.defaultSize,
        validSizes: Tools.DDayBalloonConfig.validSizes,
        category: 'Utility',
        keywords: ['balloon', 'party', 'celebration', '축하']
    },
    'quick-links': {
        component: Tools.QuickLinks,
        label: '바로가기',
        description: '자주 방문하는 웹사이트나 기능으로 빠르게 이동합니다.',
        defaultSize: Tools.QuickLinksConfig.defaultSize,
        validSizes: Tools.QuickLinksConfig.validSizes,
        category: 'Utility',
        keywords: ['bookmark', 'url', 'shortcut', '북마크', '링크']
    },
    'streak': {
        component: Tools.StreakWidget,
        label: '연속 기록',
        description: '습관이나 목표 달성을 위한 연속 기록을 추적합니다.',
        defaultSize: Tools.StreakWidgetConfig.defaultSize,
        validSizes: Tools.StreakWidgetConfig.validSizes,
        category: 'Utility',
        keywords: ['habit', 'goal', 'track', '습관', '목표']
    },
    'stats': {
        component: Tools.StatsWidget,
        label: '통계',
        description: '사용자의 활동 데이터를 그래프와 차트로 보여줍니다.',
        defaultSize: Tools.StatsWidgetConfig.defaultSize,
        validSizes: Tools.StatsWidgetConfig.validSizes,
        category: 'Utility',
        keywords: ['chart', 'graph', 'data', '분석']
    },
    'battery': {
        component: Tools.BatteryWidget,
        label: '내 에너지',
        description: '나의 현재 에너지 레벨을 배터리 모양으로 표시합니다.',
        defaultSize: Tools.BatteryWidgetConfig.defaultSize,
        validSizes: Tools.BatteryWidgetConfig.validSizes,
        category: 'Utility',
        keywords: ['energy', 'power', 'status', '상태']
    },
    'worry-shredder': {
        component: Tools.WorryShredder,
        label: '근심 파쇄기',
        description: '걱정거리를 적고 파쇄기에 넣어 없애버리세요.',
        defaultSize: Tools.WorryShredderConfig.defaultSize,
        validSizes: Tools.WorryShredderConfig.validSizes,
        category: 'Utility',
        keywords: ['stress', 'delete', 'remove', '걱정', '삭제', '파쇄']
    },
    'scrap-note': {
        component: Tools.ScrapNote,
        label: '찢어진 노트',
        description: '간단한 메모를 남길 수 있는 빈티지 노트입니다.',
        defaultSize: Tools.ScrapNoteConfig.defaultSize,
        validSizes: Tools.ScrapNoteConfig.validSizes,
        category: 'Utility',
        keywords: ['memo', 'note', 'write', '메모']
    },
    'biorhythm': {
        component: Biorhythm,
        label: '바이오리듬',
        description: '신체, 감성, 지성 리듬의 상태를 확인합니다.',
        defaultSize: BiorhythmConfig.defaultSize,
        validSizes: BiorhythmConfig.validSizes,
        category: 'Utility',
        keywords: ['health', 'body', 'mind', '건강']
    },
    'meditation-timer': {
        component: MeditationTimer,
        label: '명상 타이머',
        description: '집중과 휴식을 위한 명상 타이머입니다.',
        defaultSize: MeditationTimerConfig.defaultSize,
        validSizes: MeditationTimerConfig.validSizes,
        category: 'Utility',
        keywords: ['relax', 'focus', 'zen', '휴식']
    },
    'mandalart': {
        component: Mandalart,
        label: '만다라트 계획표',
        description: '목표 달성을 위한 만다라트 계획표를 작성합니다.',
        defaultSize: MandalartConfig.defaultSize,
        validSizes: MandalartConfig.validSizes,
        category: 'Utility',
        keywords: ['plan', 'goal', 'grid', '계획']
    },
    'recipe-card': {
        component: RecipeCard,
        label: '레시피 카드',
        description: '좋아하는 요리 레시피를 카드 형태로 보관합니다.',
        defaultSize: RecipeCardConfig.defaultSize,
        validSizes: RecipeCardConfig.validSizes,
        category: 'Utility',
        keywords: ['cook', 'food', 'kitchen', '요리', '음식']
    },
    'fandom-calendar': {
        component: FandomCalendar,
        label: '덕질 캘린더',
        description: '좋아하는 연예인이나 캐릭터의 일정을 관리합니다.',
        defaultSize: FandomCalendarConfig.defaultSize,
        validSizes: FandomCalendarConfig.validSizes,
        category: 'Utility',
        keywords: ['idol', 'schedule', 'fan', '덕질']
    },
    'worry-doll': {
        component: WorryDoll,
        label: '걱정 인형',
        description: '걱정 인형에게 고민을 털어놓고 마음을 비우세요.',
        defaultSize: WorryDollConfig.defaultSize,
        validSizes: WorryDollConfig.validSizes,
        category: 'Utility',
        keywords: ['doll', 'listen', 'comfort', '위로']
    },

    // Decoration & Collection
    'photo-gallery': {
        component: Decoration.PhotoGallery,
        label: '사진 갤러리',
        description: '소중한 추억이 담긴 사진들을 갤러리로 꾸밉니다.',
        defaultSize: Decoration.PhotoGalleryConfig.defaultSize,
        validSizes: Decoration.PhotoGalleryConfig.validSizes,
        category: 'Decoration',
        keywords: ['image', 'picture', 'album', '앨범']
    },
    'polaroid': {
        component: Polaroid,
        label: '폴라로이드',
        description: '감성적인 폴라로이드 사진으로 화면을 장식합니다.',
        defaultProps: { date: '2023.12.25', src: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400' },
        defaultSize: PolaroidConfig.defaultSize,
        validSizes: PolaroidConfig.validSizes,
        category: 'Decoration',
        keywords: ['photo', 'retro', 'camera', '사진']
    },
    'instant-booth': {
        component: Decoration.InstantBooth,
        label: '인생네컷',
        description: '네 컷 사진으로 특별한 순간을 기록합니다.',
        defaultProps: {
            date: '2023.12.25',
            images: ['https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400']
        },
        defaultSize: Decoration.InstantBoothConfig.defaultSize,
        validSizes: Decoration.InstantBoothConfig.validSizes,
        category: 'Decoration',
        keywords: ['photo', '4cut', 'sticker', '사진']
    },
    'film-strip': {
        component: Decoration.FilmStrip,
        label: '필름 스트립',
        description: '영화 필름처럼 사진을 나열하여 보여줍니다.',
        defaultProps: { images: ['https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400'] },
        defaultSize: Decoration.FilmStripConfig.defaultSize,
        validSizes: Decoration.FilmStripConfig.validSizes,
        category: 'Decoration',
        keywords: ['movie', 'cinema', 'photo', '영화']
    },
    'ocean-wave': {
        component: OceanWave,
        label: '바다 (파도)',
        description: '잔잔한 파도 소리와 함께 바다 풍경을 감상합니다.',
        defaultSize: OceanWaveConfig.defaultSize,
        validSizes: OceanWaveConfig.validSizes,
        category: 'Decoration',
        keywords: ['sea', 'water', 'relax', '바다', '물']
    },
    'movie-ticket': {
        component: MovieTicket,
        label: '영화 티켓',
        description: '관람한 영화 티켓을 모아두는 컬렉션입니다.',
        defaultSize: MovieTicketConfig.defaultSize,
        validSizes: MovieTicketConfig.validSizes,
        category: 'Collection',
        keywords: ['ticket', 'cinema', 'record', '영화']
    },
    'bookshelf': {
        component: Bookshelf,
        label: '책장',
        description: '읽은 책이나 읽고 싶은 책을 책장에 정리합니다.',
        defaultSize: BookshelfConfig.defaultSize,
        validSizes: BookshelfConfig.validSizes,
        category: 'Collection',
        keywords: ['book', 'read', 'library', '도서']
    },
    'stamp-collection': {
        component: StampCollection,
        label: '우표 수집',
        description: '다양한 디자인의 우표를 수집하고 감상합니다.',
        defaultSize: StampCollectionConfig.defaultSize,
        validSizes: StampCollectionConfig.validSizes,
        category: 'Collection',
        keywords: ['stamp', 'post', 'mail', '우표']
    },
    'sky-map': {
        component: SkyMap,
        label: '하늘 지도',
        description: '현재 밤하늘의 별자리와 천체를 보여줍니다.',
        defaultSize: SkyMapConfig.defaultSize,
        validSizes: SkyMapConfig.validSizes,
        category: 'Decoration',
        keywords: ['star', 'constellation', 'space', '별', '우주']
    },
    'birth-flower': {
        component: BirthFlower,
        label: '탄생화',
        description: '나의 탄생화와 꽃말을 알려주는 위젯입니다.',
        defaultSize: BirthFlowerConfig.defaultSize,
        validSizes: BirthFlowerConfig.validSizes,
        category: 'Decoration',
        keywords: ['flower', 'birthday', 'plant', '꽃']
    },
    'receipt-printer': {
        component: ReceiptPrinter,
        label: '영수증',
        description: '소비 내역을 감각적인 영수증 형태로 정리합니다.',
        defaultSize: ReceiptPrinterConfig.defaultSize,
        validSizes: ReceiptPrinterConfig.validSizes,
        category: 'Decoration',
        keywords: ['bill', 'cost', 'money', '돈', '지출']
    },
    'weather-stickers': {
        component: WeatherStickers,
        label: '날씨 스티커',
        description: '귀여운 스티커로 날씨를 표현하고 꾸밉니다.',
        defaultSize: WeatherStickersConfig.defaultSize,
        validSizes: WeatherStickersConfig.validSizes,
        category: 'Decoration',
        keywords: ['weather', 'deco', 'cute', '꾸미기']
    },

    'unit-converter': {
        component: Tools.UnitConverter,
        label: '단위 변환기',
        description: '길이, 무게, 온도 등 다양한 단위를 변환합니다.',
        defaultSize: Tools.UnitConverterConfig.defaultSize,
        validSizes: Tools.UnitConverterConfig.validSizes,
        category: 'Utility',
        keywords: ['convert', 'measure', 'scale', '변환']
    },
    'calculator': {
        component: Tools.Calculator,
        label: '계산기',
        description: '간단한 사칙연산을 수행할 수 있는 계산기입니다.',
        defaultSize: Tools.CalculatorConfig.defaultSize,
        validSizes: Tools.CalculatorConfig.validSizes,
        category: 'Utility',
        minH: 2,
        keywords: ['math', 'plus', 'minus', '더하기']
    },
    'markdown-viewer': {
        component: Tools.MarkdownViewer,
        label: '마크다운 뷰어',
        description: '마크다운 문서를 미리보기하고 서식을 확인합니다.',
        defaultSize: Tools.MarkdownViewerConfig.defaultSize,
        validSizes: Tools.MarkdownViewerConfig.validSizes,
        category: 'Utility',
        keywords: ['md', 'text', 'doc', '문서']
    },
    'random-picker': {
        component: Tools.RandomPicker,
        label: '랜덤 뽑기',
        description: '무작위 추첨이나 제비뽑기를 할 때 유용합니다.',
        defaultSize: Tools.RandomPickerConfig.defaultSize,
        validSizes: Tools.RandomPickerConfig.validSizes,
        category: 'Utility',
        keywords: ['lottery', 'luck', 'choice', '추첨']
    },
    'ladder-game': {
        component: Tools.LadderGame,
        label: '사다리 타기',
        description: '순서 정하기나 당번 정하기에 좋은 사다리 게임입니다.',
        defaultSize: Tools.LadderGameConfig.defaultSize,
        validSizes: Tools.LadderGameConfig.validSizes,
        category: 'Utility',
        keywords: ['game', 'team', 'order', '게임']
    },
    'map-pin': {
        component: Tools.MapPin,
        label: '지도 핀',
        description: '지도 위에 주요 장소를 핀으로 표시합니다.',
        defaultSize: Tools.MapPinConfig.defaultSize,
        validSizes: Tools.MapPinConfig.validSizes,
        category: 'Utility',
        keywords: ['location', 'place', 'gps', '위치']
    },
    'rss-reader': {
        component: Tools.RSSReader,
        label: '기사 모음',
        description: '구독한 RSS 피드의 최신 글을 모아봅니다.',
        defaultSize: Tools.RSSReaderConfig.defaultSize,
        validSizes: Tools.RSSReaderConfig.validSizes,
        category: 'Utility',
        keywords: ['news', 'feed', 'blog', '뉴스']
    },
    'file-viewer': {
        component: Tools.FileViewer,
        label: '파일 뷰어',
        description: '다양한 형식의 파일을 열람할 수 있는 뷰어입니다.',
        defaultSize: Tools.FileViewerConfig.defaultSize,
        validSizes: Tools.FileViewerConfig.validSizes,
        category: 'Utility',
        keywords: ['view', 'read', 'open', '파일']
    },


    'community': {
        component: Interactive.CommunityWidget,
        label: '커뮤니티',
        description: '다른 사용자들과 소통할 수 있는 커뮤니티 공간입니다.',
        defaultSize: Interactive.CommunityWidgetConfig.defaultSize,
        validSizes: Interactive.CommunityWidgetConfig.validSizes,
        category: 'Decoration',
        keywords: ['chat', 'talk', 'social', '소통']
    },
    'moon-phase': {
        component: Decoration.MoonPhase,
        label: '달의 위상',
        description: '오늘 밤 달의 모양(위상)을 보여줍니다.',
        defaultSize: Decoration.MoonPhaseConfig.defaultSize,
        validSizes: Decoration.MoonPhaseConfig.validSizes,
        category: 'Decoration',
        keywords: ['moon', 'night', 'sky', '달']
    },
    'switch-board': {
        component: Decoration.SwitchBoard,
        label: '스위치',
        description: '딸깍거리는 소리와 함께 켜고 끄는 재미가 있는 스위치입니다.',
        defaultSize: Decoration.SwitchBoardConfig.defaultSize,
        validSizes: Decoration.SwitchBoardConfig.validSizes,
        category: 'Decoration',
        keywords: ['click', 'toggle', 'button', '버튼']
    },
    'fortune-cookie': {
        component: Decoration.FortuneCookie,
        label: '포춘 쿠키',
        description: '쿠키를 깨서 오늘의 운세를 점쳐보세요.',
        defaultSize: Decoration.FortuneCookieConfig.defaultSize,
        validSizes: Decoration.FortuneCookieConfig.validSizes,
        category: 'Decoration',
        keywords: ['luck', 'future', 'snack', '운세']
    },
    'ootd': {
        component: OOTDSketch,
        label: 'OOTD',
        description: '오늘의 복장(Outfit Of The Day)을 그리고 기록합니다.',
        defaultSize: OOTDSketchConfig.defaultSize,
        validSizes: OOTDSketchConfig.validSizes,
        category: 'Decoration',
        keywords: ['fashion', 'clothes', 'style', '옷', '패션']
    },
    'book-cover': {
        component: Decoration.BookCover,
        label: '읽는 책',
        description: '현재 읽고 있는 책의 표지를 장식해두세요.',
        defaultSize: Decoration.BookCoverConfig.defaultSize,
        validSizes: Decoration.BookCoverConfig.validSizes,
        category: 'Decoration',
        keywords: ['book', 'reading', 'cover', '독서']
    },
    'bubble-wrap': {
        component: Decoration.BubbleWrap,
        label: '뽁뽁이',
        description: '무한 뽁뽁이로 스트레스를 해소하세요.',
        defaultSize: Decoration.BubbleWrapConfig.defaultSize,
        validSizes: Decoration.BubbleWrapConfig.validSizes,
        category: 'Decoration',
        keywords: ['pop', 'stress', 'toy', '장난감']
    },
    'transparent': {
        component: Decoration.TransparentSpacer,
        label: '투명 (공백)',
        description: '화면에 여백을 주고 싶을 때 사용하는 투명 위젯입니다.',
        defaultSize: Decoration.TransparentSpacerConfig.defaultSize,
        validSizes: Decoration.TransparentSpacerConfig.validSizes,
        category: 'Decoration',
        keywords: ['empty', 'space', 'blank', '여백']
    },

    // Static Items
    'favorite-char': {
        component: Decoration.FavoriteCharacter,
        label: '최애 캐릭터',
        description: '가장 좋아하는 캐릭터 이미지를 띄워두세요.',
        defaultProps: { name: 'Kirby', src: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Kirby' },
        defaultSize: Decoration.FavoriteCharacterConfig.defaultSize,
        validSizes: Decoration.FavoriteCharacterConfig.validSizes,
        category: 'Decoration',
        keywords: ['image', 'avatar', 'love', '캐릭터']
    },
    'color-chip': {
        component: Decoration.ColorChip,
        label: '컬러칩',
        description: '영감을 주는 색상을 저장해두는 컬러칩입니다.',
        defaultProps: { color: '#FFD700', name: 'Golden', code: '#FFD700' },
        defaultSize: Decoration.ColorChipConfig.defaultSize,
        validSizes: Decoration.ColorChipConfig.validSizes,
        category: 'Decoration',
        keywords: ['color', 'paint', 'code', '색상']
    },
    'color-palette': {
        component: ColorPalette,
        label: '컬러 팔레트',
        description: '나만의 색상 팔레트를 만들고 조합해보세요.',
        defaultSize: ColorPaletteConfig.defaultSize,
        validSizes: ColorPaletteConfig.validSizes,
        category: 'Tool',
        keywords: ['colors', 'mix', 'art', '미술']
    },
    'movie-scene': {
        component: Decoration.MovieScene,
        label: '영화 명장면',
        description: '영화 속 명장면과 명대사를 기록합니다.',
        defaultProps: { src: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400', quote: 'Here\'s looking at you, kid.' },
        defaultSize: Decoration.MovieSceneConfig.defaultSize,
        validSizes: Decoration.MovieSceneConfig.validSizes,
        category: 'Decoration',
        keywords: ['movie', 'scene', 'quote', '명대사']
    },
    'ticket': {
        component: Decoration.TicketStub,
        label: '티켓',
        description: '공연이나 영화 티켓을 보관하는 티켓북입니다.',
        defaultProps: { title: 'Movie Night', date: '24.12.24', seat: 'H12' },
        defaultSize: Decoration.TicketStubConfig.defaultSize,
        validSizes: Decoration.TicketStubConfig.validSizes,
        category: 'Decoration',
        keywords: ['ticket', 'stub', 'entry', '입장권']
    },
    'neon': {
        component: Decoration.NeonSign,
        label: '네온 사인',
        description: '화려하게 빛나는 네온 사인으로 문구를 꾸밉니다.',
        defaultProps: { text: 'DREAM', color: '#ff00ff' },
        defaultSize: Decoration.NeonSignConfig.defaultSize,
        validSizes: Decoration.NeonSignConfig.validSizes,
        category: 'Decoration',
        keywords: ['light', 'sign', 'glow', '조명']
    },
    'candle': {
        component: Decoration.Candle,
        label: '양초',
        description: '흔들리는 촛불을 보며 힐링하는 위젯입니다.',
        defaultSize: Decoration.CandleConfig.defaultSize,
        validSizes: Decoration.CandleConfig.validSizes,
        category: 'Decoration',
        keywords: ['fire', 'light', 'relax', '불']
    },
    'text-scroller': {
        component: Decoration.TextScroller,
        label: '텍스트 전광판',
        description: '메시지가 흐르는 LED 전광판 효과를 냅니다.',
        defaultProps: { text: 'HELLO WORLD' },
        defaultSize: Decoration.TextScrollerConfig.defaultSize,
        validSizes: Decoration.TextScrollerConfig.validSizes,
        category: 'Decoration',
        keywords: ['led', 'sign', 'scroll', '글자']
    },

    'payphone': {
        component: Payphone,
        label: '공중전화',
        description: '레트로 감성의 공중전화로 전화를 걸어보세요.',
        defaultSize: PayphoneConfig.defaultSize,
        validSizes: PayphoneConfig.validSizes,
        category: 'Interactive',
        keywords: ['call', 'phone', 'retro', '전화']
    },
    'typewriter': {
        component: Typewriter,
        label: '타자기',
        description: '타닥타닥 소리가 나는 타자기로 글을 써보세요.',
        defaultSize: TypewriterConfig.defaultSize,
        validSizes: TypewriterConfig.validSizes,
        category: 'Tool',
        keywords: ['write', 'retro', 'text', '글']
    },

    // Interactive
    'digital-plant': {
        component: Interactive.DigitalPlant,
        label: '반려 식물',
        description: '화면에 물을 주고 키울 수 있는 디지털 식물입니다.',
        defaultSize: Interactive.DigitalPlantConfig.defaultSize,
        validSizes: Interactive.DigitalPlantConfig.validSizes,
        category: 'Interactive',
        keywords: ['grow', 'water', 'pet', '식물']
    },
    'dessert-case': {
        component: Interactive.DessertCase,
        label: '간식 진열대',
        description: '맛있는 간식들을 진열해놓고 하나씩 꺼내보세요.',
        defaultSize: Interactive.DessertCaseConfig.defaultSize,
        validSizes: Interactive.DessertCaseConfig.validSizes,
        category: 'Interactive',
        keywords: ['food', 'sweet', 'cake', '간식']
    },
    'cat-chaser': {
        component: Interactive.CatChaser,
        label: '따라오는 고양이',
        description: '마우스 커서를 따라다니는 귀여운 고양이입니다.',
        defaultSize: Interactive.CatChaserConfig.defaultSize,
        validSizes: Interactive.CatChaserConfig.validSizes,
        category: 'Interactive',
        keywords: ['pet', 'animal', 'mouse', '고양이']
    },
    'snow-globe': {
        component: Interactive.SnowGlobe,
        label: '스노우볼',
        description: '흔들면 눈이 내리는 겨울 감성의 스노우볼입니다.',
        defaultSize: Interactive.SnowGlobeConfig.defaultSize,
        validSizes: Interactive.SnowGlobeConfig.validSizes,
        category: 'Interactive',
        keywords: ['winter', 'shake', 'snow', '눈', '겨울']
    },
    'lp-player': {
        component: LPPlayer,
        label: '턴테이블',
        description: 'LP판을 올려 음악을 재생하는 턴테이블입니다.',
        defaultSize: LPPlayerConfig.defaultSize,
        validSizes: LPPlayerConfig.validSizes,
        category: 'Interactive',
        keywords: ['music', 'record', 'play', '음악', '노래']
    },
    'asmr-mixer': {
        component: ASMRMixer,
        label: 'ASMR 믹서',
        description: '빗소리, 장작 타는 소리 등 백색 소음을 조합합니다.',
        defaultSize: ASMRMixerConfig.defaultSize,
        validSizes: ASMRMixerConfig.validSizes,
        category: 'Interactive',
        keywords: ['sound', 'noise', 'relax', '소리']
    },
    'bonfire': {
        component: Bonfire,
        label: '모닥불',
        description: '타닥타닥 타오르는 모닥불을 보며 불멍을 즐기세요.',
        defaultSize: BonfireConfig.defaultSize,
        validSizes: BonfireConfig.validSizes,
        category: 'Interactive',
        keywords: ['fire', 'camp', 'relax', '불']
    },

    // New Standard Widgets
    'chat-diary': {
        component: Diary.ChatDiary,
        label: '나와의 채팅',
        description: '메신저 형식으로 나 자신과 대화를 나눕니다.',
        defaultSize: Diary.ChatDiaryConfig.defaultSize,
        validSizes: Diary.ChatDiaryConfig.validSizes,
        category: 'Diary & Emotion',
        keywords: ['talk', 'message', 'chat', '대화']
    },
    'tag-cloud': {
        component: Tools.TagCloud,
        label: '태그 구름',
        description: '자주 사용하는 태그들을 구름 모양으로 보여줍니다.',
        defaultSize: Tools.TagCloudConfig.defaultSize,
        validSizes: Tools.TagCloudConfig.validSizes,
        category: 'Utility',
        keywords: ['keyword', 'cloud', 'text', '단어']
    },
    'timeline': {
        component: Tools.Timeline,
        label: '세로 타임라인',
        description: '시간 순서대로 일정을 보여주는 타임라인입니다.',
        defaultSize: Tools.TimelineConfig.defaultSize,
        validSizes: Tools.TimelineConfig.validSizes,
        category: 'Utility',
        keywords: ['history', 'flow', 'schedule', '일정']
    },

    'scratch-card': {
        component: Interactive.ScratchCard,
        label: '복권 긁기',
        description: '은박을 긁어서 당첨 결과를 확인하는 재미를 느껴보세요.',
        defaultSize: Interactive.ScratchCardConfig.defaultSize,
        validSizes: Interactive.ScratchCardConfig.validSizes,
        category: 'Interactive',
        keywords: ['lottery', 'luck', 'scrtach', '복권']
    },
    'switches': {
        component: Interactive.Switches,
        label: '스위치 & 레버',
        description: '기계식 스위치와 레버를 조작하는 손맛을 느껴보세요.',
        defaultSize: Interactive.SwitchesConfig.defaultSize,
        validSizes: Interactive.SwitchesConfig.validSizes,
        category: 'Interactive',
        keywords: ['toggle', 'lever', 'machinic', '스위치']
    },

    // Global Effect Controllers
    'cursor-trail': { component: Controllers.CursorTrail, label: '커서 트레일', description: '마우스 커서 뒤에 화려한 효과가 따라다닙니다.', defaultSize: '1x1', category: 'Global', keywords: ['mouse', 'effect', 'pointer', '마우스'] },
    'highlighter': { component: Controllers.Highlighter, label: '형광펜 모드', description: '화면의 중요 부분을 형광펜으로 칠하듯 강조합니다.', defaultSize: '1x1', category: 'Global', keywords: ['paint', 'draw', 'mark', '펜'] },
    'physics-box': { component: Controllers.PhysicsBox, label: '물리 상자', description: '위젯들이 중력에 의해 서로 부딪히고 튀어 오릅니다.', defaultSize: '1x1', category: 'Global', keywords: ['gravity', 'bounce', 'game', '물리'] },
    'magnifier': { component: Controllers.Magnifier, label: '돋보기', description: '화면의 특정 부분을 크게 확대해서 볼 수 있습니다.', defaultSize: '1x1', category: 'Global', keywords: ['zoom', 'big', 'view', '확대'] },
    'ruby-text': { component: Controllers.RubyText, label: '루비 문자', description: '텍스트 위에 발음이나 설명을 작게 달아줍니다.', defaultSize: '1x1', category: 'Global', keywords: ['text', 'annotation', 'font', '문자'] },
    'custom-block': {
        label: 'Custom Widget',
        category: 'My Saved',
        defaultSize: '1x1',
        component: (props: any) => {
            // 🌟 1. 타입 찾기 (여러 군데를 뒤져봅니다)
            // props.type이 없으면 -> props.content.type을 확인 -> 그래도 없으면 unknown
            const realType = props.type || (props.content && props.content.type) || 'unknown';

            const blockData = {
                id: props.widgetId,
                type: realType,
                content: props.content || {},
                styles: props.styles || {}
            };

            // 🌟 2. 디버깅용 로그 (나오는지 확인)
            if (realType === 'unknown') {
                console.error("❌ 위젯 타입을 찾을 수 없습니다:", props);
                return <div className="bg-red-100 text-red-500 p-2 text-xs">Type Missing</div>;
            }

            return (
                <BlockRenderer
                    block={blockData}
                    // ... 나머지 props (dummy functions)
                    selectedBlockId={null}
                    onSelectBlock={() => {}}
                    onRemoveBlock={() => {}}
                    activeContainer={{ blockId: 'root', colIndex: 0 }}
                    onSetActiveContainer={() => {}}
                    onUpdateBlock={() => {}}
                />
            );
        }
    },
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
