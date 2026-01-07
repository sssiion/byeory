import { useState, useRef, useEffect } from 'react';
import { supabase, uploadImageToSupabase, generateBlogContent, savePostToApi, fetchPostsFromApi, deletePostApi, fetchAlbumsFromApi, fetchRoomsFromApi, createAlbumApi, updateAlbumApi, deleteAlbumApi, createRoomApi, updateRoomApi, deleteRoomApi } from '../api';
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

    // ✨ New fields for Album/Note Management
    const [mode, setMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
    const [isFavorite, setIsFavorite] = useState(false);

    const [currentTags, setCurrentTags] = useState<string[]>([]); // ✨ 현재 작성 중인 포스트의 태그들
    const [targetAlbumIds, setTargetAlbumIds] = useState<string[]>([]); // ✨ 저장할 타겟 앨범 ID들
    const [isPublic, setIsPublic] = useState(true); // ✨ 커뮤니티 공개 여부
    // ✨ Sort Option Persistence
    const [sortOption, setSortOption] = useState<'name' | 'count' | 'newest' | 'favorites'>('name');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ✨ Fetch Initial Data (Posts & Albums from API)
    useEffect(() => {
        if (supabase) {
            fetchPosts();
            fetchAlbums();
        }
    }, []);



    // 2. Fetch Albums AND Rooms from API
    const fetchAlbums = async () => {
        const [albumsData, roomsData] = await Promise.all([
            fetchAlbumsFromApi(),
            fetchRoomsFromApi()
        ]);

        const combinedData = [
            ...(Array.isArray(albumsData) ? albumsData : []),
            ...(Array.isArray(roomsData) ? roomsData : [])
        ];

        if (combinedData.length > 0) {
            // Helper to flatten hierarchy if backend returns tree
            const flatten = (list: any[]): any[] => {
                return list.reduce((acc, item) => {
                    acc.push(item);
                    if (item.children && Array.isArray(item.children)) {
                        acc.push(...flatten(item.children));
                    }
                    return acc;
                }, []);
            };

            const flatData = flatten(combinedData);

            const adapted: CustomAlbum[] = flatData.map((a: any) => {
                // ✨ ID Collision Fix: Prefix Room IDs
                const isRoom = a.type === 'room' || (a.role !== undefined); // Heuristic or explicit type
                const rawId = String(a.id);
                // Ensure we don't double prefix if data already has it (unlikely from API but good safety)
                const safeId = isRoom && !rawId.startsWith('room-') ? `room-${rawId}` : rawId;

                return {
                    id: safeId,
                    name: a.name,
                    tag: a.tag,
                    createdAt: new Date(a.createdAt || Date.now()).getTime(),
                    parentId: a.parentId ? String(a.parentId) : null,
                    isFavorite: a.isFavorite || false,
                    type: isRoom ? 'room' : 'album',
                    roomConfig: a.roomConfig,
                    coverConfig: a.coverConfig,
                    postCount: a.postCount,
                    folderCount: a.folderCount
                };
            });

            // Strictly use backend data. No localStorage merge.
            setCustomAlbums(adapted);
        } else {
            setCustomAlbums([]);
        }
    };
    // 앨범 생성 핸들러 (API Integration)
    const handleCreateAlbum = async (name: string, tags: string[], parentId?: string | null, type: 'album' | 'room' = 'album', roomConfig?: any, coverConfig?: any) => {
        if (!name || name.trim() === "") return null;

        // ✨ Separate Logic for Room Creation
        if (type === 'room') {
            const newRoomData = {
                name,
                description: roomConfig?.description,
                password: roomConfig?.password,
                tag: tags[0] || null,
                coverConfig
            };

            const created = await createRoomApi(newRoomData);
            if (created) {
                await fetchAlbums(); // Refresh list (Assuming rooms are fetched together or separate fetch needed?)
                return `room-${created.id}`;
            }
            return null;
        }

        // Standard Album Creation
        const newAlbumData = {
            name,
            tag: tags[0] || null,
            parentId: parentId || null,
            type,
            roomConfig,
            coverConfig
        };

        const created = await createAlbumApi(newAlbumData);
        if (created) {
            await fetchAlbums(); // Refresh list
            return String(created.id);
        }
        return null;
    };

    // 앨범 수정 핸들러 (API Integration) - Generic
    const handleUpdateAlbum = async (id: string, updates: Partial<CustomAlbum>) => {
        const target = customAlbums.find(a => a.id === id);
        if (!target) return;

        // Optimistic UI
        setCustomAlbums(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));

        let success;
        if (target.type === 'room') {
            // ✨ Use Room API for Rooms
            // Strip 'room-' prefix
            const realId = id.replace('room-', '');
            success = await updateRoomApi(realId, { ...target, ...updates });
        } else {
            success = await updateAlbumApi(id, { ...target, ...updates });
        }

        if (!success) {
            // Revert
            setCustomAlbums(prev => prev.map(a => a.id === id ? target : a));
            await fetchAlbums();
        }
    };

    // ✨ Toggle Album Favorite (API Integration)
    const handleToggleAlbumFavorite = async (id: string) => {
        const target = customAlbums.find(a => a.id === id);
        if (!target) return;
        await handleUpdateAlbum(id, { isFavorite: !target.isFavorite });
    };

    // 앨범 삭제 핸들러 (API Integration)
    const handleDeleteAlbum = async (id: string) => {
        if (!confirm('정말 이 앨범을 삭제하시겠습니까? 기록물을 제외한 모든 폴더가 삭제됩니다.')) return;

        // Optimistic UI
        setCustomAlbums(prev => prev.filter(a => a.id !== id));

        const isRoom = id.startsWith('room-');
        const realId = id.replace('room-', '');

        const success = isRoom
            ? await deleteRoomApi(realId) // You need to import/use deleteRoomApi if it exists in API, checking imports... it was imported in line 2
            : await deleteAlbumApi(realId);
        if (success) {
            await fetchAlbums(); // Refresh to sync backend cascade state
            // if (activeDropdownId === id) setActiveDropdownId(null); // Cleanup UI state if needed, though this hook doesn't hold it.
        } else {
            alert("삭제 실패: 관리자 문의");
            await fetchAlbums(); // Revert
        }
    };

    // ... (Dropdown state logic is in Component, not Hook. Proceeding.)

    // ✨ Delete Post Handler (Single)
    const handleDeletePost = async (id: string | number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        // 1. Optimistic Update
        setPosts(prev => prev.filter(p => String(p.id) !== String(id)));

        // 2. API Call
        const success = await deletePostApi(id);
        if (!success) {
            alert("삭제에 실패했습니다. 새로고침 후 다시 시도해주세요.");
            // Revert would be nice here, but simplicity for now
        }
    };

    // ✨ Toggle Favorite Handler
    const handleToggleFavorite = async (id: number) => {
        // 1. Find and Toggle
        const target = posts.find(p => p.id === id);
        if (!target) return;

        const updatedPost = { ...target, isFavorite: !target.isFavorite };

        // 2. Optimistic Update
        setPosts(prev => prev.map(p => p.id === id ? updatedPost : p));

        // 3. API Call
        try {
            await savePostToApi(updatedPost, true);
        } catch (e) {
            console.error("Favorite toggle failed", e);
            // Revert on failure
            setPosts(prev => prev.map(p => p.id === id ? target : p));
        }
    };

    // 데이터 불러오기: PX 단위 그대로 사용 + 메타데이터 블록 파싱
    const fetchPosts = async () => {
        const data = await fetchPostsFromApi();
        if (data) {
            setPosts(data.map((p: any) => {
                const rawBlocks = p.blocks || [];
                const contentBlocks: Block[] = [];
                // 기본값 설정
                let parsedTitleStyles = p.titleStyles || null;
                let parsedTags = p.tags || [];
                let parsedAlbumIds = p.albumIds || [];

                // ✨ Metadata Fallback Variables
                let metadataAlbumIds: string[] | null = null;
                let metadataTags: string[] | null = null;

                // 메타데이터 블록 추출
                rawBlocks.forEach((b: Block) => {
                    // ✨ Robust Metadata Detection (Regex)
                    const cleanText = b.text ? b.text.trim() : "";


                    const metaRegex = /<!--METADATA:(.*?)-->/;
                    const match = cleanText.match(metaRegex);

                    if (b.type === 'paragraph' && match) {
                        try {
                            // match[1] contains the JSON string
                            const json = match[1];
                            const metadata = JSON.parse(json);
                            if (metadata.titleStyles) parsedTitleStyles = metadata.titleStyles;

                            // Capture for fallback usage later
                            if (metadata.tags && Array.isArray(metadata.tags)) metadataTags = metadata.tags;
                            if (metadata.albumIds && Array.isArray(metadata.albumIds)) metadataAlbumIds = metadata.albumIds;


                        } catch (e) {
                            console.error('Failed to parse metadata block', e);
                        }
                    } else {
                        contentBlocks.push(b);
                    }
                });


                // 3. ✨ Priority Logic Fix: DB Properties > Metadata
                if (p.albumIds && Array.isArray(p.albumIds)) {
                    parsedAlbumIds = p.albumIds;
                } else if (metadataAlbumIds) {
                    parsedAlbumIds = metadataAlbumIds;
                }

                if (p.tags && Array.isArray(p.tags)) {
                    parsedTags = p.tags;
                } else if (metadataTags) {
                    parsedTags = metadataTags;
                }

                return {
                    id: p.id,
                    title: p.title,
                    date: (() => {
                        const d = new Date(p.date || p.createdAt || p.created_at || Date.now());
                        return `${d.toLocaleDateString()} ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
                    })(),
                    blocks: contentBlocks,

                    stickers: p.stickers || [],
                    floatingTexts: p.floatingTexts || [],
                    floatingImages: p.floatingImages || [],
                    albumIds: parsedAlbumIds,
                    titleStyles: parsedTitleStyles || {
                        fontSize: '30px',
                        fontWeight: 'bold',
                        fontFamily: "'Noto Sans KR', sans-serif",
                        color: '#000000',
                        textAlign: 'left'
                    },
                    tags: parsedTags.filter((t: string) => t && t !== 'undefined' && t !== 'null'),
                    mode: p.mode,
                    isFavorite: p.isFavorite,
                };
            }));
        }
    };

    // ✨ 글쓰기 시작 (Context-aware)
    const handleStartWriting = (initialAlbumId?: string) => {
        // ✨ Defensive Check: Ensure initialAlbumId is a string
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

        // ✨ 앨범 문맥이 있으면 해당 앨범 자동 선택
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
        setTargetAlbumIds(post.albumIds || []); // ✨ 앨범 ID 로드
        // ✨ Mode Fallback Logic fix
        if (post.mode) {
            setMode(post.mode);
        } else {
            // Heuristic: If tags exist, assume AUTO probably. If manual album IDs exist but no tags? MANUAL?
            // Safest is default to AUTO unless explicit. But user said "If I edit, it starts as MANUAL".
            // If we really want to respect saved state, we need post.mode from DB.
            // If DB doesn't have it, we can default based on content.
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

        // 캔버스가 고정 픽셀(800px)이므로 변환 없이 그대로 저장합니다.

        // ✨ DEFENSIVE: Ensure primitives for Metadata to avoid Circular JSON
        const safeTags = Array.isArray(currentTags) ? currentTags.filter(t => typeof t === 'string') : [];
        const safeAlbumIds = Array.isArray(targetAlbumIds) ? targetAlbumIds.filter(id => typeof id === 'string') : [];

        // ✨ Auto-Link Logic: Resolve IDs for Tags (AUTO Mode ONLY)
        const finalAlbumIds = new Set(safeAlbumIds); // Start with manually selected IDs

        if (mode === 'AUTO' && safeTags.length > 0) {
            // Remove duplicates from tags to avoid redundant ops
            const uniqueTags = Array.from(new Set(safeTags));

            for (const tag of uniqueTags) {
                // ✨ Refinement: Only auto-select ALBUMS, not Folders
                const existing = customAlbums.find(a =>
                    (a.tag === tag || a.name === tag) &&
                    (a.type === 'album' || a.type === 'room') // Exclude 'folder'
                );
                if (existing) {
                    finalAlbumIds.add(existing.id);
                } else {
                    // Auto-create and get ID
                    // in AUTO mode, we might auto-create.
                    // But wait, if user switched to MANUAL, we should NOT do this loop at all.
                    // The 'if (mode === 'AUTO')' check above handles it.
                    // So why did it move?

                    // ANSWER: It implies that `mode` might be 'AUTO' at this point,
                    // OR that `finalAlbumIds` is being constructed wrong.

                    // If mode is MANUAL, we skip this block, so `finalAlbumIds` == `safeAlbumIds`.
                    // So if it moved to '나' (tag based), that means EITHER:
                    // 1. `mode` was effectively 'AUTO'.
                    // 2. The backend is doing it on its own despite our 'MANUAL'.

                    const newId = await handleCreateAlbum(tag, [tag]);
                    if (newId) finalAlbumIds.add(newId);
                }
            }
        }

        // Double check: if MANUAL, ensure we ONLY send selected IDs
        // (The logic above already does this, but let's be explicit in debugging if needed)

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
            // ✨ Key Logic Change: For MANUAL mode, we want to SET the albums, not just add.
            // But the backend `savePostToApi` (POST/PUT /api/posts) typically REPLACES the album list in the DB if we send it.
            // So simply sending `mergedAlbumIds` (which is just `safeAlbumIds` in MANUAL mode) is correct for "replacing" the list.
            albumIds: mergedAlbumIds,
            mode,
            isFavorite,
            isPublic
        };

        // 🔍 DEBUG: Verify what we are strictly sending
        if (mode === 'MANUAL') {
            console.log("🚀 [MANUAL SAVE DEBUG]", {
                sentAlbumIds: mergedAlbumIds,
                tags: safeTags
            });
            // Uncomment this if you want visible confirmation
            // alert(`[DEBUG] 수동 저장 전송:\n모드: ${mode}\n전송할 앨범ID: ${JSON.stringify(mergedAlbumIds)}\n태그: ${JSON.stringify(safeTags)}`);
        }

        setIsSaving(true);
        try {
            await savePostToApi(postData, !!currentPostId);

            // ✨ 포스트 저장 성공 후 퀘스트 완료 처리
            triggerPostCreation();

            alert("저장 완료!");

            // ✨ Ensure Real-time Update: Fetch BOTH Posts and Albums
            await Promise.all([
                fetchPosts(),    // Update global posts list (for counts and immediate display)
                fetchAlbums()    // Update album counts (for album list)
            ]);

            // Note: If we are in 'MANUAL' mode and have target albums, where should we go?
            // If user started from a folder (handleStartWriting passed ID), they probably want to go back there.
            // But handleStartWriting clears history or doesn't track it explicitly other than targetAlbumIds.

            // Heuristic: If there is exactly one target album, go to it. Otherwise go to root.
            if (targetAlbumIds.length === 1) {
                // If it's a room, update logic handles it in PostFolderPage via ID
                setSelectedAlbumId(targetAlbumIds[0]);
                // We don't explicit setViewMode('folder') because PostPage usually reacts to selectedAlbumId??
                // Wait, PostPage logic: if selectedAlbumId is set -> PostFolderPage.
                // But setViewMode is manual override.
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

    const handleAiGenerate = async () => {
        if (!rawInput.trim()) return alert("주제를 입력해주세요!");
        setIsAiProcessing(true);
        try {
            const newBlocks = await generateBlogContent(rawInput, selectedLayoutId, tempImages);
            setBlocks(newBlocks);
        } catch (e) { alert("AI 오류 발생"); }
        finally { setIsAiProcessing(false); }
    };

    const handleUpdate = (id: string, type: 'block' | 'sticker' | 'floating' | 'floatingImage' | 'title', keyOrObj: any, value?: any) => {
        // ✨ Defensive: Prevent Event objects from polluting state
        if (keyOrObj && (keyOrObj.nativeEvent || keyOrObj.preventDefault || keyOrObj.stopPropagation)) {
            console.warn("handleUpdate received an Event object! Ignoring.", keyOrObj);
            return;
        }

        let updates: any = {};
        if (typeof keyOrObj === 'string') updates[keyOrObj] = value;
        else updates = keyOrObj;

        if (updates && (updates.nativeEvent || updates.preventDefault)) {
            console.warn("handleUpdate received an Event object as updates! Ignoring.", updates);
            return;
        }

        if (type === 'block') setBlocks(p => p.map(b => b.id === id ? { ...b, styles: { ...b.styles, ...updates } } : b));
        else if (type === 'sticker') setStickers(p => p.map(s => s.id === id ? { ...s, ...updates } : s));
        else if (type === 'floatingImage') setFloatingImages(p => p.map(img => img.id === id ? { ...img, ...updates } : img));
        else if (type === 'title') {
            // titleStyles update
            if (updates.styles) setTitleStyles(p => ({ ...p, ...updates.styles }));
            else setTitleStyles(p => ({ ...p, ...updates }));
        }
        else if (type === 'floating') setFloatingTexts(p => p.map(f => {
            if (f.id !== id) return f;
            const newStyles = { ...f.styles };
            let hasStyleChange = false;
            const newRoot = { ...f };
            Object.keys(updates).forEach(key => {
                if (['fontSize', 'fontWeight', 'textAlign', 'color', 'backgroundColor'].includes(key)) {
                    newStyles[key as keyof typeof newStyles] = updates[key];
                    hasStyleChange = true;
                } else { (newRoot as any)[key] = updates[key]; }
            });
            return hasStyleChange ? { ...newRoot, styles: newStyles } : newRoot;
        }));
    };

    const handleDelete = () => {
        if (!selectedId) return;
        if (selectedType === 'block') setBlocks(p => p.filter(b => b.id !== selectedId));
        else if (selectedType === 'sticker') setStickers(p => p.filter(s => s.id !== selectedId));
        else if (selectedType === 'floating') setFloatingTexts(p => p.filter(f => f.id !== selectedId));
        else if (selectedType === 'floatingImage') setFloatingImages(p => p.filter(i => i.id !== selectedId));
        else if (selectedType === 'title') {
            // Title cannot be deleted, maybe just reset styles?
            // Or do nothing.
            alert("제목은 삭제할 수 없습니다.");
        }
        setSelectedId(null); setSelectedType(null);
    };

    const getMaxZ = () => Math.max(
        ...stickers.map(s => s.zIndex),
        ...floatingTexts.map(f => f.zIndex),
        ...floatingImages.map(i => i.zIndex),
        10
    );

    // 스폰 위치도 PX 단위로 계산
    const getSpawnPosition = () => {
        // 현재 스크롤된 위치 (px)에다가 200px 정도 더해서 화면 중앙쯤에 배치
        // (캔버스 내부 좌표 기준이므로 window.scrollY를 그대로 쓰면 안 될 수도 있지만,
        //  보통 캔버스 최상단이 0이므로 대략 맞습니다. 정교하게 하려면 캔버스 rect 계산 필요)
        // 여기서는 안전하게 캔버스 상단 300px 지점으로 고정하거나, 간단히 처리합니다.

        return 300; // 일단 300px 위치에 고정 생성 (스크롤 로직이 복잡해지므로 단순화)
    };

    // 4️⃣ [수정] 아이템 추가 시 초기값 PX 단위로 변경
    const addSticker = (url: string) => {
        const newSticker: Sticker = {
            id: `stk-${Date.now()}`, url,
            x: 350, // 800px 너비 기준 중앙 (400 - width/2)
            y: getSpawnPosition(),
            w: 100, h: 100, // px 단위 크기
            rotation: (Math.random() * 20) - 10, opacity: 1, zIndex: getMaxZ() + 1
        };
        setStickers([...stickers, newSticker]);
        setSelectedId(newSticker.id); setSelectedType('sticker');
    };

    const addFloatingText = () => {
        const newText: FloatingText = {
            id: `ft-${Date.now()}`, text: "메모",
            x: 300, // px 단위
            y: getSpawnPosition(),
            w: 200, h: 100, // px 단위
            rotation: 0, zIndex: getMaxZ() + 1,
            styles: { fontSize: '18px', fontWeight: 'normal', textAlign: 'center', color: '#000000', backgroundColor: 'transparent', fontFamily: "'Noto Sans KR', sans-serif" }
        };
        setFloatingTexts([...floatingTexts, newText]);
        setSelectedId(newText.id); setSelectedType('floating');
    };

    const addFloatingImage = async (file: File) => {
        let url = "";
        if (supabase) {
            const uploaded = await uploadImageToSupabase(file);
            if (uploaded) url = uploaded;
        } else {
            const reader = new FileReader();
            url = await new Promise((r) => { reader.onload = () => r(reader.result as string); reader.readAsDataURL(file); });
        }

        if (url) {
            const newImg: FloatingImage = {
                id: `fi-${Date.now()}`, url,
                x: 250, // px 단위
                y: getSpawnPosition(),
                w: 300, h: 200, // px 단위
                rotation: 0, opacity: 1, zIndex: getMaxZ() + 1
            };
            setFloatingImages(prev => [...prev, newImg]);
            setSelectedId(newImg.id); setSelectedType('floatingImage');
        }
    };

    const handleBlockImageUpload = async (id: string, file: File, imgIndex: number = 1) => {
        const url = await uploadImageToSupabase(file);
        if (url) setBlocks(p => p.map(b => b.id === id ? { ...b, [imgIndex === 1 ? 'imageUrl' : 'imageUrl2']: url } : b));
    };

    const changeZIndex = (dir: 'up' | 'down') => {
        const change = dir === 'up' ? 1 : -1;
        const updateZ = (item: any) => item.id === selectedId ? { ...item, zIndex: item.zIndex + change } : item;
        if (selectedType === 'sticker') setStickers(p => p.map(updateZ));
        else if (selectedType === 'floating') setFloatingTexts(p => p.map(updateZ));
        else if (selectedType === 'floatingImage') setFloatingImages(p => p.map(updateZ));
    };



    // ✨ Browser History Sync for Back Button Support & Refresh Restoration
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (event.state && event.state.viewMode) {
                // Restore state from history
                setViewMode(event.state.viewMode);
                setSelectedAlbumId(event.state.selectedAlbumId || null);
            } else {
                // Default state (Album List)
                setViewMode('album');
                setSelectedAlbumId(null);
            }
        };

        // ✨ Handle Initial Load (Refresh) with Hash
        const hash = window.location.hash;
        if (hash.startsWith('#album/')) {
            const albumId = hash.replace('#album/', '');
            if (albumId) {
                setViewMode('folder');
                setSelectedAlbumId(albumId);
                // Ensure history state is synced so Back works
                window.history.replaceState({ viewMode: 'folder', selectedAlbumId: albumId }, '', hash);
            }
        }

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleAlbumClick = (id: string | null) => {
        const newMode = id ? 'folder' : 'album';
        setSelectedAlbumId(id);
        setViewMode(newMode);

        // ✨ Push state to history
        window.history.pushState({ viewMode: newMode, selectedAlbumId: id }, '', id ? `#album/${id}` : '#albums');
    };

    // ✨ Handle Move Post (Drag and Drop)
    const handleMovePost = async (postId: string | number, targetAlbumId: string | null) => {
        // Use New API Endpoint
        // POST /api/albums/{id}/manage (wrapped in manageAlbumItem)

        // Optimistic Update
        setPosts(prev => prev.map(p => {
            if (String(p.id) !== String(postId)) return p;
            let newIds = p.albumIds || [];
            if (targetAlbumId) {
                if (!newIds.includes(targetAlbumId)) newIds = [...newIds, targetAlbumId];
                // Remove from current context if applicable
                // Note: selectedAlbumId and targetAlbumId might be prefixed
                if (selectedAlbumId && selectedAlbumId !== '__all__' && selectedAlbumId !== '__others__') {
                    newIds = newIds.filter(id => id !== selectedAlbumId);
                }
            }
            return { ...p, albumIds: newIds };
        }));

        const { manageAlbumItem } = await import('../api'); // lazy load to avoid circular deps if any
        if (targetAlbumId) {
            const realTargetId = String(targetAlbumId).replace('room-', '');
            const targetType = String(targetAlbumId).startsWith('room-') ? 'room' : 'album';

            await manageAlbumItem(realTargetId, 'ADD', 'POST', postId, undefined, targetType);

            if (selectedAlbumId && selectedAlbumId !== '__all__' && selectedAlbumId !== '__others__') {
                const realSourceId = String(selectedAlbumId).replace('room-', '');
                const sourceType = String(selectedAlbumId).startsWith('room-') ? 'room' : 'album';

                await manageAlbumItem(realSourceId, 'REMOVE', 'POST', postId, undefined, sourceType);
            }
        }

        // Refresh to ensure sync
        fetchPosts();
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
        currentPostId, // Expose currentPostId to distinguish Create vs Edit
        selectedAlbumId, handleAlbumClick, // ✨ 앨범 관련 추가
        customAlbums, handleCreateAlbum, // ✨ 커스텀 앨범 추가
        handleUpdateAlbum, handleDeleteAlbum, // ✨ 앨범 수정/삭제 추가
        currentTags, setTags: setCurrentTags, // ✨ 태그 상태 노출
        targetAlbumIds, setTargetAlbumIds, // ✨ 앨범 ID 선택 상태 노출
        sortOption, setSortOption, handleDeletePost, // ✨ 정렬 및 삭제 핸들러 노출
        handleToggleFavorite, // ✨ 즐겨찾기 핸들러 노출
        handleToggleAlbumFavorite, // ✨ 앨범 즐겨찾기 핸들러 추가
        handleMovePost, // ✨ DnD Handler Exposed
        mode, setMode, // ✨ Expose mode
        isFavorite, setIsFavorite, // ✨ Expose isFavorite
        isPublic, setIsPublic, // ✨ Expose isPublic
        refreshPosts: fetchPosts, // ✨ Expose data refresh trigger
        setStickers, setFloatingTexts, setFloatingImages // ✨ Expose setters for Rolling Paper
    };
};