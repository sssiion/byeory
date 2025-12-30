import React, { useEffect, useMemo, useState } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { dropPlugin } from '@react-pdf-viewer/drop';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/drop/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

type Props = {
    height?: number | string;
};

export default function PdfDropViewer({ height = '100%' }: Props) {
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const drop = useMemo(() => dropPlugin(), []);
    const layout = useMemo(() => defaultLayoutPlugin(), []);

    // blob URL 정리
    useEffect(() => {
        return () => {
            if (fileUrl?.startsWith('blob:')) URL.revokeObjectURL(fileUrl);
        };
    }, [fileUrl]);

    const setFromFile = (file: File) => {
        if (file.type !== 'application/pdf') return;

        const nextUrl = URL.createObjectURL(file);
        setFileUrl((prev) => {
            if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
            return nextUrl;
        });
    };

    // dropPlugin은 내부적으로 드롭을 처리하지만,
    // “드롭 시 바로 우리가 상태를 바꾸는 UX”가 확실하도록 컨테이너에서도 한 번 더 받음
    const onDropCapture = (e: React.DragEvent) => {
        const f = e.dataTransfer.files?.[0];
        if (f) setFromFile(f);
    };

    return (
        <div
            onDropCapture={onDropCapture}
            style={{
                height,
                border: '1px solid rgba(0,0,0,.15)',
                borderRadius: 12,
                overflow: 'hidden',
                background: '#fff',
            }}
        >
            {/* react-pdf-viewer는 pdf.js worker를 지정하는 패턴을 사용합니다. [page:0] */}
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                {fileUrl ? (
                    <Viewer fileUrl={fileUrl} plugins={[drop, layout]} />
                ) : (
                    <div style={{ height: '100%' }}>
                        <Viewer
                            // 빈 상태에서도 dropPlugin이 동작할 수 있게 Viewer를 렌더
                            fileUrl=""
                            plugins={[drop, layout]}
                        />
                        <div style={{ padding: 16, color: '#666', fontSize: 13 }}>
                            PDF 파일을 여기로 드래그 앤 드롭하면 바로 열립니다.
                        </div>
                    </div>
                )}
            </Worker>
        </div>
    );
}
