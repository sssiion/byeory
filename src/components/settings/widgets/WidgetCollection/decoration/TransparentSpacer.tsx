

// --- 10. Transparent Spacer (투명 위젯)
export const TransparentSpacerConfig = {
    defaultSize: '1x1',
    validSizes: [
        [1, 1], [1, 2], [1, 3], [1, 4],
        [2, 1], [2, 2], [2, 3], [2, 4],
        [3, 1], [3, 2], [3, 3], [3, 4],
        [4, 1], [4, 2], [4, 3], [4, 4]
    ] as [number, number][],
};

export function TransparentSpacer() {
    return <div className="w-full h-full"></div>;
}
