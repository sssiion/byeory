# 프론트엔드 업데이트를 위한 AI 프롬프트 (최종본)

아래 내용을 복사해서 프론트엔드 작업을 수행하는 AI에게 전달하거나 개발자가 직접 참조하여 수정하세요.

---

## Task: 백엔드/프론트엔드 데이터 구조 동기화 및 API 업데이트

백엔드 로직 변경 및 DTO 변수명 통일 작업이 완료되었습니다. 프론트엔드 애플리케이션이 정상적으로 동작하기 위해 다음 사항들을 반드시 반영해야 합니다.

### 1. 핵심 변경 요약
1.  **변수명 통일**: 모든 해시태그 관련 필드명이 `hashtags`에서 **`tags`**로 변경되었습니다. (요청/응답 모두)
2.  **데이터 구조 확장**: 커뮤니티 조회 시 이제 게시글의 상세 내용(`blocks`, `stickers` 등)이 모두 포함됩니다.
3.  **검색 및 필터링 강화**: 해시태그 검색 파라미터(`hashtag`)와 내 글 조회 로직이 추가되었습니다.

### 2. Backend Data Structures for Frontend Alignment
(아래 인터페이스 구조를 프론트엔드 타입 정의 파일 `types.ts` 등에 그대로 적용하세요)

#### 2.1 공통 타입 (Common Types)
```typescript
// 블록 (텍스트, 이미지 등 본문 구성 요소)
interface Block {
  id: string;
  type: string; // "paragraph", "image", "video" 등
  text?: string;
  imageUrl?: string;
  imageUrl2?: string;
  imageRotation?: number;
  imageFit?: string;
  styles?: Record<string, any>;
}

// 스티커, 텍스트 메모, 자유 이미지 공통 타입
// 백엔드에서는 각각 stickers, floatingTexts, floatingImages 리스트로 전달됨
interface FloatingItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  zIndex: number;
  opacity: number;
  url?: string;     // 이미지/스티커 URL
  text?: string;    // 텍스트 메모 내용
  styles?: Record<string, any>;
}
```

#### 2.2 게시글 생성/수정 요청 (`PostRequest`)
*   **Endpoint**: `POST /api/posts`, `PUT /api/posts/{id}`
*   **변경점**: `hashtags` 필드 삭제, `tags` 필드 사용.

```typescript
interface PostRequest {
  title: string;
  titleStyles: Record<string, any>;
  
  // 상세 콘텐츠
  blocks: Block[];
  stickers: FloatingItem[];
  floatingTexts: FloatingItem[];
  floatingImages: FloatingItem[];
  
  tags: string[];           // [Changed] hashtags -> tags 필수로 사용
  mode: "AUTO" | "MANUAL";  // 저장 모드
  targetAlbumIds?: number[]; // MANUAL 모드 시 앨범 ID
  targetFolderIds?: number[]; // MANUAL 모드 시 폴더 ID (사용 시)
  
  isFavorite: boolean;
  isPublic: boolean;        // true일 경우 커뮤니티에 공개됨
}
```

#### 2.3 게시글 응답 (`PostResponse`, `CommunityPost`)
*   **Endpoint**: 
    *   내 게시글 목록: `GET /api/posts` (로그인 유저 기준)
    *   커뮤니티 목록: `GET /api/communities`
    *   커뮤니티 상세: `GET /api/communities/{postId}`
*   **변경점**: 상세 콘텐츠 필드 추가됨, `tags` 필드 사용, `hashtag` 검색 파라미터 사용.

```typescript
interface PostResponse { // 또는 CommunityPostResponse
  // 식별자
  id: number;          // Post ID
  communityId?: number; // Community ID (postId와 동일값, 하위 호환용)
  
  // 기본 정보
  title: string;
  titleStyles: Record<string, any>;
  writerNickname?: string; // 작성자 닉네임 (커뮤니티용)
  userId?: number;         // 작성자 ID (내 포스트용)
  
  // 통계 및 상태
  viewCount?: number;
  likeCount?: number;
  isPublic: boolean;
  isLiked?: boolean;       // 현재 유저의 좋아요 여부
  isFavorite?: boolean;    // 내 즐겨찾기 여부
  
  createdAt: string;
  updatedAt?: string;

  // 상세 콘텐츠 (전체 포함됨)
  blocks: Block[];
  stickers: FloatingItem[];
  floatingTexts: FloatingItem[];
  floatingImages: FloatingItem[];
  tags: string[]; // [Changed] hashtags -> tags
}
```

### 3. API 호출 로직 수정 가이드

1.  **커뮤니티 목록 검색 (Search)**
    *   해시태그로 검색하려면: `GET /api/communities?hashtag=검색어` (Query Param key: `hashtag`)
    *   **주의**: 검색할 때는 단수형 `hashtag` (백엔드 파라미터명), 데이터 구조상의 태그 목록은 `tags` 배열임. 두 가지가 다르니 주의.

2.  **내 포스트 목록 조회**
    *   `GET /api/posts` 호출 시 자동으로 **로그인한 유저의 게시글**만 반환됩니다. 
    *   별도의 `userId` 파라미터를 보낼 필요가 없습니다 (백엔드가 토큰에서 추출).

3.  **게시글 저장 (Save)**
    *   DB에 저장할 때 반드시 키값을 `tags`로 해서 문자열 배열 `["태그1", "태그2"]`를 보내야 합니다. `hashtags`로 보내면 저장되지 않습니다.

4.  **커뮤니티 상세 (Modal)**
    *   이제 `/api/communities/{postId}` 응답에 `blocks` 등이 포함되어 오므로, 별도의 API 호출 없이 바로 상세 뷰를 렌더링할 수 있습니다.
