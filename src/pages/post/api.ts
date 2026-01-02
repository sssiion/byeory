import { createClient } from '@supabase/supabase-js';
import type { Block } from './types';
import { LAYOUT_PRESETS } from './constants';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
// 백엔드 API 주소 (Vite Proxy 사용 시 상대 경로)
const API_BASE_URL = "/api/posts";
export const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export const deleteOldImage = async (oldUrl: string | null) => {
    if (!oldUrl) return; // 삭제할 URL이 없으면 종료

    try {
        // URL에서 파일 경로만 추출하는 로직
        // 예: .../public/blog-assets/2024...png -> 2024...png
        const filePath = oldUrl.split('/blog-assets/').pop();

        if (filePath && supabase) {
            const { error } = await supabase.storage
                .from('blog-assets')
                .remove([filePath]); // 파일 삭제 요청

            if (error) {
                console.warn("기존 이미지 삭제 실패 (무시하고 진행):", error);
            } else {
                console.log("기존 이미지 삭제 완료");
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

    // 프롬프트 대폭 수정: 창작 금지, 정리 및 배포에 집중
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
    // [임시 저장소] 로컬 스토리지 사용 (백엔드 미연동 상태)
    // 실제 백엔드 연동 시, 아래 로컬 스토리지 코드를 삭제하고 주석 처리된 백엔드 코드를 사용하세요.
    await new Promise(resolve => setTimeout(resolve, 300)); // 네트워크 딜레이 시뮬레이션
    const localData = localStorage.getItem('local_posts');
    const posts = localData ? JSON.parse(localData) : [];
    return posts.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    /* [백엔드 연동 시 수정 필요]
    try {
        // 백엔드의 GET /api/posts 엔드포인트 호출
        const response = await fetch(`${API_BASE_URL}`);
        if (!response.ok) throw new Error("게시글 불러오기 실패");
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
    */
};

// 게시글 저장 (생성 POST / 수정 PUT)
export const savePostToApi = async (postData: any, isUpdate: boolean = false) => {
    // [임시 저장소] 로컬 스토리지 사용
    await new Promise(resolve => setTimeout(resolve, 500)); // 네트워크 딜레이 시뮬레이션

    const localData = localStorage.getItem('local_posts');
    let posts = localData ? JSON.parse(localData) : [];

    if (isUpdate) {
        // 수정 로직
        const index = posts.findIndex((p: any) => p.id === postData.id);
        if (index !== -1) {
            posts[index] = { ...postData, date: new Date().toISOString() };
        }
    } else {
        // 생성 로직 (ID 생성 포함)
        const newId = Date.now();
        const newPost = { ...postData, id: newId, date: new Date().toISOString() };
        posts.push(newPost);
        // 생성된 ID 반환을 위해 postData 업데이트
        postData.id = newId;
    }

    localStorage.setItem('local_posts', JSON.stringify(posts));
    return postData;

    /* [백엔드 연동 시 수정 필요]
    try {
        const url = isUpdate ? `${API_BASE_URL}/${postData.id}` : API_BASE_URL;
        const method = isUpdate ? "PUT" : "POST";

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
        });

        if (!response.ok) throw new Error("저장 실패");
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
    */
};

// 게시글 삭제
export const deletePostApi = async (id: string | number) => {
    // [임시 저장소] 로컬 스토리지 사용
    await new Promise(resolve => setTimeout(resolve, 300));

    const localData = localStorage.getItem('local_posts');
    if (localData) {
        let posts = JSON.parse(localData);
        posts = posts.filter((p: any) => String(p.id) !== String(id));
        localStorage.setItem('local_posts', JSON.stringify(posts));
    }
    console.log(`[DELETE] Post ${id} deleted (LocalStorage).`);
    return true;

    /* [백엔드 연동 시 수정 필요]
    try {
        const url = `${API_BASE_URL}/${id}`;
        const response = await fetch(url, {
            method: "DELETE",
        });

        if (!response.ok) throw new Error("삭제 실패");
        console.log(`[DELETE] Post ${id} deleted.`);
        return true;
    } catch (error) {
        console.error("삭제 API 오류:", error);
        return false;
    }
    */
};