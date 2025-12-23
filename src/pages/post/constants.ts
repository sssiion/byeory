export const STICKERS = [
    'https://cdn-icons-png.flaticon.com/512/833/833472.png', // 하트
    'https://cdn-icons-png.flaticon.com/512/1828/1828884.png', // 별
    'https://cdn-icons-png.flaticon.com/512/785/785116.png', // 불
    'https://cdn-icons-png.flaticon.com/512/346/346167.png', // 꽃
];

// 레이아웃별로 '어떤 블록을 어떤 순서로 배치할지' 미리 정해둡니다.
export const LAYOUT_PRESETS = [
    {
        id: 'type-a',
        name: '📷 밸런스형 (기본)',
        description: '사진과 글이 적절히 섞인 가장 무난한 구성',
        structure: [
            { type: 'image-full', text: '' },   // 1. 대문 사진 + 제목 느낌
            { type: 'paragraph', text: '' },    // 2. 도입부 글
            { type: 'image-double', text: '' }, // 3. 사진 2장 나란히 + 설명
            { type: 'paragraph', text: '' }     // 4. 마무리 글
        ]
    },
    {
        id: 'type-b',
        name: '📖 매거진형 (지그재그)',
        description: '왼쪽, 오른쪽 사진이 교차되는 잡지 스타일',
        structure: [
            { type: 'image-left', text: '' },   // 1. 사진(좌) - 글(우)
            { type: 'image-right', text: '' },  // 2. 글(좌) - 사진(우)
            { type: 'image-left', text: '' },   // 3. 사진(좌) - 글(우)
            { type: 'paragraph', text: '' }     // 4. 짧은 마무리
        ]
    },
    {
        id: 'type-c',
        name: '🖼️ 앨범형 (사진 위주)',
        description: '글보다는 사진을 많이 보여주고 싶을 때',
        structure: [
            { type: 'image-double', text: '' }, // 1. 사진 2장
            { type: 'image-double', text: '' }, // 2. 사진 2장
            { type: 'image-full', text: '' },   // 3. 큰 사진 1장
            { type: 'paragraph', text: '' }     // 4. 전체적인 총평
        ]
    },
    {
        id: 'type-d',
        name: '📝 에세이형 (글 위주)',
        description: '차분하게 글을 많이 쓰고 싶을 때',
        structure: [
            { type: 'paragraph', text: '' },    // 1. 긴 글
            { type: 'paragraph', text: '' },    // 2. 긴 글
            { type: 'image-full', text: '' },   // 3. 중간 환기용 사진
            { type: 'paragraph', text: '' }     // 4. 마무리 글
        ]
    }
];