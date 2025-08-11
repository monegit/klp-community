// 간단한 메모리 기반 게시글 더티 플래그 관리
// post-write 에서 수정/삭제 등 변경 후 markPostDirty 호출
// post-detail 화면은 focus 시 consumePostDirty 로 새로고침 여부 판단

const dirtyPosts = new Set<string>();

export function markPostDirty(postId: string) {
  dirtyPosts.add(postId);
}

export function consumePostDirty(postId: string) {
  if (dirtyPosts.has(postId)) {
    dirtyPosts.delete(postId);
    return true;
  }
  return false;
}
