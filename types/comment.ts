export interface Comment {
  commentId: string;
  postId: string;
  userId: string;
  comment: string;
  createdAt: string;
  userNickname?: string;
  userPhotoURL?: string;
}

export interface CreateCommentRequest {
  postId: string;
  userId: string;
  comment: string;
  userNickname?: string;
  userPhotoURL?: string;
}
