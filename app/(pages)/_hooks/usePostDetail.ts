import { useCallback, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useComment } from "@/hooks/useComment";
import { usePost } from "@/hooks/usePost";
import { fetchUserProfilesByIds } from "@/services/user";
import { Comment } from "@/types/comment";
import { PostResponse } from "@/types/post";
import { UserProfile } from "@/types/user";

export const usePostDetail = () => {
  const { user } = useAuth();
  const { getPostDetail } = usePost();
  const { postComment, getComments } = useComment();

  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [postData, setPostData] = useState<PostResponse | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  const onPostDetailLoad = async (postId: string) => {
    const response = await getPostDetail(postId);
    console.log(response);
    if (!response) {
      setUserData(null);
      setPostData(null);
    }

    setUserData(response?.user || null);
    setPostData(response?.post || null);
  };

  const handleSubmitComment = async (comment: string) => {
    if (!user || !comment.trim() || !postData?.postId) return;

    try {
      await postComment(user.uid, postData.postId, comment.trim());
      setCommentInput("");
      await refreshComments(postData.postId);
    } catch (error) {
      console.log("Error posting comment:", error);
    }
  };

  const refreshComments = useCallback(
    async (postId: string) => {
      if (!postId) return [];

      try {
        const response = await getComments(postId);

        if (response.length === 0) {
          setComments([]);
          return [];
        }

        const userIds = response.map((comment) => comment.userId);
        const userProfiles = await fetchUserProfilesByIds(userIds);

        const comments = response.map((comment) => ({
          ...comment,
          nickname: userProfiles[comment.userId]?.nickname || "익명",
          profileImageURL: userProfiles[comment.userId]?.profileImageURL || "",
        }));

        setComments(comments);

        return comments;
      } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
      }
    },
    [getComments]
  );

  return {
    userData,
    postData,
    onPostDetailLoad,
    handleSubmitComment,
    comments,
    refreshComments,
    commentInput,
    setCommentInput,
  };
};
