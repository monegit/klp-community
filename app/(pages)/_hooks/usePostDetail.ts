import { useState } from "react";

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

  const [comments, setComments] = useState<Comment[]>([]);

  const onPostDetailLoad = async (userId: string) => {
    const response = await getPostDetail(userId);

    if (!response) {
      setUserData(null);
      setPostData(null);
    }

    setUserData(response?.user || null);
    setPostData(response?.post || null);
  };

  const onCommentSubmit = async (comment: string) => {
    if (!user || !comment.trim() || !postData?.postId) return;

    try {
      await postComment(user.uid, postData.postId, comment.trim());
    } catch (error) {
      console.log("Error posting comment:", error);
    }
  };

  const refreshComments = async (postId: string) => {
    if (!postId) return [];

    const response = await getComments(postId);
    const userIds = response.map((comment) => comment.userId);

    const userProfiles = await fetchUserProfilesByIds(userIds);

    const comments = response.map((comment) => ({
      ...comment,
      ...userProfiles[comment.userId],
    }));

    setComments(comments);

    return comments;
  };

  const onPostUpdate = async () => {};

  return {
    userData,
    postData,
    onPostDetailLoad,
    onCommentSubmit,
    comments,
    refreshComments,
  };
};
