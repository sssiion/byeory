import { useMemo } from 'react';
import { Home, Folder, Book } from 'lucide-react';
import type { BreadcrumbItem } from '../components/PostBreadcrumb';

interface CustomAlbum {
    id: string;
    name: string;
    parentId?: string | null;
}

export const useBreadcrumbs = (
    currentId: string | null,
    customAlbums: CustomAlbum[],
    onNavigate: (id: string | null) => void,
    baseLabel: string = '내 앨범',
    disableLast: boolean = true // ✨ New param to control active state of last item
) => {
    return useMemo(() => {
        const items: BreadcrumbItem[] = [
            { id: null, label: baseLabel, icon: Home, onClick: () => onNavigate(null) }
        ];

        // ✨ Nest __others__ under __all__
        if (currentId === '__others__') {
            items.push({ id: '__all__', label: '모든 기록 보관함', icon: Folder, onClick: () => onNavigate('__all__') });
            // For __others__, it's a leaf node, so we respect disableLast
            items.push({
                id: '__others__',
                label: '미분류',
                icon: Folder,
                onClick: disableLast ? undefined : () => onNavigate('__others__')
            });
            return items;
        }

        if (currentId === '__all__') {
            items.push({
                id: '__all__',
                label: '모든 기록 보관함',
                icon: Folder,
                onClick: disableLast ? undefined : () => onNavigate('__all__')
            });
            return items;
        }

        if (!currentId) return items;

        const chain: CustomAlbum[] = [];
        let curr = customAlbums.find(a => String(a.id) === String(currentId));

        // Prevent infinite loops
        let depth = 0;
        while (curr && depth < 10) {
            chain.unshift(curr);
            if (!curr.parentId) break;
            curr = customAlbums.find(a => String(a.id) === String(curr!.parentId));
            depth++;
        }

        chain.forEach((album, index) => {
            // First item in chain (Root) gets Book icon, others get Folder icon
            const isRoot = !album.parentId;
            const isLast = index === chain.length - 1;

            items.push({
                id: album.id,
                label: album.name,
                icon: isRoot ? Book : Folder, // ✨ Specific Icon Logic
                onClick: (isLast && disableLast) ? undefined : () => onNavigate(album.id)
            });
        });

        return items;
    }, [currentId, customAlbums, onNavigate, baseLabel, disableLast]);
};
