import Post from "@/components/Post";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { usePost } from "@/hooks/usePost";
import { PostResponse } from "@/types/post";
import { useRouter } from "expo-router";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  const { getPostList, getNextPostList } = usePost();
  const [postItems, setPostItems] = useState<PostResponse[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [pageSize, setPageSize] = useState<number>(20);
  const [lastDoc, setLastDoc] = useState<
    QueryDocumentSnapshot<DocumentData> | undefined
  >(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const { user, profile } = useAuth();
  const route = useRouter();

  const fetchPosts = useCallback(async () => {
    try {
      const result = await getPostList(pageSize);
      setPostItems(result.posts);
      setLastDoc(result.lastDoc as any);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, [getPostList, pageSize]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, [fetchPosts]);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    if (!lastDoc) return; // 더 불러올 글 없음
    try {
      setLoadingMore(true);
      const { posts: nextPosts, lastDoc: newLast } = await getNextPostList(
        lastDoc,
    pageSize
      );
      if (nextPosts.length) {
        setPostItems((prev) => {
          const existing = new Set(prev.map((p) => p.postId));
          const merged = [...prev];
          for (const p of nextPosts)
            if (!existing.has(p.postId)) merged.push(p);
          return merged;
        });
      }
      setLastDoc(newLast as any);
    } catch (e) {
      console.warn("더 불러오기 실패", e);
    } finally {
      setLoadingMore(false);
    }
  }, [lastDoc, loadingMore, getNextPostList, pageSize]);

  const Header = (
    <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
      <Pressable
        onPress={() => {
          if (!user) {
            Alert.alert(
              "로그인 필요",
              "프로필을 수정하려면 로그인해야 합니다."
            );
            return;
          }
          route.push("/profile-edit");
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          paddingVertical: 4,
        }}
      >
        {profile?.photoURL ? (
          <Image
            source={{ uri: profile.photoURL }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: Colors.avatarPlaceholder,
            }}
          />
        ) : (
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: Colors.avatarPlaceholder,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: Colors.subText, fontSize: 12 }}>프로필</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.text }}>
            {profile?.nickname || (user ? "닉네임 없음" : "게스트")}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.primary, marginTop: 4 }}>
            {user ? "프로필 수정 →" : "로그인 후 프로필 설정"}
          </Text>
        </View>
      </Pressable>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <Text style={{ color: Colors.subText, fontSize: 12 }}>표시 개수:</Text>
        {[10, 20, 50].map((n) => (
          <Pressable
            key={n}
            onPress={() => setPageSize(n)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: n === pageSize ? Colors.primary : Colors.border,
              backgroundColor: n === pageSize ? Colors.primary : 'transparent',
            }}
          >
            <Text style={{ fontSize: 12, color: n === pageSize ? '#fff' : Colors.text }}>{n}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const Footer = (
    <View style={{ padding: 16 }}>
      {loadingMore && (
        <View style={{ paddingVertical: 8 }}>
          <ActivityIndicator />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ backgroundColor: Colors.bg, flex: 1 }}>
      <FlatList
        data={postItems}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <Post
              id={item.postId}
              title={item.title}
              content={item.content}
              createdAt={item.createdAt}
              images={item.images}
              userNickname={item.userNickname}
              userPhotoURL={item.userPhotoURL}
            />
          </View>
        )}
        keyExtractor={(item) => item.postId}
        ListHeaderComponent={Header}
        ListFooterComponent={Footer}
        contentContainerStyle={{ paddingBottom: 120, gap: 0 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReachedThreshold={0.5}
        onEndReached={loadMore}
      />
      {/* 하단 플로팅 작성 버튼 */}
      <Pressable
        onPress={() => {
          if (!user) {
            Alert.alert("로그인 필요", "게시물을 작성하려면 로그인해야 합니다.");
            return;
          }
          route.push("/post-write");
        }}
        style={({ pressed }) => ({
          position: "absolute",
          right: 16,
          bottom: 24,
          backgroundColor: Colors.primary,
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          opacity: pressed ? 0.9 : 1,
          // 그림자
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        })}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>게시글 작성</Text>
      </Pressable>
    </SafeAreaView>
  );
}
