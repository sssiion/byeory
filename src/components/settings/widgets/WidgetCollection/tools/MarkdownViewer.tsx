import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Pencil, Eye } from 'lucide-react';
import { useWidgetStorage } from '../SDK';

interface MarkdownViewerProps {
    initialContent?: string;
    title?: string;
}

export const MarkdownViewerConfig = {
    defaultSize: '2x2',
    validSizes: [[2, 2], [3, 2]] as [number, number][],
};

export function MarkdownViewer({ initialContent = "# Hello Markdown\n\n- Write\n- Your\n- Notes", title = "Markdown Note", gridSize }: MarkdownViewerProps & { gridSize?: { w: number; h: number } }) {
    const [content, setContent] = useWidgetStorage('widget-markdown-content', initialContent);
    const [isEditing, setIsEditing] = useState(false);

    // Save locally for now? Or just transient state.
    // For a widget, transient is expected unless we persist props update.
    // But widgets props update requires callback to parent layout.
    // Since we are inside the widget, let's allow "local" state.

    return (
        <div className="h-full flex flex-col theme-bg-card rounded-xl shadow-sm border theme-border overflow-hidden relative group">

            {/* Header / Toolbar */}
            <div className="flex items-center justify-between p-3 border-b theme-border bg-[var(--bg-card-secondary)]">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="ml-2 text-xs font-bold theme-text-secondary truncate max-w-[100px]">{title}</span>
                </div>

                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-1.5 rounded-lg hover:bg-black/5 theme-text-secondary hover:theme-text-primary transition-colors"
                >
                    {isEditing ? <Eye size={16} /> : <Pencil size={16} />}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {isEditing ? (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full p-4 resize-none outline-none theme-bg-card theme-text-primary font-mono text-sm leading-relaxed"
                        placeholder="Write markdown here..."
                        autoFocus
                    />
                ) : (
                    <div className="w-full h-full p-4 overflow-y-auto prose dark:prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}
