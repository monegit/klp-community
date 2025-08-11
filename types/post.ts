export interface PostRequest {
  userId: string;
  createdAt: string;

  title: string;
  content: string;
  images: string[];
}

export interface PostResponse {
  postId: string;
  userId: string;
  createdAt: string;

  title: string;
  content: string;
  images: string[];

  comments: string[];
}
