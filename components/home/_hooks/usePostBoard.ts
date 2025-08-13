import { QueryDocumentSnapshot } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";

import { usePost } from "@/hooks/usePost";
import { PostResponse } from "@/types/post";

export const usePostBoard = (postLimit: number = 10) => {
  const { getPosts, getNextPosts } = usePost();

  const [isLoading, setIsLoading] = useState(false);
  const [lastPost, setLastPost] = useState<
    QueryDocumentSnapshot<PostResponse> | undefined
  >(undefined);
  const [postItems, setPostItems] = useState<PostResponse[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = useCallback(async () => {
    await fetchPosts();
  }, []);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await getPosts(postLimit);

      setPostItems(result.posts);
      setLastPost(result.lastPost);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getPosts, postLimit]);

  const fetchNextPosts = useCallback(async () => {
    if (isLoading || !lastPost) return;
    setIsLoading(true);

    try {
      const result = await getNextPosts(lastPost, postLimit);

      if (result.posts.length <= 0) {
        setLastPost(undefined);
        return;
      }

      setPostItems((prev) => {
        const existing = new Set(prev.map((post) => post.postId));
        const merged = [...prev];

        result.posts.forEach((post) => {
          if (!existing.has(post.postId)) merged.push(post);
        });

        return merged;
      });

      setLastPost(result.lastPost);
    } catch (error) {
      console.error("Error fetching next posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getNextPosts, isLoading, lastPost, postLimit]);

  const onEndReached = useCallback(async () => {
    if (isLoading || !lastPost) return;
    await fetchNextPosts();
  }, [fetchNextPosts, isLoading, lastPost]);

  return {
    isLoading,
    postItems,

    onRefresh,
    onEndReached,
  };
};
