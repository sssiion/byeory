import { useState, useRef, useEffect } from 'react';
import { supabase, uploadImageToSupabase, generateBlogContent, savePostToApi, fetchPostsFromApi } from '../api';
import type { Block, PostData, Sticker, FloatingText, FloatingImage, ViewMode } from '../types';

// 캔버스 크기 고정 (EditorCanvas.tsx와 동일하게 설정)

export const usePostEditor = () => {
    // ... (상태 변수들 기존과 동일) ...
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [posts, setPosts] = useState<PostData[]>([]);
    const [currentPostId, setCurrentPostId] = useState<number | null>(null);
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (supabase) fetchPosts(); }, []);

    // 데이터 불러오기: PX 단위 그대로 사용 + 메타데이터 블록 파싱
    const fetchPosts = async () => {
        const data = await fetchPostsFromApi();
        if (data) {
            setPosts(data.map((p: any) => {
                const rawBlocks = p.blocks || [];
                const contentBlocks: Block[] = [];
                // 기본값 설정
                let parsedTitleStyles = p.titleStyles || null;

                // 메타데이터 블록 추출
                rawBlocks.forEach((b: Block) => {
                    if (b.type === 'paragraph' && b.text && b.text.startsWith('<!--METADATA:')) {
                        try {
                            const json = b.text.replace('<!--METADATA:', '').replace('-->', '');
                            const metadata = JSON.parse(json);
                            if (metadata.titleStyles) parsedTitleStyles = metadata.titleStyles;
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
                    titleStyles: parsedTitleStyles || {
                        fontSize: '30px',
                        fontWeight: 'bold',
                        fontFamily: "'Noto Sans KR', sans-serif",
                        color: '#000000',
                        textAlign: 'left'
                    }
                };
            }));
        }
    };

    const handleStartWriting = () => {
        setCurrentPostId(null); setTitle(""); setRawInput("");
        setTitleStyles({
            fontSize: '30px',
            fontWeight: 'bold',
            fontFamily: "'Noto Sans KR', sans-serif",
            color: '#000000',
            textAlign: 'left'
        });
        setBlocks([{ id: `b-${Date.now()}`, type: 'paragraph', text: '' }]);
        setStickers([]); setFloatingTexts([]); setFloatingImages([]); setTempImages([]);
        setSelectedId(null); setSelectedType(null);
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
        setViewMode('read');
    };

    // 2️⃣ [수정] 저장하기: PX 단위 그대로 저장 + 메타데이터 블록 추가
    const handleSave = async () => {
        if (!title.trim()) return alert("제목을 입력해주세요!");

        // 🔴 [삭제] convertToPercent 함수 삭제! (이제 필요 없음)
        // 캔버스가 고정 픽셀(800px)이므로 변환 없이 그대로 저장합니다.

        // ✨ 메타데이터 블록 생성 (제목 스타일 저장용)
        const metadata = { titleStyles };
        const metadataBlock: Block = {
            id: `meta-${Date.now()}`,
            type: 'paragraph',
            text: `<!--METADATA:${JSON.stringify(metadata)}-->`,
            styles: { display: 'none' }
        };

        const postData = {
            id: currentPostId,
            title,
            blocks: [...blocks, metadataBlock], // 마지막에 숨김 블록 추가
            stickers,        // 있는 그대로 저장
            floatingTexts,   // 있는 그대로 저장
            floatingImages,   // 있는 그대로 저장
            titleStyles     // 백엔드 지원 시 사용 (현재는 무시됨)
        };

        setIsSaving(true);
        try {
            await savePostToApi(postData, !!currentPostId);
            alert("저장 완료!");
            fetchPosts();
            setViewMode('list');
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
        let updates: any = {};
        if (typeof keyOrObj === 'string') updates[keyOrObj] = value;
        else updates = keyOrObj;

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

    // 🌟 [수정] 스폰 위치도 PX 단위로 계산
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
        currentPostId // Expose currentPostId to distinguish Create vs Edit
    };
};