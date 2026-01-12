import React, { lazy } from 'react';

// --------------------------------------------------------------------------
// Component Map
// --------------------------------------------------------------------------
// Vite의 정적 분석을 위해 모든 import 경로를 풀어서 작성해야 합니다.
export const WIDGET_COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
    // ======================================================================
    // System (Deprecated / Moved)
    // ======================================================================
<<<<<<< Updated upstream
    // 'welcome' moved to Utility
    // 'theme-guide', 'feature-card' deleted
=======
    'welcome': lazy(() => import('./WidgetCollection/system/Welcome.tsx').then(m => ({ default: m.WelcomeWidget }))),
    'theme-guide': lazy(() => import('./WidgetCollection/system/ThemeGuide.tsx').then(m => ({ default: m.ThemeGuideWidget }))),
    'feature-card': lazy(() => import('./WidgetCollection/system/FeatureCard.tsx').then(m => ({ default: m.FeatureCard }))),
    'my-persona': lazy(() => import('./WidgetCollection/system/MyPersona.tsx').then(m => ({ default: m.MyPersona }))),
    // 🌟 커스텀 위젯 (Gallery 노출용)
    'custom-block': lazy(() => import('./customwidget/CustomWidgetWrapper.tsx').then(m => ({ default: m.CustomWidgetWrapper }))),
