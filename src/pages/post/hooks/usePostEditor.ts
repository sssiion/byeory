import { useState, useRef, useEffect } from 'react';
import { supabase, uploadImageToSupabase, generateBlogContent, savePostToApi, fetchPostsFromApi, deletePostApi, fetchAlbumsFromApi, fetchRoomsFromApi, createAlbumApi, updateAlbumApi, deleteAlbumApi, createPostTemplateApi, fetchMyPostTemplatesApi } from '../api';
import type { Block, PostData, Sticker, FloatingText, FloatingImage, ViewMode, CustomAlbum } from '../types';
import { useCredits } from '../../../context/CreditContext'; // Import Credit Context

// 캔버스 크기 고정 (EditorCanvas.tsx와 동일하게 설정)

export const usePostEditor = () => {
    // ✨ Credit Context Trigger
    const { triggerPostCreation } = useCredits();

    // ✨ 커스텀 앨범 타입 정의 (Moved to types.ts)

    const [viewMode, setViewMode] = useState<ViewMode>('album');
    const [posts, setPosts] = useState<PostData[]>([]);
    const [currentPostId, setCurrentPostId] = useState<number | null>(null);
    const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null); // ✨ 선택된 앨범 ID
    const [title, setTitle] = useState("");
    const [titleStyles, setTitleStyles] = useState({
        fontSize: '30px',
        fontWeight: 'bold',
        fontFamily: "'Noto Sans KR', sans-serif",
        color: '#000000',
        textAlign: 'left'
    });
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [stickers, setStickers] = useState<Sticker[]>([]);
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
    const [floatingImages, setFloatingImages] = useState<FloatingImage[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<'block' | 'sticker' | 'floating' | 'floatingImage' | 'title' | null>(null);
    const [rawInput, setRawInput] = useState("");
    const [tempImages, setTempImages] = useState<string[]>([]);
    const [selectedLayoutId, setSelectedLayoutId] = useState('type-a');
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    // ✨ 커스텀 앨범 목록 (API 사용)
    const [customAlbums, setCustomAlbums] = useState<CustomAlbum[]>([]);
    const [myTemplates, setMyTemplates] = useState<any[]>([]); // ✨ My Templates

    // ✨ New fields for Album/Note Management
    const [mode, setMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
    const [isFavorite, setIsFavorite] = useState(false);

    const [currentTags, setCurrentTags] = useState<string[]>([]); // ✨ 현재 작성 중인 포스트의 태그들
    const [targetAlbumIds, setTargetAlbumIds] = useState<string[]>([]); // ✨ 저장할 타겟 앨범 ID들
    const [isPublic, setIsPublic] = useState(true); // ✨ 커뮤니티 공개 여부
    // ✨ Sort Option Persistence
    const [sortOption, setSortOption] = useState<'name' | 'count' | 'newest' | 'favorites'>('name');

    // ✨ Paper Styles State
    const [paperStyles, setPaperStyles] = useState<Record<string, any>>({
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '3rem',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ✨ Fetch Initial Data (Posts & Albums from API)
    useEffect(() => {
        if (supabase) {
            fetchPosts();
            fetchAlbums();
            fetchMyTemplates();
        }
    }, []);

    // ✨ API Fetch Wrappers
    const fetchPosts = async () => {
        const data = await fetchPostsFromApi();
        setPosts(data);
    };

    const fetchAlbums = async () => {
        const albums = await fetchAlbumsFromApi();
        const rooms = await fetchRoomsFromApi();
        setCustomAlbums([...albums, ...rooms]);
    };

    const fetchMyTemplates = async () => {
        const templates = await fetchMyPostTemplatesApi();
        setMyTemplates(templates);
    };

    // Helper: Get Max Z-Index
    const getMaxZ = () => {
        const sZ = stickers.length > 0 ? Math.max(...stickers.map(s => s.zIndex)) : 0;
        const tZ = floatingTexts.length > 0 ? Math.max(...floatingTexts.map(t => t.zIndex)) : 0;
        const iZ = floatingImages.length > 0 ? Math.max(...floatingImages.map(i => i.zIndex)) : 0;
        return Math.max(sZ, tZ, iZ, 0);
    };

    const handlePostClick = (post: PostData) => {
        setCurrentPostId(post.id); setTitle(post.title);
        setTitleStyles((post.titleStyles as any) || {
            fontSize: '30px',
            fontWeight: 'bold',
            fontFamily: "'Noto Sans KR', sans-serif",
            color: '#000000',
            textAlign: 'left'
        });
        setBlocks(post.blocks); setStickers(post.stickers);
        setFloatingTexts(post.floatingTexts || []);
        setFloatingImages(post.floatingImages || []);
        setCurrentTags(post.tags || []); // ✨ 태그 로드
        setTargetAlbumIds(post.albumIds || []); // ✨ 앨범 ID 로드

        // ✨ Load Paper Styles
        if (post.styles) {
            setPaperStyles(post.styles);
        } else {
            // Default if none
            setPaperStyles({
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                padding: '3rem',
            });
        }

        if (post.mode) {
            setMode(post.mode);
        } else {
            const hasTags = post.tags && post.tags.length > 0;
            setMode(hasTags ? 'AUTO' : 'MANUAL');
        }
        setIsFavorite(post.isFavorite || false); // ✨ Load favorite
        setIsPublic(post.isPublic ?? true); // ✨ Load public status
        setViewMode('read');
    };

    // 저장하기: PX 단위 그대로 저장 + 메타데이터 블록 추가
    const handleSave = async () => {
        if (!title.trim()) return alert("제목을 입력해주세요!");

        // ...
        const safeTags = Array.isArray(currentTags) ? currentTags.filter(t => typeof t === 'string') : [];
        const safeAlbumIds = Array.isArray(targetAlbumIds) ? targetAlbumIds.filter(id => typeof id === 'string') : [];
        const finalAlbumIds = new Set(safeAlbumIds);

        if (mode === 'AUTO' && safeTags.length > 0) {
            const uniqueTags = Array.from(new Set(safeTags));
            for (const tag of uniqueTags) {
                const existing = customAlbums.find(a =>
                    (a.tag === tag || a.name === tag) &&
                    (a.type === 'album' || a.type === 'room')
                );
                if (existing) {
                    finalAlbumIds.add(existing.id);
                } else {
                    const newId = await handleCreateAlbum(tag, [tag]);
                    if (newId) finalAlbumIds.add(newId);
                }
            }
        }
        const mergedAlbumIds = Array.from(finalAlbumIds);

        const postData = {
            id: currentPostId,
            title,
            blocks: blocks.filter(b => !b.text || !b.text.includes('<!--METADATA:')),
            stickers,
            floatingTexts,
            floatingImages,
            titleStyles,
            tags: safeTags,
            albumIds: mergedAlbumIds,
            mode,
            isFavorite,
            isPublic,
            styles: paperStyles // ✨ Save Paper Styles
        };

        // ... (rest of logging and save logic) ...
        setIsSaving(true);
        try {
            await savePostToApi(postData, !!currentPostId);
            triggerPostCreation();
            alert("저장 완료!");
            await Promise.all([
                fetchPosts(),
                fetchAlbums()
            ]);
            if (targetAlbumIds.length === 1) {
                setSelectedAlbumId(targetAlbumIds[0]);
                setViewMode('folder');
            } else {
                setViewMode('album');
            }
        } catch (e) {
            alert("저장 실패: 서버 오류가 발생했습니다.");
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    // ✨ Save as Template
    const handleSaveAsTemplate = async () => {
        const name = prompt("템플릿 이름을 입력해주세요:");
        if (!name) return;

        // Extract style/decoration data
        const templateData = {
            name,
            styles: paperStyles,
            stickers,
            floatingTexts,
            floatingImages,
            defaultFontColor: titleStyles.color || '#000000' // Simple heuristic
        };

        try {
            await createPostTemplateApi(templateData);
            alert("템플릿이 저장되었습니다!");
        } catch (e) {
            console.error(e);
            alert("템플릿 저장 실패");
        }
    };

    // ✨ Interaction Handlers
    const handleAiGenerate = async () => {
        setIsAiProcessing(true);
        try {
            const newBlocks = await generateBlogContent(rawInput, selectedLayoutId, tempImages);
            if (newBlocks.length > 0) setBlocks(newBlocks);
        } catch (e) {
            alert("AI 생성 실패");
        } finally {
            setIsAiProcessing(false);
        }
    };

    const handleUpdate = (id: string, updates: any) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
        setStickers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        setFloatingTexts(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        setFloatingImages(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    };

    const handleDelete = (id: string) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
        setStickers(prev => prev.filter(s => s.id !== id));
        setFloatingTexts(prev => prev.filter(t => t.id !== id));
        setFloatingImages(prev => prev.filter(i => i.id !== id));
        if (selectedId === id) { setSelectedId(null); setSelectedType(null); }
    };

    const addSticker = (url: string) => {
        const newSticker: Sticker = {
            id: `sticker-${Date.now()}`,
            x: '50%', y: '50%', w: 100, h: 100,
            rotation: 0, zIndex: getMaxZ() + 1, opacity: 1, url
        };
        setStickers(prev => [...prev, newSticker]);
    };

    const addFloatingText = () => {
        setFloatingTexts(prev => [...prev, {
            id: `text-${Date.now()}`,
            x: '50%', y: '50%', w: 200, h: 50,
            rotation: 0, zIndex: getMaxZ() + 1,
            text: "New Text",
            styles: { fontSize: '16px', fontWeight: 'normal', textAlign: 'center', color: '#000000', backgroundColor: 'transparent', fontFamily: 'Arial' }
        }]);
    };

    const addFloatingImage = async (file: File) => {
        setIsAiProcessing(true);
        const url = await uploadImageToSupabase(file);
        if (url) {
            setFloatingImages(prev => [...prev, {
                id: `fimg-${Date.now()}`,
                x: '50%', y: '50%', w: 200, h: 200,
                rotation: 0, zIndex: getMaxZ() + 1,
                url
            }]);
        }
        setIsAiProcessing(false);
    };

    const handleBlockImageUpload = async (file: File, blockId: string) => {
        const url = await uploadImageToSupabase(file);
        if (url) {
            setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, imageUrl: url } : b));
        }
    };

    const changeZIndex = (id: string, direction: 'up' | 'down') => {
        // Simple implementation: bring to front or back by large increment
        // Or swap. For now, let's just increment/decrement
        const currentZ = getMaxZ();
        handleUpdate(id, { zIndex: direction === 'up' ? currentZ + 1 : Math.max(0, currentZ - 1) });
    };

    const handleAlbumClick = (albumId: string | null) => {
        setSelectedAlbumId(albumId);
        if (albumId === null) {
            setViewMode('album');
        } else {
            setViewMode('folder');
        }
    };

    const handleCreateAlbum = async (name: string, tags: string[]) => {
        const res = await createAlbumApi({ name, tags, type: 'album' });
        if (res) { fetchAlbums(); return res.id; }
        return null;
    };

    const handleUpdateAlbum = async (id: string, data: any) => {
        await updateAlbumApi(id, data);
        fetchAlbums();
    };

    const handleDeleteAlbum = async (id: string) => {
        if (confirm("삭제하시겠습니까?")) {
            await deleteAlbumApi(id);
            fetchAlbums();
        }
    };

    const handleDeletePost = async (id: number) => {
        if (confirm("삭제하시겠습니까?")) {
            await deletePostApi(id);
            fetchPosts();
        }
    };

    const handleToggleFavorite = async (post: PostData) => {
        await savePostToApi({ ...post, isFavorite: !post.isFavorite }, true);
        fetchPosts();
    };

    const handleToggleAlbumFavorite = async (album: CustomAlbum) => {
        await updateAlbumApi(album.id, { ...album, isFavorite: !album.isFavorite });
        fetchAlbums();
    };



    // ✨ Apply Paper Preset logic
    const applyPaperPreset = (preset: any) => {
        setPaperStyles(preset.styles);
        if (preset.defaultFontColor) {
            setTitleStyles(prev => ({ ...prev, color: preset.defaultFontColor }));
        }

        // Filter out existing preset stickers, keep user stickers
        const userStickers = stickers.filter(s => s.id.startsWith('sticker-'));
        // Add new preset stickers
        const presetStickers = (preset.stickers || []).map((s: Sticker) => ({
            ...s,
            // Copy logic, maybe ensure ID is unique if added multiple times? 
            // Presets usually have fixed IDs.
        }));
        setStickers([...userStickers, ...presetStickers]);
    };

    const applyTemplate = (template: any) => {
        // Apply Paper Styles
        if (template.styles) {
            setPaperStyles(template.styles);
        }

        // Apply Font Color
        if (template.defaultFontColor) {
            setTitleStyles(prev => ({ ...prev, color: template.defaultFontColor }));
        }

        // Apply Stickers
        // Clean existing stickers? Maybe we want to replace decorative stickers but keep content ones?
        // For "Template" application, typically we replace the design aspects.
        // Let's replace completely for now or maybe prompt?
        // Let's append to existing for a better UX, or replace?
        // Decision: Replace only if empty, otherwise merge?
        // Simple approach: Merge
        const newStickers = (template.stickers || []).map((s: any) => ({
            ...s,
            id: `sticker-${Date.now()}-${Math.random()}` // regenerate IDs
        }));
        setStickers(prev => [...prev, ...newStickers]);

        // Apply Floating Texts (often used for decoration in templates)
        const newTexts = (template.floatingTexts || []).map((t: any) => ({
            ...t,
            id: `text-${Date.now()}-${Math.random()}`
        }));
        setFloatingTexts(prev => [...prev, ...newTexts]);

        // Apply Floating Images
        const newImages = (template.floatingImages || []).map((i: any) => ({
            ...i,
            id: `fimg-${Date.now()}-${Math.random()}`
        }));
        setFloatingImages(prev => [...prev, ...newImages]);
    };

    const handleStartWriting = (initialAlbumId?: string) => {
        const validAlbumId = (typeof initialAlbumId === 'string' || typeof initialAlbumId === 'number') ? String(initialAlbumId) : undefined;

        setCurrentPostId(null); // 새 글
        setTitle('');
        setRawInput('');
        setTitleStyles({
            fontSize: '30px',
            fontWeight: 'bold',
            fontFamily: "'Noto Sans KR', sans-serif",
            color: '#000000',
            textAlign: 'left'
        });
        setBlocks([{ id: `b-${Date.now()}`, type: 'paragraph', text: '' }]); // 초기 블록
        setStickers([]);
        setFloatingTexts([]);
        setFloatingImages([]);
        setTempImages([]); // 임시 이미지 초기화
        setSelectedId(null);
        setSelectedType(null);
        setCurrentTags([]); // ✨ 태그 초기화

        // ✨ Reset Paper Styles
        setPaperStyles({
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '3rem',
        });

        if (validAlbumId) {
            setTargetAlbumIds([validAlbumId]);
            setMode('MANUAL');
        } else {
            setTargetAlbumIds([]);
            setMode('AUTO');
        }
        setIsFavorite(false);
        setIsPublic(true);
        setViewMode('editor');
    };

    return {
        viewMode, setViewMode, posts, title, setTitle, titleStyles, setTitleStyles,
        blocks, setBlocks, stickers, floatingTexts, floatingImages,
        selectedId, setSelectedId, selectedType, setSelectedType,
        rawInput, setRawInput, tempImages, setTempImages,
        selectedLayoutId, setSelectedLayoutId, isAiProcessing, isSaving,
        fileInputRef,
        handleStartWriting, handlePostClick, handleSave, handleAiGenerate,
        handleUpdate, handleDelete, addSticker, addFloatingText, addFloatingImage,
        handleBlockImageUpload, changeZIndex,
        currentPostId,
        selectedAlbumId, handleAlbumClick,
        customAlbums, handleCreateAlbum,
        handleUpdateAlbum, handleDeleteAlbum,
        currentTags, setTags: setCurrentTags,
        targetAlbumIds, setTargetAlbumIds,
        sortOption, setSortOption, handleDeletePost,
        handleToggleFavorite,
        handleToggleAlbumFavorite,
        mode, setMode,
        isFavorite, setIsFavorite,
        isPublic, setIsPublic,
        refreshPosts: fetchPosts,
        setStickers, setFloatingTexts, setFloatingImages,
        paperStyles, setPaperStyles, applyPaperPreset, // ✨ Expose applyPaperPreset
        handleSaveAsTemplate, // ✨ Expose Template Save
        myTemplates, applyTemplate, fetchMyTemplates // ✨ Expose Template Load
    };
};
