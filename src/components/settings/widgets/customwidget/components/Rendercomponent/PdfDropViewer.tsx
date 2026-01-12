import React, { useEffect, useState, useRef } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { dropPlugin } from '@react-pdf-viewer/drop';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { Upload, FileText, Trash2 } from 'lucide-react';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/drop/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';

type Props = {
    content?: any;
    onUpdate?: (patch: any) => void;
    height?: number | string;
};

// 최대 저장 가능 크기 (2MB)
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function PdfDropViewer({ content, onUpdate, height = '100%' }: Props) {
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const drop = dropPlugin();
    const zoomPluginInstance = zoomPlugin();
    const pageNavigationPluginInstance = pageNavigationPlugin();

    // 플러그인에서 컴포넌트 추출
    const { ZoomIn, ZoomOut } = zoomPluginInstance;
    const { GoToNextPage, GoToPreviousPage } = pageNavigationPluginInstance;

    // 1. 초기 로드: 저장된 데이터가 있으면 복원
    useEffect(() => {
        if (content?.fileData) {
            setFileUrl(content.fileData);
            setFileName(content.fileName || 'Document.pdf');
        }
    }, [content?.fileData]);

    // blob URL 정리
    useEffect(() => {
        return () => {
            if (fileUrl?.startsWith('blob:')) URL.revokeObjectURL(fileUrl);
        };
    }, [fileUrl]);

    // 파일 처리 함수
    const processFile = (file: File) => {
        if (file.type !== 'application/pdf') {
            alert('PDF 파일만 업로드할 수 있습니다.');
            return;
        }

        // 1. 뷰어에 즉시 표시 (Blob URL)
        const nextUrl = URL.createObjectURL(file);
        setFileUrl((prev) => {
            if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
            return nextUrl;
        });
        setFileName(file.name);

        // 2. 저장 로직 (크기 체크)
        if (file.size > MAX_FILE_SIZE_BYTES) {
            // 크면 저장 안 함 (경고)
            alert(`파일이 너무 커서(${Math.round(file.size / 1024 / 1024)}MB) 저장되지 않습니다. (최대 ${MAX_FILE_SIZE_MB}MB)\n새로고침하면 사라집니다.`);
            // 기존 데이터 날리기 (혹은 유지? 여기선 날리는 게 맞음, 새 파일이 왔으니)
            if (onUpdate) onUpdate({ fileData: null, fileName: null });
        } else {
            // 작으면 Base64 변환 후 저장
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target?.result as string;
                if (onUpdate) onUpdate({ fileData: base64, fileName: file.name });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const onDropCapture = (e: React.DragEvent) => {
        const f = e.dataTransfer.files?.[0];
        if (f) {
            processFile(f);
        }
    };

    const clearFile = () => {
        setFileUrl(null);
        setFileName(null);
        if (onUpdate) onUpdate({ fileData: null, fileName: null });
    };

    return (
        <div
            onDropCapture={onDropCapture}
            style={{ height }}
            className="w-full h-full flex flex-col relative bg-white border border-gray-200 rounded-xl overflow-hidden group"
        >
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                {fileUrl ? (
                    <div className="flex-1 w-full h-full overflow-hidden relative">
                        {/* 뷰어 영역 */}
                        <div className="w-full h-full">
                            <Viewer fileUrl={fileUrl} plugins={[drop, zoomPluginInstance, pageNavigationPluginInstance]} />
                        </div>

                        {/* 🌟 [플로팅 컨트롤] 마우스 오버 시 표시 */}
                        <div className="absolute top-4 right-4 flex flex-col gap-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">

                            {/* 1. 파일 관리 */}
                            <div className="flex flex-col gap-1 bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-sm rounded-lg p-1.5 text-gray-600">
                                <button
                                    onClick={() => inputRef.current?.click()}
                                    className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 rounded transition-colors"
                                    title={fileName || "PDF 변경"}
                                >
                                    <Upload size={16} />
                                </button>
                                <button
                                    onClick={clearFile}
                                    className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded transition-colors"
                                    title="삭제"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* 2. 네비게이션 & 줌 (통합) */}
                            <div className="flex flex-col gap-1 bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-sm rounded-lg p-1.5 text-gray-600">
                                <GoToPreviousPage>
                                    {(props: any) => (
                                        <button
                                            onClick={props.onClick}
                                            disabled={props.isDisabled}
                                            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                            title="이전 페이지"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                                        </button>
                                    )}
                                </GoToPreviousPage>
                                <GoToNextPage>
                                    {(props: any) => (
                                        <button
                                            onClick={props.onClick}
                                            disabled={props.isDisabled}
                                            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                            title="다음 페이지"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                        </button>
                                    )}
                                </GoToNextPage>
                                <div className="h-px bg-gray-200 my-0.5" />
                                <ZoomIn>
                                    {(props: any) => (
                                        <button
                                            onClick={props.onClick}
                                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                            title="확대"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /><line x1="11" x2="11" y1="8" y2="14" /><line x1="8" x2="14" y1="11" y2="11" /></svg>
                                        </button>
                                    )}
                                </ZoomIn>
                                <ZoomOut>
                                    {(props: any) => (
                                        <button
                                            onClick={props.onClick}
                                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                            title="축소"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /><line x1="8" x2="14" y1="11" y2="11" /></svg>
                                        </button>
                                    )}
                                </ZoomOut>
                            </div>
                        </div>
                    </div>
                ) : (
                    // 빈 상태: 업로드 버튼 표시
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 gap-3">
                        <div className="p-4 bg-white rounded-full shadow-sm">
                            <FileText size={32} className="text-gray-300" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">PDF 드롭 또는 선택</p>
                            <p className="text-xs text-gray-400 mt-1">최대 2MB 저장 가능</p>
                        </div>
                        <button
                            onClick={() => inputRef.current?.click()}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Upload size={14} />
                            파일 열기
                        </button>
                    </div>
                )}
            </Worker>

            {/* 숨겨진 파일 입력 */}
            <input
                type="file"
                ref={inputRef}
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
}
