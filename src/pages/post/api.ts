import { createClient } from '@supabase/supabase-js';
import type { Block } from './types';
import { LAYOUT_PRESETS } from './constants';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

const BASE_URL = 'http://localhost:8080';
const API_BASE_URL = `${BASE_URL}/api/posts`;
const API_ALBUM_URL = `${BASE_URL}/api/albums`;

// ✨ Singleton Pattern for Supabase Client
const getSupabaseClient = () => {
    if (!SUPABASE_URL || !SUPABASE_KEY) return null;

    const globalVar = window as any;
    if (!globalVar.__supabaseClient) {
        globalVar.__supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return globalVar.__supabaseClient;
};

export const supabase = getSupabaseClient();

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const deleteOldImage = async (oldUrl: string | null) => {
    if (!oldUrl) return;

    try {
        const filePath = oldUrl.split('/blog-assets/').pop();

        if (filePath && supabase) {
            const { error } = await supabase.storage
                .from('blog-assets')
                .remove([filePath]);

            if (error) {
                console.warn("기존 이미지 삭제 실패 (무시하고 진행):", error);
            }
        }
    } catch (e) {
        console.warn("삭제 로직 처리 중 오류:", e);
    }
};

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    if (!supabase) return null;
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const { error } = await supabase.storage.from('blog-assets').upload(fileName, file);
    if (error) { console.error(error); return null; }
    const { data } = supabase.storage.from('blog-assets').getPublicUrl(fileName);
    return data.publicUrl;
};

// 🤖 AI 글 생성 로직 (편집자 모드)
export const generateBlogContent = async (topic: string, layoutId: string, tempImages: string[]) => {
    const layout = LAYOUT_PRESETS.find(l => l.id === layoutId) || LAYOUT_PRESETS[0];
    const structureTemplate = JSON.stringify(layout.structure);

    const MODEL_NAME = "gemma-3-12b-it";

    const prompt = `
        역할: 너는 사용자가 입력한 텍스트를 보기 좋게 다듬어서 배치해주는 '텍스트 편집자'야.
        
        [사용자 입력 텍스트]:
        "${topic}"
        
        [지시사항 - 절대 준수]:
        1. **창작 금지**: 사진에 대해 설명하거나, 사용자가 입력하지 않은 내용을 상상해서 덧붙이지 마.
        2. **내용 분배**: 사용자가 입력한 텍스트를 문맥에 맞게 잘라서 아래 [JSON 템플릿]의 "text" 필드에 나눠 담아줘.
        3. **연결성**: 글이 끊기지 않고 자연스럽게 이어지도록 문장을 다듬거나(오타 수정, 매끄러운 연결어 추가) 문단만 나눠.
        4. 만약 입력된 텍스트 양이 적다면, 억지로 늘리지 말고 담백하게 짧게 작성해.

        [JSON 템플릿 - 이 구조(type) 순서 그대로 채울 것]:
        ${structureTemplate}
        
        [출력 포맷]:
        오직 JSON Array만 출력해.
    `;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);

        const data = await res.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        text = text.replace(/```json|```/g, "").trim();

        let aiBlocks;
        try {
            aiBlocks = JSON.parse(text);
        } catch {
            return [];
        }

        let imgIndex = 0;
        const newBlocks: Block[] = aiBlocks.map((b: any, idx: number) => {
            let imageUrl = undefined;
            let imageUrl2 = undefined;

            if (b.type.includes('image')) {
                if (b.type === 'image-double') {
                    imageUrl = imgIndex < tempImages.length ? tempImages[imgIndex++] : null;
                    imageUrl2 = imgIndex < tempImages.length ? tempImages[imgIndex++] : null;
                } else {
                    imageUrl = imgIndex < tempImages.length ? tempImages[imgIndex++] : null;
                }
            }

            return {
                id: `ai-${Date.now()}-${idx}`,
                type: b.type,
                text: b.text || "",
                imageUrl,
                imageUrl2,
                imageRotation: 0,
                imageFit: 'cover'
            };
        });

        return newBlocks;

    } catch (e) {
        console.error(e);
        throw new Error("AI 생성 실패");
    }
};

