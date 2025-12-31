import { useState, useRef, useEffect } from 'react';
import { supabase, uploadImageToSupabase, generateBlogContent, savePostToApi, fetchPostsFromApi, deletePostApi } from '../api';
import type { Block, PostData, Sticker, FloatingText, FloatingImage, ViewMode } from '../types';
import { useCredits } from '../../../context/CreditContext'; // Import Credit Context

// 캔버스 크기 고정 (EditorCanvas.tsx와 동일하게 설정)

export const usePostEditor = () => {
    // ✨ Credit Context Trigger
    const { triggerPostCreation } = useCredits();

    // ✨ 커스텀 앨범 타입 정의
    interface CustomAlbum {
        id: string; // ✨ Unique ID added
        name: string;
        tag: string | null;
        createdAt?: number;
        parentId?: string | null; // ✨ Nested Folder Support
    }

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
    // ✨ 커스텀 앨범 목록 (로컬 스토리지 사용)
    const [customAlbums, setCustomAlbums] = useState<CustomAlbum[]>([]);

    const [currentTags, setCurrentTags] = useState<string[]>([]); // ✨ 현재 작성 중인 포스트의 태그들
    const [targetAlbumIds, setTargetAlbumIds] = useState<string[]>([]); // ✨ 저장할 타겟 앨범 ID들
    // ✨ Sort Option Persistence
    const [sortOption, setSortOption] = useState<'name' | 'count' | 'newest'>(() => {
        return (localStorage.getItem('post_sort_option') as any) || 'name';
    });

    useEffect(() => {
        localStorage.setItem('post_sort_option', sortOption);
    }, [sortOption]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (supabase) fetchPosts();

        // 로컬 스토리지에서 커스텀 앨범 목록 불러오기
        const savedAlbums = localStorage.getItem('my_custom_albums_v2');
        if (savedAlbums) {
            try {
                const parsed = JSON.parse(savedAlbums);
                const validAlbums = parsed.filter((a: any) => a.name && a.name !== 'undefined' && a.name !== 'null');

                // ✨ Migration: Assign IDs if missing
                const migrated = validAlbums.map((a: any) => ({
                    ...a,
                    id: a.id || `album-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                }));

                if (JSON.stringify(migrated) !== JSON.stringify(validAlbums)) {
                    localStorage.setItem('my_custom_albums_v2', JSON.stringify(migrated));
                }
                setCustomAlbums(migrated);
            } catch (e) { }
        } else {
            // 마이그레이션: 구 버전 데이터가 있으면 변환 시도
            const oldAlbums = localStorage.getItem('my_custom_albums');
            if (oldAlbums) {
                try {
                    const parsed: string[] = JSON.parse(oldAlbums);
                    // Filter out invalid names
                    const validNames = parsed.filter(name => name && name !== 'undefined' && name !== 'null');
                    const migrated = validNames.map(name => ({
                        id: `album-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        name,
                        tag: null,
                        createdAt: Date.now()
                    })); // 마이그레이션 시 현재 시간 부여
                    setCustomAlbums(migrated as CustomAlbum[]);
                    localStorage.setItem('my_custom_albums_v2', JSON.stringify(migrated));
                } catch (e) { }
            }
        }
    }, []);

    // 앨범 생성 핸들러
    const handleCreateAlbum = (name: string, tags: string[], parentId?: string | null) => {
        if (!name) return null;
        const tag = tags[0] || null;

        // ✨ Removed duplicate check to allow same tag/name but different ID
        if (name.trim() === "") return null;

        const newId = `album-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newAlbum: CustomAlbum = {
            id: newId,
            name,
            tag,
            createdAt: Date.now(),
            parentId: parentId || null // ✨ Set parentId
        };
        const newAlbums = [...customAlbums, newAlbum];
        setCustomAlbums(newAlbums);
        localStorage.setItem('my_custom_albums_v2', JSON.stringify(newAlbums));
        return newId; // ✨ Return ID for auto-selection
    };

    // 앨범 이름 변경 핸들러
    const handleRenameAlbum = (id: string, newName: string) => {
        const next = customAlbums.map(a =>
            a.id === id ? { ...a, name: newName } : a
        );
        setCustomAlbums(next);
        localStorage.setItem('my_custom_albums_v2', JSON.stringify(next));
    };

    // 앨범 삭제 핸들러 (Recursive + Content Deletion)
    const handleDeleteAlbum = async (id: string) => {
        // 1. Identify all albums to delete (Target + Descendants)
        const getDescendants = (parentId: string): string[] => {
            const children = customAlbums.filter(a => a.parentId === parentId);
            let ids = children.map(c => c.id);
            children.forEach(c => {
                ids = [...ids, ...getDescendants(c.id)];
            });
            return ids;
        };
        const allToDeleteIds = [id, ...getDescendants(id)];

        // 2. Remove albums
        const nextAlbums = customAlbums.filter(a => !allToDeleteIds.includes(a.id));
        setCustomAlbums(nextAlbums);
        localStorage.setItem('my_custom_albums_v2', JSON.stringify(nextAlbums));

        // 3. Handle Posts
        // Logic: Remove deleted IDs from posts. If a post has NO valid IDs left (and isn't tagged to a surviving album), delete it.
        // Logic: Remove deleted IDs from posts. If a post has NO valid IDs left (and isn't tagged to a surviving album), delete it.

        // We need to process essentially all posts to clean up references
        const updatedPosts = posts.map(p => {
            if (!p.albumIds) return p;

            // Remove deleted IDs
            const stats = p.albumIds.filter(aid => !allToDeleteIds.includes(aid));
            if (stats.length !== p.albumIds.length) {
                return { ...p, albumIds: stats };
            }
            return p;
        });

        // Now filter out "orphaned" posts if they should be deleted
        // User said: "contents should also be deleted"
        // If a post was in a deleted folder, and is now in NO folder (empty albumIds)
        // AND it doesn't match any legacy tags of surviving albums -> Delete it.
        const finalPosts = updatedPosts.filter(p => {
            // If it still has album IDs, keep it
            if (p.albumIds && p.albumIds.length > 0) return true;

            // If no IDs, check if it was affected by deletion (was it in one of the deleted albums?)
            // We can check if the ORIGINAL post had one of the deleted IDs.
            const original = posts.find(op => op.id === p.id);
            const wasInDeleted = original?.albumIds?.some(aid => allToDeleteIds.includes(aid));

            if (wasInDeleted) {
                // It was in a deleted album, and now has no IDs.
                // Check legacy tags just in case
                const hasSurvivorTag = p.tags?.some(t => nextAlbums.some(a => a.tag === t));
                if (hasSurvivorTag) return true; // Keep if linked by tag to survivor
                return false; // DELETE
            }

            return true; // Wasn't involved, keep
        });

        setPosts(finalPosts);
        // Note: In a real app, we'd batch delete from backend here.
        // For now simulating by saving if we had a save mechanism for bulk posts,
        // but since posts are saved individually in this app structure, we rely on local state 
        // until next fetch or save. 
        // WAIT: We need to persist this deletion!
        // The current app seems to fetch from API. We need a way to delete from API.
        // The existing `handleDeletePost` calls `deletePostFromApi`.
        // We should identify IDs to delete and call API.

        const postsToDelete = posts.filter(p => !finalPosts.find(fp => fp.id === p.id));
        // ✨ Call real API for deletion
        postsToDelete.forEach(p => deletePostApi(p.id));
    };

    // ✨ Delete Post Handler (Single)
    const handleDeletePost = async (id: string) => {
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

                // 메타데이터 블록 추출
                rawBlocks.forEach((b: Block) => {
                    if (b.type === 'paragraph' && b.text && b.text.startsWith('<!--METADATA:')) {
                        try {
                            const json = b.text.replace('<!--METADATA:', '').replace('-->', '');
                            const metadata = JSON.parse(json);
                            if (metadata.titleStyles) parsedTitleStyles = metadata.titleStyles;
                            // ✨ Metadata fallback for tags if backend doesn't support it
                            if (metadata.tags && Array.isArray(metadata.tags)) parsedTags = metadata.tags;
                            // ✨ Metadata fallback for albumIds
                            if (metadata.albumIds && Array.isArray(metadata.albumIds)) parsedAlbumIds = metadata.albumIds;
                        } catch (e) {
                            console.error('Failed to parse metadata block', e);
                        }
                    } else {
                        contentBlocks.push(b);
                    }
                });

                return {
                    id: p.id,
                    title: p.title,
                    date: new Date(p.createdAt || p.created_at).toLocaleDateString(),
                    blocks: contentBlocks,
                    // DB에 저장된 PX 값을 그대로 사용
                    stickers: p.stickers || [],
                    floatingTexts: p.floatingTexts || [],
                    floatingImages: p.floatingImages || [],
                    albumIds: parsedAlbumIds, // ✨ Load albumIds from metadata fallback if needed
                    titleStyles: parsedTitleStyles || {
                        fontSize: '30px',
                        fontWeight: 'bold',
                        fontFamily: "'Noto Sans KR', sans-serif",
                        color: '#000000',
                        textAlign: 'left'
                    },
                    tags: parsedTags.filter((t: string) => t && t !== 'undefined' && t !== 'null') // Filter invalid tags
                };
            }));
        }
    };

    // ✨ 글쓰기 시작 (Context-aware)
    const handleStartWriting = (initialAlbumId?: string) => {
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
        if (initialAlbumId) {
            setTargetAlbumIds([initialAlbumId]);
        } else {
            setTargetAlbumIds([]);
        }
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
        setViewMode('read');
    };

    // 저장하기: PX 단위 그대로 저장 + 메타데이터 블록 추가
    const handleSave = async () => {
        if (!title.trim()) return alert("제목을 입력해주세요!");

        // 캔버스가 고정 픽셀(800px)이므로 변환 없이 그대로 저장합니다.

        // ✨ 1. 태그 기반 앨범 자동 생성 로직 (Refactored for IDs)
        // targetAlbumIds에 있는 것은 이미 존재하는 앨범.
        // currentTags에 있지만 targetAlbumIds와 매핑되지 않는 것은 "새 앨범"으로 간주하거나, 단순 태그.

        const finalAlbumIds = [...targetAlbumIds];

        // 메타데이터 블록 생성 (제목 스타일, 태그, 앨범 ID 저장용)
        // ✨ Safe Metadata Generation: Construct a fresh object to avoid circular references
        const safeTitleStyles = {
            fontSize: titleStyles.fontSize || '30px',
            fontWeight: titleStyles.fontWeight || 'bold',
            fontFamily: titleStyles.fontFamily || "'Noto Sans KR', sans-serif",
            color: titleStyles.color || '#000000',
            textAlign: titleStyles.textAlign || 'left'
        };

        const metadata = { titleStyles: safeTitleStyles, tags: currentTags, albumIds: finalAlbumIds };

        let metadataString = "{}";
        try {
            metadataString = JSON.stringify(metadata);
        } catch (e) {
            console.error("Failed to stringify metadata:", e);
            metadataString = JSON.stringify({
                titleStyles: { fontSize: '30px', fontWeight: 'bold' },
                tags: [],
                albumIds: []
            });
        }

        const metadataBlock: Block = {
            id: `meta-${Date.now()}`,
            type: 'paragraph',
            text: `<!--METADATA:${metadataString}-->`,
            styles: { display: 'none' }
        };

        const postData = {
            id: currentPostId,
            title,
            blocks: [...blocks, metadataBlock], // 마지막에 숨김 블록 추가
            stickers,        // 있는 그대로 저장
            floatingTexts,   // 있는 그대로 저장
            floatingImages,   // 있는 그대로 저장
            titleStyles,     // 백엔드 지원 시 사용
            tags: currentTags, // ✨ 태그 저장
            albumIds: finalAlbumIds // ✨ 앨범 ID 저장
        };

        setIsSaving(true);
        try {
            await savePostToApi(postData, !!currentPostId);

            // ✨ 포스트 저장 성공 후 퀘스트 완료 처리
            triggerPostCreation();

            alert("저장 완료!");
            fetchPosts();
            fetchPosts();
            setViewMode('album');
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


    const handleAlbumClick = (id: string | null) => {
        setSelectedAlbumId(id);
        setViewMode(id ? 'folder' : 'album');
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
        handleRenameAlbum, handleDeleteAlbum, // ✨ 앨범 수정/삭제 추가
        currentTags, setTags: setCurrentTags, // ✨ 태그 상태 노출
        targetAlbumIds, setTargetAlbumIds, // ✨ 앨범 ID 선택 상태 노출
        sortOption, setSortOption, handleDeletePost, // ✨ 정렬 및 삭제 핸들러 노출
        handleToggleFavorite // ✨ 즐겨찾기 핸들러 노출
    };
};