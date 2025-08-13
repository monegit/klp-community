import { UserProfile } from "./user";

export interface Comment extends UserProfile {
  commentId: string;
  postId: string;
  userId: string;
  comment: string;
  createdAt: string;
}

export interface CreateCommentRequest {
  postId: string;
  userId: string;
  comment: string;
  userNickname?: string;
  userProfileImageURL?: string;
}
