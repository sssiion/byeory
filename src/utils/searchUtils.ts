/**
 * Utility functions for Korean Hangul processing
 */

const CHO_HANGUL = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

const HANGUL_START_CHAR = 0xac00;
const HANGUL_END_CHAR = 0xd7a3;

/**
 * Extracts the initial consonants (Chosung) from a Korean string.
 * Non-Korean characters are preserved as-is.
 * @param str Input string
 * @returns String containing only the initial consonants
 */
export function getChosung(str: string): string {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code >= HANGUL_START_CHAR && code <= HANGUL_END_CHAR) {
            const choIndex = Math.floor((code - HANGUL_START_CHAR) / 588);
            result += CHO_HANGUL[choIndex];
        } else {
            result += str.charAt(i);
        }
    }
    return result;
}

/**
 * Checks if the search query (potentially containing Chosung) matches the target string.
 * This performs:
 * 1. Standard includes check
 * 2. Chosung includes check
 * @param target The string to search inside (e.g., "할 일 목록")
 * @param query The search query (e.g., "ㅎㅇ")
 * @param options configuration options
 * @returns true if matched
 */
export function matchKoreanSearch(target: string, query: string, options: { useChosung?: boolean } = { useChosung: true }): boolean {
    // Normalize both (remove spaces, lower case)
    const nTarget = target.toLowerCase().replace(/\s+/g, '');
    const nQuery = query.toLowerCase().replace(/\s+/g, '');

    // 1. Exact/Substring match
    if (nTarget.includes(nQuery)) return true;

    // 2. Chosung match (Only if enabled)
    if (options.useChosung) {
        const targetChosung = getChosung(nTarget);
        if (targetChosung.includes(nQuery)) return true;
    }

    return false;
}