>>>>>>> Stashed changes

    // ======================================================================
    // Data & Logic
    // ======================================================================
    'formula-block': lazy(() => import('./WidgetCollection/logic/FormulaBlock.tsx').then(m => ({ default: m.FormulaBlock }))),

    // ======================================================================
    // Diary & Emotion
    // ======================================================================
    'chat-diary': lazy(() => import('./WidgetCollection/diary/ChatDiary.tsx').then(m => ({ default: m.ChatDiary }))),

    // ======================================================================
    // Utility
    // ======================================================================
    'welcome': lazy(() => import('./WidgetCollection/system/Welcome.tsx').then(m => ({ default: m.WelcomeWidget }))),
    'todo-list': lazy(() => import('./WidgetCollection/tools/TodoList.tsx').then(m => ({ default: m.TodoListWidget }))),
    'weather': lazy(() => import('./WidgetCollection/tools/Weather.tsx').then(m => ({ default: m.WeatherWidget }))),
    // 'notification': removed
    'clock': lazy(() => import('./WidgetCollection/tools/Clock.tsx').then(m => ({ default: m.ClockWidget }))),


    'streak': lazy(() => import('./WidgetCollection/tools/Streak.tsx').then(m => ({ default: m.StreakWidget }))),

    'battery': lazy(() => import('./WidgetCollection/tools/Battery.tsx').then(m => ({ default: m.BatteryWidget }))),
    'worry-shredder': lazy(() => import('./WidgetCollection/tools/WorryShredder.tsx').then(m => ({ default: m.WorryShredder }))),
    'scrap-note': lazy(() => import('./WidgetCollection/tools/ScrapNote.tsx').then(m => ({ default: m.ScrapNote }))),
    'recipe-card': lazy(() => import('./WidgetCollection/tools/RecipeCard.tsx').then(m => ({ default: m.RecipeCard }))),
    'worry-doll': lazy(() => import('./WidgetCollection/tools/WorryDoll.tsx').then(m => ({ default: m.WorryDoll }))),
    'unit-converter': lazy(() => import('./WidgetCollection/tools/UnitConverter.tsx').then(m => ({ default: m.UnitConverter }))),
    'calculator': lazy(() => import('./WidgetCollection/tools/Calculator.tsx').then(m => ({ default: m.Calculator }))),
    'random-picker': lazy(() => import('./WidgetCollection/tools/RandomPicker.tsx').then(m => ({ default: m.RandomPicker }))),
    'map-pin': lazy(() => import('./WidgetCollection/tools/MapPin.tsx').then(m => ({ default: m.MapPin }))),
    'rss-reader': lazy(() => import('./WidgetCollection/tools/RSSReader.tsx').then(m => ({ default: m.RSSReader }))),
    'tag-cloud': lazy(() => import('./WidgetCollection/tools/TagCloud.tsx').then(m => ({ default: m.TagCloud }))),
    'color-palette': lazy(() => import('./WidgetCollection/tools/ColorPalette.tsx').then(m => ({ default: m.ColorPalette }))),
    'typewriter': lazy(() => import('./WidgetCollection/tools/Typewriter.tsx').then(m => ({ default: m.Typewriter }))),
    'polaroid': lazy(() => import('./WidgetCollection/tools/Polaroid.tsx').then(m => ({ default: m.Polaroid }))),

    // ======================================================================
    // Decoration & Collection
    // ======================================================================
    'photo-gallery': lazy(() => import('./WidgetCollection/decoration/Gallery.tsx').then(m => ({ default: m.PhotoGallery }))),
    'instant-booth': lazy(() => import('./WidgetCollection/decoration/Gallery.tsx').then(m => ({ default: m.InstantBooth }))),
    'film-strip': lazy(() => import('./WidgetCollection/decoration/Gallery.tsx').then(m => ({ default: m.FilmStrip }))),
    'moon-phase': lazy(() => import('./WidgetCollection/decoration/MoonPhase.tsx').then(m => ({ default: m.MoonPhase }))),
    'switch-board': lazy(() => import('./WidgetCollection/decoration/SwitchBoard.tsx').then(m => ({ default: m.SwitchBoard }))),
    'fortune-cookie': lazy(() => import('./WidgetCollection/decoration/FortuneCookie.tsx').then(m => ({ default: m.FortuneCookie }))),
    'ootd': lazy(() => import('./WidgetCollection/decoration/OOTDSketch.tsx').then(m => ({ default: m.OOTDSketch }))),
    'book-cover': lazy(() => import('./WidgetCollection/decoration/BookCover.tsx').then(m => ({ default: m.BookCover }))),
    'bubble-wrap': lazy(() => import('./WidgetCollection/decoration/BubbleWrap.tsx').then(m => ({ default: m.BubbleWrap }))),
    'transparent': lazy(() => import('./WidgetCollection/decoration/TransparentSpacer.tsx').then(m => ({ default: m.TransparentSpacer }))),
    'favorite-char': lazy(() => import('./WidgetCollection/decoration/Character.tsx').then(m => ({ default: m.FavoriteCharacter }))),
    'color-chip': lazy(() => import('./WidgetCollection/decoration/ColorChip.tsx').then(m => ({ default: m.ColorChip }))),
    'movie-scene': lazy(() => import('./WidgetCollection/decoration/MovieScene.tsx').then(m => ({ default: m.MovieScene }))),
    'ticket': lazy(() => import('./WidgetCollection/decoration/TicketStub.tsx').then(m => ({ default: m.TicketStub }))),
    'neon': lazy(() => import('./WidgetCollection/decoration/NeonSign.tsx').then(m => ({ default: m.NeonSign }))),
    'candle': lazy(() => import('./WidgetCollection/decoration/Candle.tsx').then(m => ({ default: m.Candle }))),
    'text-scroller': lazy(() => import('./WidgetCollection/decoration/TextScroller.tsx').then(m => ({ default: m.TextScroller }))),
    'ocean-wave': lazy(() => import('./WidgetCollection/decoration/OceanWave.tsx').then(m => ({ default: m.OceanWave }))),
    'movie-ticket': lazy(() => import('./WidgetCollection/decoration/MovieTicket.tsx').then(m => ({ default: m.MovieTicket }))),
    'bookshelf': lazy(() => import('./WidgetCollection/decoration/Bookshelf.tsx').then(m => ({ default: m.Bookshelf }))),
    'stamp-collection': lazy(() => import('./WidgetCollection/decoration/StampCollection.tsx').then(m => ({ default: m.StampCollection }))),
    'sky-map': lazy(() => import('./WidgetCollection/decoration/SkyMap.tsx').then(m => ({ default: m.SkyMap }))),
    'birth-flower': lazy(() => import('./WidgetCollection/decoration/BirthFlower.tsx').then(m => ({ default: m.BirthFlower }))),
    'receipt-printer': lazy(() => import('./WidgetCollection/decoration/ReceiptPrinter.tsx').then(m => ({ default: m.ReceiptPrinter }))),
    'weather-stickers': lazy(() => import('./WidgetCollection/decoration/WeatherStickers.tsx').then(m => ({ default: m.WeatherStickers }))),

    // ======================================================================
    // Interactive
    // ======================================================================
    'dessert-case': lazy(() => import('./WidgetCollection/interactive/DessertCase.tsx').then(m => ({ default: m.DessertCase }))),
    'cat-chaser': lazy(() => import('./WidgetCollection/interactive/CatChaser.tsx').then(m => ({ default: m.CatChaser }))),
    'snow-globe': lazy(() => import('./WidgetCollection/interactive/SnowGlobe.tsx').then(m => ({ default: m.SnowGlobe }))),
    'lp-player': lazy(() => import('./WidgetCollection/interactive/LPPlayer.tsx').then(m => ({ default: m.LPPlayer }))),
    'bonfire': lazy(() => import('./WidgetCollection/interactive/Bonfire.tsx').then(m => ({ default: m.Bonfire }))),
    'community': lazy(() => import('./WidgetCollection/interactive/Community.tsx').then(m => ({ default: m.CommunityWidget }))),
    'time-machine': lazy(() => import('./WidgetCollection/interactive/TimeMachine.tsx').then(m => ({ default: m.TimeMachine }))),
    'scratch-card': lazy(() => import('./WidgetCollection/interactive/ScratchCard.tsx').then(m => ({ default: m.ScratchCard }))),
    'switches': lazy(() => import('./WidgetCollection/interactive/Switches.tsx').then(m => ({ default: m.Switches }))),

    // ======================================================================
    // Global Controllers
    // ======================================================================
    'cursor-trail': lazy(() => import('./WidgetCollection/controllers/CursorTrail.tsx').then(m => ({ default: m.CursorTrail }))),
    'highlighter': lazy(() => import('./WidgetCollection/controllers/Highlighter.tsx').then(m => ({ default: m.Highlighter }))),
    'physics-box': lazy(() => import('./WidgetCollection/controllers/PhysicsBox.tsx').then(m => ({ default: m.PhysicsBox }))),
    'magnifier': lazy(() => import('./WidgetCollection/controllers/Magnifier.tsx').then(m => ({ default: m.Magnifier }))),
    'ruby-text': lazy(() => import('./WidgetCollection/controllers/RubyText.tsx').then(m => ({ default: m.RubyText }))),
};