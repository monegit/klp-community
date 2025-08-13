export interface PostRequest {
  userId: string;
  createdAt: string;

  title: string;
  content: string;
  images: string[];
  nickname?: string; // 작성 시 캐싱(선택)
  profileImageURL?: string; // 작성자 프로필 이미지 캐싱
}

export interface PostResponse {
  postId: string;
  userId: string;
  createdAt: string;

  title: string;
  content: string;
  images: string[];

  comments: string[];
  nickname?: string; // Firestore 문서에 캐싱된 작성자 닉네임
  profileImageURL?: string; // 캐싱된 작성자 프로필 이미지
}
