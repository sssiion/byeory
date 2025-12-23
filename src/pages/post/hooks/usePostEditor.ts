import { useState, useRef, useEffect } from 'react';
import { supabase, uploadImageToSupabase, generateBlogContent } from '../api';
import type { Block, PostData, Sticker, FloatingText, FloatingImage, ViewMode } from '../types';


const CANVAS_WIDTH = 800;

export const usePostEditor = () => {
    // ... (상태 변수들 기존과 동일) ...
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [posts, setPosts] = useState<PostData[]>([]);
    const [currentPostId, setCurrentPostId] = useState<number | null>(null);
    const [title, setTitle] = useState("");
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [stickers, setStickers] = useState<Sticker[]>([]);
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
    const [floatingImages, setFloatingImages] = useState<FloatingImage[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<'block' | 'sticker' | 'floating' | 'floatingImage' | null>(null);
    const [rawInput, setRawInput] = useState("");
    const [tempImages, setTempImages] = useState<string[]>([]);
    const [selectedLayoutId, setSelectedLayoutId] = useState('type-a');
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (supabase) fetchPosts(); }, []);

    // 1️⃣ 저장된 데이터 불러올 때 (% -> px 변환)
    const fetchPosts = async () => {
        if (!supabase) return;
        const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
        if (!error && data) {
            setPosts(data.map(p => ({
                id: p.id, title: p.title, date: new Date(p.created_at).toLocaleDateString(),
                blocks: p.blocks || [],
                // DB의 % 데이터를 화면 px로 변환
                stickers: (p.stickers || []).map((s: any) => ({ ...s, x: s.x * CANVAS_WIDTH / 100, y: s.y, w: s.w * CANVAS_WIDTH / 100, h: s.h * CANVAS_WIDTH / 100 })),
                floatingTexts: (p.floating_texts || []).map((f: any) => ({ ...f, x: f.x * CANVAS_WIDTH / 100, y: f.y, w: f.w * CANVAS_WIDTH / 100, h: f.h * CANVAS_WIDTH / 100 })),
                floatingImages: (p.floating_images || []).map((i: any) => ({ ...i, x: i.x * CANVAS_WIDTH / 100, y: i.y, w: i.w * CANVAS_WIDTH / 100, h: i.h * CANVAS_WIDTH / 100 }))
            })));
        }
    };

    const handleStartWriting = () => {
        setCurrentPostId(null); setTitle(""); setRawInput("");
        setBlocks([{ id: `b-${Date.now()}`, type: 'paragraph', text: '' }]);
        setStickers([]); setFloatingTexts([]); setFloatingImages([]);
        setSelectedId(null); setSelectedType(null);
        setViewMode('editor');
    };

    const handlePostClick = (post: PostData) => {
        setCurrentPostId(post.id); setTitle(post.title);
        setBlocks(post.blocks);
        setStickers(post.stickers);
        setFloatingTexts(post.floatingTexts);
        setFloatingImages(post.floatingImages);
        setViewMode('read');
    };

    // 2️⃣ 저장할 때 (px -> % 변환)
    const handleSave = async () => {
        if (!title.trim()) return alert("제목을 입력해주세요!");

        // 화면상 px 좌표를 DB용 % 좌표로 변환하여 저장
        const convertToPercent = (items: any[]) => items.map(item => ({
            ...item,
            x: (item.x / CANVAS_WIDTH) * 100,
            w: (item.w / CANVAS_WIDTH) * 100,
            h: (item.h / CANVAS_WIDTH) * 100,
            // y는 스크롤 높이 문제로 일단 px 유지하거나 별도 처리 (여기선 편의상 유지)
        }));

        const postData = {
            title, blocks,
            stickers: convertToPercent(stickers),
            floating_texts: convertToPercent(floatingTexts),
            floating_images: convertToPercent(floatingImages)
        };

        if (!supabase) { alert("⚠️ 임시 저장됨 (DB 연결 안됨)"); setViewMode('list'); return; }

        setIsSaving(true);
        const { error } = currentPostId
            ? await supabase.from('posts').update(postData).eq('id', currentPostId)
            : await supabase.from('posts').insert(postData);

        if (error) alert("저장 실패: " + error.message);
        else { alert("저장 완료!"); fetchPosts(); setViewMode('list'); }
        setIsSaving(false);
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

    // 👇 이 함수 전체를 아래 코드로 덮어씌워주세요!
    const handleUpdate = (id: string, type: string, changes: any) => {
        // 1. 블록(고정 사진/글) 업데이트 (이게 빠져있어서 안 움직였던 것!)
        if (type === 'block') {
            setBlocks(p => p.map(b => b.id === id ? {
                ...b,
                styles: { ...b.styles, ...changes } // styles 안에 안전하게 합치기
            } : b));
        }
        // 2. 스티커 업데이트
        else if (type === 'sticker') {
            setStickers(p => p.map(s => s.id === id ? { ...s, ...changes } : s));
        }
        // 3. 텍스트 메모 업데이트
        else if (type === 'floating') {
            setFloatingTexts(p => p.map(f => f.id === id ? { ...f, ...changes } : f));
        }
        // 4. 자유 사진 업데이트
        else if (type === 'floatingImage') {
            setFloatingImages(p => p.map(i => i.id === id ? { ...i, ...changes } : i));
        }
    };

    const handleDelete = () => {
        if (!selectedId) return;
        if (selectedType === 'block') setBlocks(p => p.filter(b => b.id !== selectedId));
        else if (selectedType === 'sticker') setStickers(p => p.filter(s => s.id !== selectedId));
        else if (selectedType === 'floating') setFloatingTexts(p => p.filter(f => f.id !== selectedId));
        else if (selectedType === 'floatingImage') setFloatingImages(p => p.filter(i => i.id !== selectedId));
        setSelectedId(null); setSelectedType(null);
    };



    // 4️⃣ 아이템 추가 (초기값 px 단위로 설정)
    const addSticker = (url: string) => {
        const newSticker: Sticker = {
            id: `stk-${Date.now()}`, url,
            x: 100, y: window.scrollY + 200, // px 단위
            w: 150, h: 150, // px 단위
            rotation: (Math.random()*20)-10, zIndex: 10
        };
        setStickers([...stickers, newSticker]);
    };

    const addFloatingText = () => {
        const newText: FloatingText = {
            id: `ft-${Date.now()}`, text: "메모",
            x: 100, y: window.scrollY + 200, // px 단위
            w: 200, h: 100, // px 단위
            rotation: 0, zIndex: 11,
            styles: { fontSize: '18px', fontWeight: 'normal', textAlign: 'center', color: '#000000', backgroundColor: 'transparent' }
        };
        setFloatingTexts([...floatingTexts, newText]);
    };

    const addFloatingImage = async (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const url = e.target?.result as string;
            const newImg: FloatingImage = {
                id: `fi-${Date.now()}`, url,
                x: 100, y: window.scrollY + 200, // px
                w: 250, h: 200, // px
                rotation: 0, zIndex: 12
            };
            setFloatingImages(prev => [...prev, newImg]);
        };
        reader.readAsDataURL(file);
    };

    // 3️⃣ 이미지 업로드 수정 (무조건 미리보기 보장)
    const handleBlockImageUpload = async (id: string, file: File, imgIndex: number = 1) => {
        // 즉시 로컬 미리보기 생성
        const reader = new FileReader();
        reader.onload = (e) => {
            const localUrl = e.target?.result as string;
            setBlocks(prev => prev.map(b => b.id === id ? {
                ...b, [imgIndex === 1 ? 'imageUrl' : 'imageUrl2']: localUrl
            } : b));
        };
        reader.readAsDataURL(file);

        // 백그라운드에서 서버 업로드 시도 (성공하면 URL 교체)
        if (supabase) {
            uploadImageToSupabase(file).then(serverUrl => {
                if (serverUrl) {
                    setBlocks(prev => prev.map(b => b.id === id ? {
                        ...b, [imgIndex === 1 ? 'imageUrl' : 'imageUrl2']: serverUrl
                    } : b));
                }
            });
        }
    };

    const changeZIndex = (dir: 'up'|'down') => {
        const change = dir === 'up' ? 1 : -1;
        const updateZ = (item: any) => item.id === selectedId ? { ...item, zIndex: item.zIndex + change } : item;
        if (selectedType === 'sticker') setStickers(p => p.map(updateZ));
        else if (selectedType === 'floating') setFloatingTexts(p => p.map(updateZ));
        else if (selectedType === 'floatingImage') setFloatingImages(p => p.map(updateZ));
    };

    return {
        viewMode, setViewMode, posts, title, setTitle,
        blocks, setBlocks, stickers, floatingTexts, floatingImages,
        selectedId, setSelectedId, selectedType, setSelectedType,
        rawInput, setRawInput, tempImages, setTempImages,
        selectedLayoutId, setSelectedLayoutId, isAiProcessing, isSaving,
        fileInputRef,
        handleStartWriting, handlePostClick, handleSave, handleAiGenerate,
        handleUpdate, handleDelete, addSticker, addFloatingText, addFloatingImage,
        handleBlockImageUpload, changeZIndex
    };
};
