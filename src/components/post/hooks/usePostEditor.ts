import React, { useState, useRef, useEffect } from 'react';
import { supabase, uploadImageToSupabase, generateBlogContent, savePostToApi, fetchPostsFromApi, deletePostApi, fetchAlbumsFromApi, fetchRoomsFromApi, createAlbumApi, createRoomApi, updateAlbumApi, deleteAlbumApi, createPostTemplateApi, fetchMyPostTemplatesApi } from '../api';
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
    const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

    // ✨ Dirty Flag for Unsaved Changes
    const [isDirty, setIsDirty] = useState(false);

    // ✨ Wrapped Setters to track Dirty State
    const [title, _setTitle] = useState("");
    const setTitle = (value: React.SetStateAction<string>) => { _setTitle(value); setIsDirty(true); };

    const [titleStyles, _setTitleStyles] = useState({
        fontSize: '30px',
        fontWeight: 'bold',
        fontFamily: "'Noto Sans KR', sans-serif",
        color: '#000000',
        textAlign: 'left'
    });
    const setTitleStyles = (value: React.SetStateAction<typeof titleStyles>) => { _setTitleStyles(value); setIsDirty(true); };

    const [blocks, _setBlocks] = useState<Block[]>([]);
    const setBlocks = (value: React.SetStateAction<Block[]>) => { _setBlocks(value); setIsDirty(true); };

    const [stickers, _setStickers] = useState<Sticker[]>([]);
    const setStickers = (value: React.SetStateAction<Sticker[]>) => { _setStickers(value); setIsDirty(true); };

    const [floatingTexts, _setFloatingTexts] = useState<FloatingText[]>([]);
    const setFloatingTexts = (value: React.SetStateAction<FloatingText[]>) => { _setFloatingTexts(value); setIsDirty(true); };

    const [floatingImages, _setFloatingImages] = useState<FloatingImage[]>([]);
    const setFloatingImages = (value: React.SetStateAction<FloatingImage[]>) => { _setFloatingImages(value); setIsDirty(true); };

    // ... Selection States (No need to be dirty)
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    // selectedId acts as the "primary" or "active" selection for the toolbar
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<'block' | 'sticker' | 'floating' | 'floatingImage' | 'title' | null>(null);
    const [rawInput, setRawInput] = useState("");
    const [tempImages, setTempImages] = useState<string[]>([]);
    const [selectedLayoutId, setSelectedLayoutId] = useState('type-a');
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // ... Albums & Templates
    const [customAlbums, setCustomAlbums] = useState<CustomAlbum[]>([]);
    const [myTemplates, setMyTemplates] = useState<any[]>([]);

    const [mode, setMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
    const [isFavorite, setIsFavorite] = useState(false);

    const [currentTags, _setCurrentTags] = useState<string[]>([]);
    const setTags = (value: React.SetStateAction<string[]>) => { _setCurrentTags(value); setIsDirty(true); };

    const [targetAlbumIds, setTargetAlbumIds] = useState<string[]>([]);
    const [isPublic, setIsPublic] = useState(true);
    const [sortOption, setSortOption] = useState<'name' | 'count' | 'newest' | 'favorites'>('name');

    // ✨ Paper Styles (Dirty tracked)
    const [paperStyles, _setPaperStyles] = useState<Record<string, any>>({
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    });
    const setPaperStyles = (value: React.SetStateAction<Record<string, any>>) => { _setPaperStyles(value); setIsDirty(true); };


    const fileInputRef = useRef<HTMLInputElement>(null);

    // ✨ Fetch Initial Data (Posts & Albums from API)
    useEffect(() => {
        if (supabase) {
            fetchPosts();
            fetchAlbums();
            fetchMyTemplates();
        }

        // ✨ Parse URL Query Params for Deep Linking (e.g., ?albumId=...)
        const params = new URLSearchParams(window.location.search);
        const albumIdParam = params.get('albumId');
        if (albumIdParam) {
            setSelectedAlbumId(albumIdParam);
            setViewMode('folder');
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
        setCurrentPostId(post.id);
        _setTitle(post.title); // ✨ Use internal setter (no dirty)
        _setTitleStyles((post.titleStyles as any) || {
            fontSize: '30px',
            fontWeight: 'bold',
            fontFamily: "'Noto Sans KR', sans-serif",
            color: '#000000',
            textAlign: 'left'
        });
        _setBlocks(post.blocks);
        _setStickers(post.stickers);
        _setFloatingTexts(post.floatingTexts || []);
        _setFloatingImages(post.floatingImages || []);
        _setCurrentTags(post.tags || []); // ✨ Use internal setter
        setTargetAlbumIds(post.albumIds || []);

        // ✨ Load Paper Styles
        if (post.styles) {
            _setPaperStyles(post.styles); // ✨ Use internal setter
        } else {
            // Default if none
            _setPaperStyles({
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            });
        }

        if (post.mode) {
            setMode(post.mode);
        } else {
            const hasTags = post.tags && post.tags.length > 0;
            setMode(hasTags ? 'AUTO' : 'MANUAL');
        }
        setIsFavorite(post.isFavorite || false);
        setIsPublic(post.isPublic ?? true);
        setViewMode('read');
        setIsDirty(false); // ✨ Reset Dirty Flag
    };

    // 저장하기: PX 단위 그대로 저장 + 메타데이터 블록 추가
    // ✨ Support Temp Save
    const handleSave = async (isTemp: boolean = false): Promise<{ success: boolean; message?: string; type?: 'info' | 'success' | 'danger' }> => {
        if (!title.trim() && !isTemp) return { success: false, message: "제목을 입력해주세요!", type: "danger" };

        const safeTags = Array.isArray(currentTags) ? [...currentTags.filter(t => typeof t === 'string')] : [];

        // ✨ Handle Draft Tag
        const DRAFT_TAG = '임시저장';
        if (isTemp) {
            if (!safeTags.includes(DRAFT_TAG)) safeTags.push(DRAFT_TAG);
        } else {
            // Remove draft tag if exists
            const idx = safeTags.indexOf(DRAFT_TAG);
            if (idx > -1) safeTags.splice(idx, 1);
        }

        const safeAlbumIds = Array.isArray(targetAlbumIds) ? targetAlbumIds.filter(id => typeof id === 'string') : [];
        const finalAlbumIds = new Set(safeAlbumIds);

        if (mode === 'AUTO' && safeTags.length > 0) {
            const uniqueTags = Array.from(new Set(safeTags));
            for (const tag of uniqueTags) {
                if (tag === DRAFT_TAG) continue; // Skip creating folder for draft tag
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
            isPublic: isTemp ? false : isPublic,
            styles: paperStyles
        };

        setIsSaving(true);
        try {
            const savedPost = await savePostToApi(postData, !!currentPostId);
            if (!currentPostId && savedPost?.id) {
                setCurrentPostId(savedPost.id);
            }

            triggerPostCreation();

            if (isTemp) {
                // ✨ Do NOT navigate away, just reset dirty
                setIsDirty(false);
                setIsPublic(false);
                // Also refresh tags in UI
                _setCurrentTags(safeTags);
                return { success: true, message: "임시 저장되었습니다.\n\"#임시저장\"에서 확인 가능합니다.", type: "success" };
            } else {
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
                setIsDirty(false); // ✨ Reset Dirty Flag
                return { success: true, message: "저장 완료!", type: "success" };
            }
        } catch (e) {
            console.error(e);
            return { success: false, message: "저장 실패: 서버 오류가 발생했습니다.", type: "danger" };
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAlbum = async (id: string) => {
        showConfirmModal(
            "앨범 삭제",
            "정말 삭제하시겠습니까?",
            "danger",
            async () => {
                await deleteAlbumApi(id);
                fetchAlbums();
                closeConfirmModal();
            }
        );
    };

    const handleDeletePost = async (id: number) => {
        showConfirmModal(
            "포스트 삭제",
            "정말 삭제하시겠습니까?",
            "danger",
            async () => {
                await deletePostApi(id);
                await fetchPosts();

                // ✨ Exit if current post is deleted
                if (currentPostId === id) {
                    setCurrentPostId(null);
                    if (selectedAlbumId) {
                        setViewMode('folder');
                    } else {
                        setViewMode('album');
                    }
                }
                closeConfirmModal();
            }
        );
    };

    const handleToggleFavorite = async (post: PostData) => {
        await savePostToApi({ ...post, isFavorite: !post.isFavorite }, true);
        fetchPosts();
    };

    const handleToggleAlbumFavorite = async (album: CustomAlbum) => {
        await updateAlbumApi(album.id, { ...album, isFavorite: !album.isFavorite });
        fetchAlbums();
    };



    // ✨ Save as Template
    const handleSaveAsTemplate = async (thumbnailUrl?: string | any) => {
        // Guard: If thumbnailUrl is an Event object (or not a string), treat as undefined
        const safeThumbnailUrl = typeof thumbnailUrl === 'string' ? thumbnailUrl : undefined;

        const name = prompt("이 디자인을 '나만의 템플릿'으로 저장하시겠습니까?\n이름을 입력해주세요:");
        if (!name) return;

        // 1. Construct Template JSON
        const template = {
            name,
            styles: paperStyles,
            stickers: stickers,
            floatingTexts: floatingTexts,
            floatingImages: floatingImages,
            defaultFontColor: '#000000', // Basic implementation
            thumbnailUrl: safeThumbnailUrl // ✨ Save generated thumbnail
        };

        // 2. Call API
        const result = await createPostTemplateApi(template);
        if (result) {
            showConfirmModal("저장 완료", "템플릿이 저장되었습니다! ✨\n(마켓에서 판매할 수도 있어요!)", "success", undefined, true);
            fetchMyTemplates(); // Refresh List
        } else {
            showConfirmModal("저장 실패", "템플릿 저장에 실패했습니다.", "danger", undefined, true);
        }
    };

    // ✨ Interaction Handlers
    const handleAiGenerate = async () => {
        setIsAiProcessing(true);
        try {
            const newBlocks = await generateBlogContent(rawInput, selectedLayoutId, tempImages);
            if (newBlocks.length > 0) setBlocks(newBlocks); // Uses wrapper -> Dirty
        } catch (e) {
            showConfirmModal("오류", "AI 생성 실패", "danger", undefined, true);
        } finally {
            setIsAiProcessing(false);
        }
    };

    // ✨ Widget Sticker 추가
    const addWidgetSticker = (widgetType: string, widgetProps: any = {}) => {
        const id = `sticker-${Date.now()}`;
        const newSticker: Sticker = {
            id,
            x: 50, // Center or default pos
            y: 50,
            w: 200, // Default size, can be adjusted based on widget config if needed
            h: 200,
            rotation: 0,
            zIndex: stickers.length + floatingTexts.length + floatingImages.length + 1, // Top
            opacity: 1,
            widgetType, // 🌟 Widget Type
            widgetProps, // 🌟 Widget Props
            url: '', // Widget doesn't use URL
        };
        // We need to add it to the list.
        setStickers((prev) => [...prev, newSticker]);

        // Mark as dirty
        if (!isDirty) setIsDirty(true);
    };

    // ✨ Interaction Wrappers
    const handleUpdate = (id: string, updates: any) => {
        if (id === 'title') {
            // If updates contain 'styles', merge them. If flat, merge directly (based on toolbar logic).
            // Toolbar now sends { styles: ... }.
            if (updates.styles) {
                setTitleStyles(prev => ({ ...prev, ...updates.styles }));
            } else {
                setTitleStyles(prev => ({ ...prev, ...updates }));
            }
            return; // ✨ Early exit for title
        }
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
        setStickers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        setFloatingTexts(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        setFloatingImages(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    };

    const handleSelect = (id: string | null, type: 'block' | 'sticker' | 'floating' | 'floatingImage' | 'title' | null, isMulti: boolean = false) => {
        if (!id) {
            setSelectedIds([]);
            setSelectedId(null);
            setSelectedType(null);
            return;
        }

        if (isMulti) {
            setSelectedIds(prev => {
                const newIds = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
                // Update primary selectedId logic
                if (newIds.length > 0) {
                    if (prev.includes(id)) { // removed
                        setSelectedId(newIds[newIds.length - 1]);
                    } else {
                        setSelectedId(id);
                        setSelectedType(type);
                    }
                } else {
                    setSelectedId(null);
                    setSelectedType(null);
                }
                return newIds;
            });
        } else {
            setSelectedIds([id]);
            setSelectedId(id);
            setSelectedType(type);
        }
    };

    const handleDelete = (id: string) => {
        let idsToDelete: string[] = [];

        if (id && selectedIds.includes(id)) {
            idsToDelete = selectedIds;
        } else if (id) {
            idsToDelete = [id];
        } else if (selectedIds.length > 0) {
            idsToDelete = selectedIds;
        }

        if (idsToDelete.length === 0) return;

        setBlocks(prev => prev.filter(b => !idsToDelete.includes(b.id)));
        setStickers(prev => prev.filter(s => !idsToDelete.includes(s.id)));
        setFloatingTexts(prev => prev.filter(t => !idsToDelete.includes(t.id)));
        setFloatingImages(prev => prev.filter(i => !idsToDelete.includes(i.id)));

        if (idsToDelete.includes(selectedId || '')) {
            setSelectedId(null);
            setSelectedType(null);
            setSelectedIds(prev => prev.filter(pid => !idsToDelete.includes(pid)));
        } else {
            setSelectedIds(prev => prev.filter(pid => !idsToDelete.includes(pid)));
        }
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

    const handleCreateAlbum = async (name: string, tags: string[], parentId?: string, type: 'album' | 'room' = 'album', roomConfig?: any, coverConfig?: any) => {
        let res;
        if (type === 'room') {
            res = await createRoomApi({
                name,
                description: roomConfig?.description,
                password: roomConfig?.password,
                coverConfig,
                tag: tags[0], // ✨ Pass Primary Tag
                hashtags: tags // ✨ Pass All Tags
            });
        } else {
            res = await createAlbumApi({
                name,
                tags,
                tag: tags[0], // ✨ Pass Primary Tag for Backend
                hashtags: tags, // ✨ Consistency
                type,
                parentId,
                coverConfig
            });
        }

        if (res) { fetchAlbums(); return res.id; }
        return null;
    };

    const handleUpdateAlbum = async (id: string, data: any) => {
        await updateAlbumApi(id, data);
        fetchAlbums();
    };

    // ✨ Modal State for Confirmations
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: React.ReactNode;
        type?: 'info' | 'danger' | 'success';
        singleButton?: boolean;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const showConfirmModal = (title: string, message: React.ReactNode, type: 'info' | 'danger' | 'success' = 'info', onConfirm?: () => void, singleButton: boolean = false) => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            type,
            singleButton,
            onConfirm: onConfirm || closeConfirmModal
        });
    };

    // ✨ Apply Paper Preset logic
    const applyPaperPreset = (preset: any) => {
        setPaperStyles(preset.styles); // Wrapper triggers dirty
        if (preset.defaultFontColor) {
            setTitleStyles(prev => ({ ...prev, color: preset.defaultFontColor }));
        }

        // ✨ Cleanup: Remove any existing template items (tmpl-*) when switching to a simple paper preset
        setStickers(prev => prev.filter(s => !s.id.startsWith('tmpl-')));
        setFloatingTexts(prev => prev.filter(t => !t.id.startsWith('tmpl-')));
        setFloatingImages(prev => prev.filter(i => !i.id.startsWith('tmpl-')));

        // Add preset stickers (if any)
        const presetStickers = (preset.stickers || []).map((s: Sticker) => ({
            ...s,
            id: `preset-${Date.now()}-${Math.random()}`
        }));
        setStickers(prev => [...prev.filter(s => !s.id.startsWith('tmpl-')), ...presetStickers]);
    };

    const applyTemplate = (template: any) => {
        setPaperStyles(template.styles || {
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '3rem',
        });

        setTitleStyles(prev => ({
            ...prev,
            color: template.defaultFontColor || '#000000'
        }));

        // ✨ Cleanup: Remove old template items before adding new ones
        setStickers(prev => {
            const userStickers = prev.filter(s => !s.id.startsWith('tmpl-'));
            const newStickers = (template.stickers || []).map((s: any) => ({
                ...s,
                id: `tmpl-sticker-${Date.now()}-${Math.random()}`
            }));
            return [...userStickers, ...newStickers];
        });

        setFloatingTexts(prev => {
            const userTexts = prev.filter(t => !t.id.startsWith('tmpl-'));
            const newTexts = (template.floatingTexts || []).map((t: any) => ({
                ...t,
                id: `tmpl-text-${Date.now()}-${Math.random()}`
            }));
            return [...userTexts, ...newTexts];
        });

        setFloatingImages(prev => {
            const userImages = prev.filter(i => !i.id.startsWith('tmpl-'));
            const newImages = (template.floatingImages || []).map((i: any) => ({
                ...i,
                id: `tmpl-fimg-${Date.now()}-${Math.random()}`
            }));
            return [...userImages, ...newImages];
        });
    };


    const handleStartWriting = (initialAlbumId?: string) => {
        const validAlbumId = (typeof initialAlbumId === 'string' || typeof initialAlbumId === 'number') ? String(initialAlbumId) : undefined;

        setCurrentPostId(null);
        _setTitle(''); // ✨ No dirty
        setRawInput('');
        _setTitleStyles({
            fontSize: '30px',
            fontWeight: 'bold',
            fontFamily: "'Noto Sans KR', sans-serif",
            color: '#000000',
            textAlign: 'left'
        });
        _setBlocks([{ id: `b-${Date.now()}`, type: 'paragraph', text: '' }]);
        _setStickers([]);
        _setFloatingTexts([]);
        _setFloatingImages([]);
        setTempImages([]);
        setSelectedId(null);
        setSelectedType(null);
        setSelectedIds([]); // ✨ Reset selectedIds
        _setCurrentTags([]);

        _setPaperStyles({
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
        setIsDirty(false); // ✨ Reset Dirty
    };

    return {
        viewMode, setViewMode, posts, title, setTitle, titleStyles, setTitleStyles,
        blocks, setBlocks, stickers, floatingTexts, floatingImages,
        selectedId, setSelectedId, selectedType, setSelectedType,
        rawInput, setRawInput, tempImages, setTempImages,
        selectedLayoutId, setSelectedLayoutId, isAiProcessing, isSaving,
        fileInputRef,
        handleStartWriting, handlePostClick, handleSave, handleAiGenerate,
        handleUpdate, handleDelete, addSticker, addWidgetSticker, addFloatingText, addFloatingImage,
        handleBlockImageUpload, changeZIndex,
        currentPostId,
        selectedAlbumId, handleAlbumClick,
        customAlbums, handleCreateAlbum,
        handleUpdateAlbum, handleDeleteAlbum,
        currentTags, setTags,
        targetAlbumIds, setTargetAlbumIds,
        sortOption, setSortOption, handleDeletePost,
        handleToggleFavorite,
        handleToggleAlbumFavorite,
        mode, setMode,
        isFavorite, setIsFavorite,
        isPublic, setIsPublic,
        refreshPosts: fetchPosts,
        setStickers, setFloatingTexts, setFloatingImages,
        paperStyles, setPaperStyles, applyPaperPreset,
        handleSaveAsTemplate,
        myTemplates, applyTemplate, fetchMyTemplates,
        isDirty, setIsDirty,
        confirmModal, showConfirmModal, closeConfirmModal, // ✨ Export Modal State & Helpers
        selectedIds, handleSelect, // ✨ Export Multi-Select
    };
};
