import React from 'react';

import { ChevronRight, type LucideIcon } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    icon?: LucideIcon;
    onClick?: () => void;
}

interface Props {
    items: BreadcrumbItem[];
    // Optional: Highlight the last item as a "badge" style or just text?
    // User asked for unification.
    // Let's keep it simple: List of links, last one is current page (text).
}

const PostBreadcrumb: React.FC<Props> = ({ items }) => {
    return (
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                const Icon = item.icon;

                return (
                    <React.Fragment key={index}>
                        {index > 0 && <ChevronRight size={14} className="text-[var(--text-tertiary)]" />}

                        {item.onClick && !isLast ? (
                            <button
                                onClick={item.onClick}
                                className="flex items-center gap-1 hover:text-[var(--text-primary)] hover:underline transition-colors"
                            >
                                {Icon && <Icon size={14} />}
                                {item.label}
                            </button>
                        ) : (
                            <div className={`flex items-center gap-1 font-semibold ${isLast ? 'text-[var(--text-primary)]' : ''}`}>
                                {Icon && <Icon size={14} className={isLast ? "text-indigo-500" : ""} />}
                                <span className="truncate max-w-[200px]">{item.label}</span>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default PostBreadcrumb;
