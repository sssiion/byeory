import React, { useState, useEffect } from 'react';
import { Link, ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react';
import { EditableText } from '../EditableText';

interface LinkData {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
}

export default function LinkBookmarkWidget({ block, onUpdateBlock }: any) {
    const { content } = block;
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState(content.url || '');
    const [metaData, setMetaData] = useState<LinkData | null>(content.metaData || null);

    // URL 입력 핸들러
    const handleUrlSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue) return;

        setIsLoading(true);

        // TODO: 실제 메타데이터 페칭 로직
        // CORS 문제로 인해 클라이언트 사이드에서 직접 OG 태그를 긁어오는 건 제한적입니다.
        // 여기서는 임시로 URL을 파싱하거나, 가능하다면 백엔드 API를 통해 가져와야 합니다.
        // 일단은 입력된 URL을 기반으로 기본 구조만 잡습니다.

        // 시뮬레이션: 1초 후 더미 데이터 혹은 입력된 URL 기반 데이터 설정
        // 실제 구현 시에는 /api/meta-fetch?url=... 같은 엔드포인트가 필요함

        try {
            // URL 유효성 검사
            let validUrl = inputValue;
            if (!validUrl.startsWith('http')) {
                validUrl = `https://${validUrl}`;
            }

            // 임시 데이터 구조 (백엔드 연동 전)
            const newMeta: LinkData = {
                url: validUrl,
                title: validUrl, // 초기값은 URL
                description: 'No description available',
                siteName: new URL(validUrl).hostname
            };

            setMetaData(newMeta);
            onUpdateBlock(block.id, {
                content: {
                    ...content,
                    url: validUrl,
                    metaData: newMeta
                }
            });

        } catch (err) {
            console.error("Invalid URL", err);
        } finally {
            setIsLoading(false);
        }
    };

    // 메타데이터가 없는 경우 (초기 상태)
    if (!content.url && !metaData) {
        return (
            <div className="w-full h-full min-h-[120px] bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center p-4 gap-3">
                <div className="flex flex-col items-center gap-1 text-gray-400">
                    <Link size={24} />
                    <span className="text-xs font-medium">링크 북마크</span>
                </div>
                <form onSubmit={handleUrlSubmit} className="flex w-full max-w-sm gap-2">
                    <input
                        type="text"
                        placeholder="https://example.com"
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : '추가'}
                    </button>
                </form>
            </div>
        );
    }

    // 메타데이터가 있는 경우 (프리뷰 카드)
    const data = content.metaData || metaData || { url: content.url };

    return (
        <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block w-full h-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-indigo-300 transition-all flex flex-col md:flex-row no-underline"
            onClick={(e) => {
                // 편집 모드일 때 클릭 방지 로직이 필요할 수 있음
                // 여기서는 일단 링크 이동 허용
            }}
        >
            {/* 이미지 영역 (이미지가 있을 때만) */}
            {data.image ? (
                <div className="w-full md:w-1/3 h-48 md:h-auto bg-gray-100 flex-shrink-0 relative overflow-hidden">
                    <img
                        src={data.image}
                        alt={data.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            // 이미지 로드 실패 시 fallback
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>
            ) : (
                <div className="w-full md:w-32 h-32 md:h-auto bg-gray-50 flex-shrink-0 flex items-center justify-center text-gray-300">
                    <ImageIcon size={32} />
                </div>
            )}

            {/* 텍스트 영역 */}
            <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                        {data.title || data.url}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 md:line-clamp-3">
                        {data.description || 'No description'}
                    </p>
                </div>

                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 font-medium">
                    {data.siteName && (
                        <span className="flex items-center gap-1">
                            {/* 파비콘 (가능하다면) */}
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${new URL(data.url).hostname}&sz=32`}
                                alt=""
                                className="w-4 h-4 rounded-sm"
                            />
                            {data.siteName}
                        </span>
                    )}
                    <span className="flex items-center gap-1 ml-auto">
                        {new URL(data.url).hostname}
                        <ExternalLink size={10} />
                    </span>
                </div>
            </div>

            {/* 수정/삭제 버튼 (마우스 오버시에만 표시, 편집 모드 고려) */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // 초기화 (URL 재입력 모드로)
                        setMetaData(null);
                        onUpdateBlock(block.id, { content: { ...content, url: '', metaData: null } });
                    }}
                    className="p-1 bg-white/90 rounded text-gray-500 hover:text-red-500 shadow-sm border border-gray-200"
                    title="링크 수정"
                >
                    <Loader2 size={14} className="rotate-45" /> {/* 임시 아이콘 */}
                </button>
            </div>
        </a>
    );
}
