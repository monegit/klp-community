export interface PostRequest {
  userId: string;
  createdAt: string;

  title: string;
  content: string;
  images: string[];
  userNickname?: string; // 작성 시 캐싱(선택)
  userPhotoURL?: string; // 작성자 프로필 이미지 캐싱
}

export interface PostResponse {
  postId: string;
  userId: string;
  createdAt: string;

  title: string;
  content: string;
  images: string[];

  comments: string[];
  userNickname?: string; // Firestore 문서에 캐싱된 작성자 닉네임
  userPhotoURL?: string; // 캐싱된 작성자 프로필 이미지
}
