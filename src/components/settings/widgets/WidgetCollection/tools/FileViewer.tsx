import React from 'react';
import { FileText, FileArchive, Upload, Eye } from 'lucide-react';
import { useWidgetStorage } from '../SDK';

export function FileViewer({ gridSize }: { gridSize?: { w: number; h: number } }) {
    // Persist mock file state
    const [fileState, setFileState] = useWidgetStorage('widget-file-viewer', { type: 'none' as 'pdf' | 'zip' | 'none', name: '' });

    // Derived state for compatibility
    const fileType = fileState.type;
    const fileName = fileState.name;

    const setFileType = (type: 'pdf' | 'zip' | 'none') => setFileState({ ...fileState, type });
    const setFileName = (name: string) => setFileState({ ...fileState, name });

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        // In a real implementation:
        // 1. Check file type
        // 2. If Zip -> Use JSZip to parse content
        // 3. If PDF -> Use iframe blob URL or react-pdf

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            setFileName(file.name);
            if (file.name.endsWith('.zip')) setFileType('zip');
            else if (file.name.endsWith('.pdf')) setFileType('pdf');
            else setFileType('none');
        }
    };

    return (
        <div
            className="h-full flex flex-col p-4 theme-bg-card rounded-xl shadow-sm border theme-border overflow-hidden"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            {fileType === 'none' ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg m-2">
                    <Upload size={24} className="mb-2" />
                    <span className="text-[10px] text-center px-4">
                        Drop PDF or Zip here<br />(Preview Only)
                    </span>
                </div>
            ) : (
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b theme-border">
                        {fileType === 'pdf' ? <FileText size={16} className="text-red-500" /> : <FileArchive size={16} className="text-yellow-500" />}
                        <span className="text-xs font-bold theme-text-primary truncate">{fileName}</span>
                    </div>

                    <div className="flex-1 flex items-center justify-center bg-gray-50 rounded">
                        {fileType === 'pdf' ? (
                            <div className="text-center">
                                <Eye size={32} className="mx-auto text-gray-400 mb-2" />
                                <span className="text-[10px] text-gray-500">PDF Preview Placeholder</span>
                            </div>
                        ) : (
                            <div className="w-full h-full p-2 overflow-y-auto">
                                <div className="text-[10px] font-mono text-gray-600">
                                    {/* Mock Zip Content */}
                                    📁 src/<br />
                                    ├── 📄 index.ts<br />
                                    └── 📄 style.css<br />
                                    📄 package.json<br />
                                    📄 README.md
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setFileState({ type: 'none', name: '' })}
                        className="mt-2 text-[10px] text-red-500 hover:underline text-center"
                    >
                        Close / Clear
                    </button>
                </div>
            )}
        </div>
    );
}
