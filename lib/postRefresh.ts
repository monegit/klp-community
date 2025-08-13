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
