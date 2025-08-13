import { fetchComment, fetchCommentedList } from "@/services/post";
import { Comment } from "@/types/comment";

export const useComment = () => {
  const postComment = async (
    userId: string,
    postId: string,
    comment: string
  ) => {
    const request = await fetchComment({
      postId: postId,
      userId: userId,
      comment: comment,
    });

    if (!request) {
      throw new Error("댓글 작성에 실패했습니다.");
    }

    return request.id;
  };

  const getComments = async (postId: string): Promise<Comment[]> => {
    try {
      const response = await fetchCommentedList(postId);

      if (!response) {
        return [];
      }

      return response.docs.map((comment) => {
        const data = comment.data() as Comment;

        return {
          commentId: comment.id,
          postId: data.postId,
          userId: data.userId,
          comment: data.comment,
          createdAt: data.createdAt,
          nickname: data.profileImageURL,
          profileImageURL: data.profileImageURL,
        };
      });
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  };

  return { postComment, getComments };
};
