import type { PostData } from '../types';

/**
 * Counts posts for a specific album using strict filtering logic matching key API behavior.
 * @param albumId Target Album ID
 * @param albumTag Target Album Auto-Tag (optional)
 * @param allPosts All available posts
 * @returns Number of posts in this album
 */
export const countAlbumPosts = (albumId: string, albumTag: string | null | undefined, allPosts: PostData[]): number => {
    // Logic must match api.fetchAlbumContents
    return allPosts.filter(p => {
        const isManualMatch = p.albumIds && p.albumIds.includes(albumId);
        const isAutoMatch = albumTag && p.tags && p.tags.includes(albumTag);
        return isManualMatch || isAutoMatch;
    }).length;
};

/**
 * Counts unclassified posts.
 * Strict Rule: No Album IDs AND No Tags.
 * @param allPosts All available posts
 * @returns Number of unclassified posts
 */
export const countUnclassifiedPosts = (allPosts: PostData[]): number => {
    return allPosts.filter(p => {
        const hasManualAlbum = p.albumIds && p.albumIds.length > 0;
        const hasTags = p.tags && p.tags.length > 0;
        return !hasManualAlbum && !hasTags;
    }).length;
};
