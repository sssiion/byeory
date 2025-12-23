import { createClient } from '@supabase/supabase-js';
import type { Block } from './types';
import  { LAYOUT_PRESETS } from './constants';

const GEMINI_API_KEY = "AIzaSyCwqFuqZ2cuV9gaAAKq2_fmgCB-UyjyqkY"; // 실제 키 사용 시 주의
const SUPABASE_URL = "https://eshgkaxpdjrnydyijtpp.supabase.co";
const SUPABASE_KEY = "sb_publishable_nOSbz6httzI14l7vWyJ3yw_WZRBE7fT";
export const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

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