import { useState, useRef, useEffect } from 'react';
import { supabase, uploadImageToSupabase, generateBlogContent } from '../api';
import type { Block, PostData, Sticker, FloatingText, FloatingImage, ViewMode } from '../types';

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

    // ... (fetchPosts, handleStartWriting, handlePostClick, handleSave, handleAiGenerate 등은 기존과 동일) ...
    const fetchPosts = async () => {
        if (!supabase) return;
        const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
        if (!error && data) {
            setPosts(data.map(p => ({
                id: p.id, title: p.title, date: new Date(p.created_at).toLocaleDateString(),
                blocks: p.blocks || [], stickers: p.stickers || [],
                floatingTexts: p.floating_texts || [], floatingImages: p.floating_images || []
            })));
        }
    };

    const handleStartWriting = () => {
        setCurrentPostId(null); setTitle(""); setRawInput("");
        setBlocks([{ id: `b-${Date.now()}`, type: 'paragraph', text: '' }]);
        setStickers([]); setFloatingTexts([]); setFloatingImages([]); setTempImages([]);
        setSelectedId(null); setSelectedType(null);
        setViewMode('editor');
    };

    const handlePostClick = (post: PostData) => {
        setCurrentPostId(post.id); setTitle(post.title);
        setBlocks(post.blocks); setStickers(post.stickers);
        setFloatingTexts(post.floatingTexts || []);
        setFloatingImages(post.floatingImages || []);
        setViewMode('read');
    };

    const handleSave = async () => {
        if (!title.trim()) return alert("제목을 입력해주세요!");
        const postData = { title, blocks, stickers, floating_texts: floatingTexts, floating_images: floatingImages };
        if (!supabase) { alert("⚠️ 임시 저장됨"); setViewMode('list'); return; }
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

    const handleUpdate = (id: string, type: 'block' | 'sticker' | 'floating' | 'floatingImage', keyOrObj: any, value?: any) => {
        let updates: any = {};
        if (typeof keyOrObj === 'string') updates[keyOrObj] = value;
        else updates = keyOrObj;

        if (type === 'block') setBlocks(p => p.map(b => b.id === id ? { ...b, styles: { ...b.styles, ...updates } } : b));
        else if (type === 'sticker') setStickers(p => p.map(s => s.id === id ? { ...s, ...updates } : s));
        else if (type === 'floatingImage') setFloatingImages(p => p.map(img => img.id === id ? { ...img, ...updates } : img));
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
        setSelectedId(null); setSelectedType(null);
    };

    const getMaxZ = () => Math.max(
        ...stickers.map(s => s.zIndex),
        ...floatingTexts.map(f => f.zIndex),
        ...floatingImages.map(i => i.zIndex),
        10
    );

    // 🌟 [핵심] 현재 스크롤 위치를 기반으로 화면 중앙에 생성하는 함수
    const getSpawnPosition = () => {
        // 현재 스크롤 위치 (px)
        const scrollY = window.scrollY;
        // 전체 문서 높이 (px) - body가 없을 경우 fallback
        const totalHeight = document.body.scrollHeight || document.documentElement.scrollHeight || 1000;
        // 화면 높이 (px)
        const viewHeight = window.innerHeight;

        // 현재 보고 있는 화면의 중간 지점 (px)
        const middlePx = scrollY + (viewHeight / 3); // 살짝 위쪽(1/3 지점)이 더 보기 좋음

        // 전체 높이 대비 퍼센트(%) 계산
        const yPercent = (middlePx / totalHeight) * 100;

        // 안전 장치: 최소 5%, 최대 90% 안에 들어오도록
        return Math.min(Math.max(yPercent, 5), 90);
    };

    const addSticker = (url: string) => {
        const newSticker: Sticker = {
            id: `stk-${Date.now()}`, url,
            x: 40, // 가로 중앙 근처
            y: getSpawnPosition(), // 💡 현재 화면 기준 생성
            w: 15, h: 15,
            rotation: (Math.random()*20)-10, opacity: 1, zIndex: getMaxZ() + 1
        };
        setStickers([...stickers, newSticker]);
        setSelectedId(newSticker.id); setSelectedType('sticker');
    };

    const addFloatingText = () => {
        const newText: FloatingText = {
            id: `ft-${Date.now()}`, text: "메모",
            x: 35,
            y: getSpawnPosition(), // 💡 현재 화면 기준 생성
            w: 30, h: 10,
            rotation: 0, zIndex: getMaxZ() + 1,
            styles: { fontSize: '18px', fontWeight: 'normal', textAlign: 'center', color: '#000000', backgroundColor: 'transparent' }
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
                x: 30,
                y: getSpawnPosition(), // 💡 현재 화면 기준 생성
                w: 40, h: 30,
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