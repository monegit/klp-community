import { QueryDocumentSnapshot } from "firebase/firestore";

import { fetchPost, fetchPosts } from "@/services/post";
import {
  fetchUserProfileById,
  fetchUserProfileImagesByIds,
} from "@/services/user";
import { PostResponse } from "@/types/post";
import { UserProfile } from "@/types/user";

type PagedPosts = {
  posts: PostResponse[];
  lastPost?: QueryDocumentSnapshot<PostResponse>;
  limit: number;
};

let _postCache: PagedPosts | null = null;

export const usePost = () => {
  const getPosts = async (postLimit: number = 10): Promise<PagedPosts> => {
    try {
      const response = await fetchPosts(undefined, postLimit);

      console.log("Fetched posts:", response?.docs[0].id);
      if (!response || response.empty) {
        _postCache = {
          posts: [],
          lastPost: undefined,
          limit: postLimit,
        };
        return _postCache;
      }

      const basePosts: PostResponse[] = response.docs.map((post) => {
        const data = post.data();
        return {
          postId: post.id,
          userId: data.userId || "",
          title: data.title || "",
          content: data.content || "",
          images: data.images || [],
          createdAt: data.createdAt || "",
          comments: data.comments || [],
        };
      });

      const usersMap: Record<string, UserProfile> =
        await fetchUserProfileImagesByIds(basePosts.map((post) => post.userId));

      const posts = basePosts.map((post) => ({
        ...post,
        nickname: usersMap[post.userId]?.nickname || "",
        profileImageURL: usersMap[post.userId]?.profileImageURL || "",
      }));

      const lastPost = response.docs[response.docs.length - 1] as
        | QueryDocumentSnapshot<PostResponse>
        | undefined;

      _postCache = {
        posts,
        lastPost,
        limit: postLimit,
      };

      return {
        posts,
        lastPost,
        limit: postLimit,
      };
    } catch (error) {
      console.error("Error fetching posts:", error);
      return {
        posts: [],
        lastPost: undefined,
        limit: postLimit,
      };
    }
  };

  const getNextPosts = async (
    lastPost: QueryDocumentSnapshot<PostResponse>,
    postLimit: number = 10
  ): Promise<PagedPosts> => {
    if (!lastPost)
      return {
        posts: [],
        lastPost: undefined,
        limit: postLimit,
      };

    try {
      const response = await fetchPosts(lastPost, postLimit);

      if (!response)
        return {
          posts: [],
          lastPost: undefined,
          limit: postLimit,
        };

      const basePosts = response.docs.map<PostResponse>((post) => {
        return {
          postId: post.id,
          userId: post.data().userId || "",
          title: post.data().title || "",
          content: post.data().content || "",
          images: post.data().images || [],
          createdAt: post.data().createdAt || "",
          comments: post.data().comments || [],
        };
      });
      const usersMap: Record<string, UserProfile> =
        await fetchUserProfileImagesByIds(basePosts.map((post) => post.userId));

      const newPosts = basePosts.map((post) => ({
        ...post,
        nickname: usersMap[post.userId]?.nickname || "",
        profileImageURL: usersMap[post.userId]?.profileImageURL || "",
      }));
      const newLastPost = response.docs[
        response.docs.length - 1
      ] as QueryDocumentSnapshot<PostResponse>;

      if (_postCache) {
        const seenIds = new Set(_postCache.posts.map((post) => post.postId));
        const mergedIds = [
          ..._postCache.posts,
          ...newPosts.filter((post) => !seenIds.has(post.postId)),
        ];

        _postCache.posts = mergedIds;
        _postCache.lastPost = newLastPost;
      } else {
        _postCache = {
          posts: newPosts,
          lastPost: newLastPost,
          limit: postLimit,
        };
      }

      return {
        posts: newPosts,
        lastPost: newLastPost,
        limit: postLimit,
      };
    } catch (error) {
      console.error("Error fetching next posts:", error);
      return {
        posts: [],
        lastPost: undefined,
        limit: postLimit,
      };
    }
  };

  const getPostDetail = async (postId: string) => {
    const response = await fetchPost(postId);

    try {
      if (response?.userId) {
        const user = await fetchUserProfileById(response.userId);

        const post: PostResponse = {
          postId: response.postId,
          userId: response.userId || "",
          title: response.title || "",
          content: response.content || "",
          images: response.images || [],
          createdAt: response.createdAt || "",
          comments: response.comments || [],
        };

        return { user, post };
      }
    } catch (error) {
      console.error("Error fetching user profile for post:", error);

      return {
        user: null,
        post: null,
      };
    }
  };

  return { getPosts, getNextPosts, getPostDetail };
};
