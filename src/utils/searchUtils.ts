/**
 * 한글 초성 검색을 지원하는 유틸리티 함수
 */

// 한글 초성 목록
const CHOSUNG_LIST = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

/**
 * 한글 문자열에서 초성만 추출
 */
export function extractChosung(text: string): string {
    const result: string[] = [];

    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i) - 0xAC00;

        // 한글 범위 체크 (가-힣)
        if (code >= 0 && code <= 11171) {
            const chosungIndex = Math.floor(code / 588);
            result.push(CHOSUNG_LIST[chosungIndex]);
        } else {
            // 한글이 아닌 경우 그대로 추가
            result.push(text[i]);
        }
    }

    return result.join('');
}

/**
 * 공백을 제거하여 정규화
 */
export function normalizeSpacing(text: string): string {
    return text.replace(/\s+/g, '');
}

/**
 * 검색어와 대상 문자열이 매칭되는지 확인
 * - 한글 초성 검색 지원
 * - 공백 무시
 * - 대소문자 무시
 */
export function fuzzyMatch(query: string, target: string): boolean {
    if (!query || !target) return false;

    const normalizedQuery = query.toLowerCase().trim();
    const normalizedTarget = target.toLowerCase();

    // 1. 일반 포함 검색
    if (normalizedTarget.includes(normalizedQuery)) {
        return true;
    }

    // 2. 공백 무시 검색
    const spacelessQuery = normalizeSpacing(normalizedQuery);
    const spacelessTarget = normalizeSpacing(normalizedTarget);
    if (spacelessTarget.includes(spacelessQuery)) {
        return true;
    }

    // 3. 초성 검색 (한글만)
    const hasKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(normalizedQuery);
    if (hasKorean) {
        const targetChosung = extractChosung(normalizedTarget);
        const queryChosung = extractChosung(normalizedQuery);

        if (targetChosung.includes(queryChosung)) {
            return true;
        }

        // 초성만으로 검색 (예: "ㅎㅇ"로 "할일" 검색)
        if (targetChosung.includes(normalizedQuery)) {
            return true;
        }
    }

    return false;
}

/**
 * 위젯 검색 함수
 * label, description, keywords 필드를 모두 검색
 */
export function searchWidget(query: string, widget: { label: string; description?: string; keywords?: string[] }): boolean {
    if (!query) return true; // 검색어가 없으면 모두 표시

    // label 검색
    if (fuzzyMatch(query, widget.label)) {
        return true;
    }

    // description 검색
    if (widget.description && fuzzyMatch(query, widget.description)) {
        return true;
    }

    // keywords 검색
    if (widget.keywords && Array.isArray(widget.keywords)) {
        for (const keyword of widget.keywords) {
            if (fuzzyMatch(query, keyword)) {
                return true;
            }
        }
    }

    return false;
}
