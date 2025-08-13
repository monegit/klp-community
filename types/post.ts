export interface PostRequest {
  userId: string;
  createdAt: string;

  title: string;
  content: string;
  images: string[];
  nickname?: string;
  profileImageURL?: string;
}

export interface PostResponse {
  postId: string;
  userId: string;
  createdAt: string;

  title: string;
  content: string;
  images: string[];

  comments: string[];

  nickname?: string;
  profileImageURL?: string;
}

export interface ImageItem {
  uri: string;
  remote?: boolean;
}
