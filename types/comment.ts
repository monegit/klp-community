export interface Comment {
  commentId: string;
  postId: string;
  userId: string;
  comment: string; // 댓글 내용
  createdAt: string; // ISO string
}

export interface CreateCommentRequest {
  postId: string;
  userId: string;
  comment: string;
}