// 게시글 목록 조회 (GET)
export const fetchPostsFromApi = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error("게시글 불러오기 실패");
        const posts = await response.json();

        return posts.map((p: any) => ({
            ...p,
            id: Number(p.id),
            // ✨ Robust Tag Mapping: Handle string[] or {name: string}[]
            tags: (p.hashtags || []).map((t: any) => {
                if (typeof t === 'string') return t;
                return t.name || t.tag || t.tagName || "";
            }).filter(Boolean),
            floatingTexts: p.floatingTexts || [],
            floatingImages: p.floatingImages || [],
            titleStyles: p.titleStyles || {},
            // ✨ Robust Album ID Mapping: Handle number[] or {id: number}[]
            albumIds: (p.targetAlbumIds || []).map((t: any) => {
                if (typeof t === 'object' && t !== null) return String(t.id);
                return String(t);
            }),
            isFavorite: p.isFavorite || false,
            mode: p.mode || 'AUTO',
            visibility: p.visibility || 'public'
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
};

// ... (skip savePostToApi edits as they are similar logic but outgoing)

// 앨범 목록 조회 (GET)
export const fetchAlbumsFromApi = async () => {
    try {
        const response = await fetch(`${API_ALBUM_URL}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error("앨범 불러오기 실패");
        const albums = await response.json();
        // ✨ Map IDs to Strings for consistency
        return albums.map((a: any) => {
            // ✨ Ensure 'tag' is populated if backend sends representativeHashtag object
            let mappedTag = a.tag;
            if (!mappedTag && a.representativeHashtag) {
                mappedTag = a.representativeHashtag.name || a.representativeHashtag.tag;
            }

            return {
                ...a,
                id: String(a.id),
                parentId: a.parentId ? String(a.parentId) : null,
                tag: mappedTag || null,
                postCount: a.postCount || 0,
                folderCount: a.folderCount || 0
            };
        });
    } catch (error) {
        console.error(error);
        return [];
    }
};

// 게시글 저장 (생성 POST / 수정 PUT)
export const savePostToApi = async (postData: any, isUpdate: boolean = false) => {
    try {
        const url = isUpdate ? `${API_BASE_URL}/${postData.id}` : API_BASE_URL;
        const method = isUpdate ? "PUT" : "POST";

        // ✨ PREPARE PAYLOAD EXACTLY AS PER GUIDE
        const payload = {
            title: postData.title,
            titleStyles: postData.titleStyles || {},
            blocks: postData.blocks || [],
            stickers: postData.stickers || [],
            floatingTexts: postData.floatingTexts || [],
            floatingImages: postData.floatingImages || [],
            hashtags: postData.tags || [], // tags -> hashtags
            mode: postData.mode || 'AUTO',
            targetAlbumIds: (postData.albumIds || []).map((id: any) => Number(id)).filter((n: number) => !isNaN(n)), // String[] -> Number[]
            isFavorite: postData.isFavorite || false,
            // Ensure visibility is included if backend supports it (even if not in guide, safe to send)
            visibility: postData.visibility
        };

        const response = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("저장 실패");
        const savedPost = await response.json();

        // ✨ Map response to frontend PostData structure immediately
        return {
            ...savedPost,
            id: Number(savedPost.id),
            // ✨ Robust Tag Mapping
            tags: (savedPost.hashtags || []).map((t: any) => {
                if (typeof t === 'string') return t;
                return t.name || t.tag || t.tagName || "";
            }).filter(Boolean),
            floatingTexts: savedPost.floatingTexts || [],
            floatingImages: savedPost.floatingImages || [],
            titleStyles: savedPost.titleStyles || {},
            // ✨ Robust Album ID Mapping
            albumIds: (savedPost.targetAlbumIds || []).map((t: any) => {
                if (typeof t === 'object' && t !== null) return String(t.id);
                return String(t);
            }),
            isFavorite: savedPost.isFavorite || false,
            mode: savedPost.mode || 'AUTO',
            visibility: savedPost.visibility || 'public'
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// 게시글 삭제
export const deletePostApi = async (id: string | number) => {
    try {
        const url = `${API_BASE_URL}/${id}`;
        const response = await fetch(url, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error("삭제 실패");
        return true;
    } catch (error) {
        console.error("삭제 API 오류:", error);
        return false;
    }
};

// ... (Rest of the file)
// 앨범 목록 조회 (GET)


// 앨범 단건 조회 (GET)
export const fetchAlbumApi = async (id: string | number) => {
    try {
        const response = await fetch(`${API_ALBUM_URL}/${id}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error("앨범 정보 불러오기 실패");
        const album = await response.json();
        return {
            ...album,
            id: String(album.id),
            parentId: album.parentId ? String(album.parentId) : null,
            // Ensure strictly typed fields are passed if backend returns them
            roomConfig: album.roomConfig,
            coverConfig: album.coverConfig,
            postCount: album.postCount || 0,
            folderCount: album.folderCount || 0
        };
    } catch (error) {
        console.error(error);
        return null;
    }
};

// 앨범 생성 (POST)
export const createAlbumApi = async (albumData: any) => {
    try {
        const response = await fetch(`${API_ALBUM_URL}`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(albumData),
        });
        if (!response.ok) throw new Error("앨범 생성 실패");
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
};

// 앨범 수정 (PUT)
export const updateAlbumApi = async (id: string | number, albumData: any) => {
    try {
        const response = await fetch(`${API_ALBUM_URL}/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(albumData),
        });
        if (!response.ok) throw new Error("앨범 수정 실패");
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
};

// 앨범 삭제 (DELETE)
export const deleteAlbumApi = async (id: string | number) => {
    try {
        const response = await fetch(`${API_ALBUM_URL}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error("앨범 삭제 실패");
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

// 앨범 콘텐츠 조회
export const fetchAlbumContents = async (
    albumId: string | number,
    providedPosts?: any[],
    providedAlbums?: any[]
) => {
    const targetId = String(albumId);

    // 1. Special Folders: Use existing client-side logic (Fetch All)
    if (targetId === '__all__' || targetId === '__others__') {
        let posts = providedPosts;
        let albums = providedAlbums;

        if (!posts) posts = await fetchPostsFromApi();
        if (!albums) albums = await fetchAlbumsFromApi();

        const localPosts = posts || [];
        const localAlbums = albums || [];
        const contents: any[] = [];

        // Posts
        let matchedPosts: any[] = [];
        if (targetId === '__all__') {
            matchedPosts = localPosts;
        } else {
            // __others__ : Unclassified
            matchedPosts = localPosts.filter((p: any) => {
                const hasManualAlbum = p.albumIds && p.albumIds.length > 0;
                const hasTags = p.tags && p.tags.length > 0;
                return !hasManualAlbum && !hasTags;
            });
        }
        matchedPosts.forEach((p: any) => contents.push({ type: 'POST', data: p }));

        // Folders
        const matchedFolders = localAlbums.filter((a: any) => {
            if (targetId === '__all__') return !a.parentId;
            return false; // __others__ has no sub-folders
        });

        matchedFolders.forEach((a: any) => contents.push({ type: 'FOLDER', data: a }));

        // Sort
        const sortedFolders = matchedFolders.sort((a: any, b: any) => a.name.localeCompare(b.name));
        const sortedPosts = matchedPosts.sort((a: any, b: any) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        return [
            ...sortedFolders.map((d: any) => ({ type: 'FOLDER' as const, data: d })),
            ...sortedPosts.map((d: any) => ({ type: 'POST' as const, data: d }))
        ];
    }

    // 2. Specific Album: Use Optimized Backend Endpoint
    // GET /api/albums/{id}/contents
    try {
        const response = await fetch(`${API_ALBUM_URL}/${targetId}/contents`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error("앨범 콘텐츠 불러오기 실패");

        const data = await response.json();
        const contents: any[] = [];

        // Handle various backend response formats (checking properties or dedicated keys)
        if (data.albums && Array.isArray(data.albums)) {
            data.albums.forEach((a: any) => contents.push({ type: 'FOLDER', data: a }));
        }
        if (data.posts && Array.isArray(data.posts)) {
            data.posts.forEach((p: any) => contents.push({ type: 'POST', data: { ...p, tags: p.hashtags || p.tags || [] } }));
        }

        // If returned as a flat list with 'type' or just mixed properties
        if (Array.isArray(data)) {
            data.forEach((item: any) => {
                // ✨ Fix for Wrapper Format (Backend V2 Response)
                if (item.type && item.content) {
                    if (item.type === 'POST') {
                        contents.push({
                            type: 'POST',
                            data: {
                                ...item.content,
                                tags: item.content.hashtags || item.content.tags || []
                            }
                        });
                    } else if (item.type === 'FOLDER' || item.type === 'ALBUM') {
                        contents.push({
                            type: 'FOLDER',
                            data: {
                                ...item.content,
                                id: String(item.content.id),
                                parentId: item.content.parentId ? String(item.content.parentId) : null
                            }
                        });
                    }
                    return;
                }

                // Heuristic to distinguish: Album has 'name', Post has 'title'
                if (item.name && !item.title) contents.push({
                    type: 'FOLDER',
                    data: {
                        ...item,
                        id: String(item.id),
                        parentId: item.parentId ? String(item.parentId) : null
                    }
                });
                else if (item.title) contents.push({ type: 'POST', data: { ...item, tags: item.hashtags || item.tags || [] } });
            });
        }

        return contents;

    } catch (e) {
        console.error(e);
        return [];
    }
};

// 앨범 관리 (항목 추가/제거/이동) - Optimized API
export const manageAlbumContentApi = async (
    albumId: string | number,
    action: 'ADD' | 'REMOVE' | 'MOVE',
    postId: string | number,
    sourceAlbumId?: string | number
) => {
    try {
        // ✨ Ensure camelCase and Number IDs
        const payload: any = {
            action,
            contentId: Number(postId),
            type: 'POST'
        };

        if (action === 'MOVE' && sourceAlbumId) {
            payload.sourceAlbumId = Number(sourceAlbumId);
        }

        const response = await fetch(`${API_ALBUM_URL}/${albumId}/manage`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        return response.ok;
    } catch (error) {
        console.error(error);
        return false;
    }
};

// 앨범 항목 관리 Wrapper
export const manageAlbumItem = async (
    albumId: string | number,
    action: 'ADD' | 'REMOVE' | 'MOVE',
    type: 'POST' | 'FOLDER',
    contentId: string | number,
    sourceAlbumId?: string | number // ✨ New param passed through
) => {

    // Post Management: Use Optimized Endpoint
    if (type === 'POST') {
        // ✨ Pass sourceAlbumId if present
        const success = await manageAlbumContentApi(albumId, action, contentId, sourceAlbumId);
        if (success) {
            return true;
        }
        return false;
    }

    // Folder Management: Move Folder (Change Parent)
    if (type === 'FOLDER') {
        const albums = await fetchAlbumsFromApi();
        const targetAlbum = albums.find((a: any) => String(a.id) === String(contentId));

        if (!targetAlbum) return false;

        let newParentId = targetAlbum.parentId;

        if (action === 'ADD' || action === 'MOVE') { // Treat MOVE same as ADD for folders (re-parenting)
            newParentId = String(albumId);
        } else if (action === 'REMOVE') {
            if (String(newParentId) === String(albumId)) {
                newParentId = null;
            }
        }

        const updatedAlbum = { ...targetAlbum, parentId: newParentId };
        await updateAlbumApi(contentId, updatedAlbum);
        return true;
    }

    return false;
};