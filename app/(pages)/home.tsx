import Post from "@/components/Post";
import { useAuth } from "@/contexts/AuthContext";
import { usePost } from "@/hooks/usePost";
import { PostResponse } from "@/types/post";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  RefreshControl,
  SafeAreaView,
  ScrollView,
} from "react-native";

export default function HomeScreen() {
  const { getPostList } = usePost();
  const [postItems, setPostItems] = useState<PostResponse[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const route = useRouter();

  const fetchPosts = useCallback(async () => {
    try {
      const posts = await getPostList(20);
      setPostItems(posts.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, [getPostList]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, [fetchPosts]);

  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {postItems.map((post) => (
          <Post
            key={post.postId}
            id={post.postId ?? ""}
            title={post.title}
            content={post.content}
            createdAt={post.createdAt ?? ""}
            images={post.images}
          />
        ))}
      </ScrollView>

      <Button
        title="작성"
        onPress={() => {
          if (!user) {
            Alert.alert(
              "로그인 필요",
              "게시물을 작성하려면 로그인해야 합니다."
            );
            return;
          }
          route.push("/post-write");
        }}
      />
    </SafeAreaView>
  );
}
