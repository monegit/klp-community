import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase.config";
import { usePost } from "@/hooks/usePost";
import { consumePostDirty } from "@/lib/postRefresh";
import { Comment } from "@/types/comment";
import { PostResponse } from "@/types/post";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function PostDetailScreen() {
  const { postId, rev } = useLocalSearchParams();
  const { addComment, getComments } = usePost();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState(true); // 전체 화면 로딩
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsRefreshing, setCommentsRefreshing] = useState(false); // 댓글 갱신 로딩
  const [commentInput, setCommentInput] = useState("");
  const [sending, setSending] = useState(false);
  // 소유자 여부
  const isOwner = !!user && !!post && user.uid === post.userId;

  // 댓글 새로고침 함수 (useCallback 제거로 의존성 루프 방지)
  const refreshComments = async () => {
    if (!postId) return;
    try {
      if (commentsRefreshing) return; // 중복 호출 방지
      setCommentsRefreshing(true);
      const list = await getComments(postId as string);
      setComments(list);
    } catch (e) {
      console.warn("댓글 로드 실패", e);
    } finally {
      setCommentsRefreshing(false);
    }
  };

  // 게시글 로드
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      try {
        const docRef = doc(db, "posts", postId as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<PostResponse> & {
            createdAt?: any;
          };
          const createdAtValue = (() => {
            const c = data.createdAt;
            if (!c) return "";
            if (typeof c === "string") return c;
            if (typeof c?.toDate === "function")
              return c.toDate().toISOString();
            if (c?.seconds) return new Date(c.seconds * 1000).toISOString();
            return String(c);
          })();
          const loaded: PostResponse = {
            postId: docSnap.id,
            userId: data.userId || "",
            title: data.title || "",
            content: data.content || "",
            images: data.images || [],
            createdAt: createdAtValue,
            comments: data.comments || [],
          };
          setPost(loaded);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId, rev]);

  // focus 될 때 더티 플래그 있으면 강제 재조회
  useFocusEffect(
    React.useCallback(() => {
      if (!postId) return;
      if (consumePostDirty(postId as string)) {
        (async () => {
          setLoading(true);
          try {
            const docRef = doc(db, "posts", postId as string);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data() as any;
              const c = data.createdAt;
              const createdAtValue = c?.toDate
                ? c.toDate().toISOString()
                : c?.seconds
                ? new Date(c.seconds * 1000).toISOString()
                : "";
              setPost({
                postId: docSnap.id,
                userId: data.userId || "",
                title: data.title || "",
                content: data.content || "",
                images: data.images || [],
                createdAt: createdAtValue,
                comments: data.comments || [],
              });
            }
          } catch (e) {
            console.warn("post refresh failed", e);
          } finally {
            setLoading(false);
          }
        })();
      }
    }, [postId])
  );

  // 최초 1회 댓글 로드 (postId 변경시에만)
  useEffect(() => {
    if (!postId) return;
    refreshComments();
    // getComments 참조 변화로 재호출되는 것을 막기 위해 의존성 최소화
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // 이미지 프리패치
  useEffect(() => {
    if (post?.images?.length) {
      Image.prefetch(post.images.slice(0, 3)); // 처음 3개만 프리패치
    }
  }, [post?.images]);

  const formatCreatedAt = (createdAt: string) => {
    if (!createdAt) return "";
    const d = new Date(createdAt);
    if (isNaN(d.getTime())) return createdAt;
    return d.toLocaleString();
  };

  const onSend = async () => {
    if (!user) return; // 로그인 필요
    if (!commentInput.trim()) return;
    if (!postId) return;
    try {
      setSending(true);
      await addComment({
        postId: postId as string,
        userId: user.uid,
        comment: commentInput.trim(),
      });
      setCommentInput("");
      // 작성 직후 수동 새로고침 (실시간 제거했으므로)
      refreshComments();
    } catch (e) {
      console.warn("댓글 등록 실패", e);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>로딩 중...</Text>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>게시글을 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  const goEditPage = () => {
    if (!postId) return;
    router.push({
      pathname: "/post-write",
      params: { postId: postId as string },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={commentsRefreshing}
            onRefresh={refreshComments}
          />
        }
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 120 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "600", flex: 1 }}>
            {post.title}
          </Text>
          {isOwner && (
            <Pressable
              onPress={goEditPage}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: "#007AFF",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12 }}>수정</Text>
            </Pressable>
          )}
        </View>
        <Text style={{ color: "#666", fontSize: 12 }}>
          {formatCreatedAt(post.createdAt)}
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 20 }}>{post.content}</Text>
        {!!post.images.length && (
          <View style={{ gap: 12 }}>
            {post.images.map((url) => (
              <Image
                key={url}
                source={{ uri: url }}
                style={{
                  width: "100%",
                  height: 220,
                  borderRadius: 8,
                  backgroundColor: "#eee",
                }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ))}
          </View>
        )}

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#ddd",
            paddingTop: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontWeight: "600" }}>댓글 {comments.length}</Text>
            <Pressable
              onPress={refreshComments}
              disabled={commentsRefreshing}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: commentsRefreshing ? "#ccc" : "#007AFF",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12 }}>
                {commentsRefreshing ? "갱신중..." : "새로고침"}
              </Text>
            </Pressable>
          </View>
          {comments.map((c) => (
            <View
              key={c.commentId}
              style={{
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
              }}
            >
              <Text style={{ fontSize: 14, color: "#333" }}>{c.comment}</Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "#999",
                  marginTop: 2,
                }}
              >
                {formatCreatedAt(c.createdAt)}
              </Text>
            </View>
          ))}
          {comments.length === 0 && !commentsRefreshing && (
            <Text style={{ color: "#888" }}>첫 댓글을 남겨보세요.</Text>
          )}
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: 12,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#eee",
          flexDirection: "row",
          gap: 8,
        }}
      >
        <TextInput
          value={commentInput}
          onChangeText={setCommentInput}
          placeholder={user ? "댓글 입력..." : "로그인 후 작성 가능"}
          editable={!!user && !sending}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 8,
            backgroundColor: "#fafafa",
          }}
          multiline
        />
        <Pressable
          onPress={onSend}
          disabled={!user || sending || !commentInput.trim()}
          style={{
            justifyContent: "center",
            paddingHorizontal: 16,
            backgroundColor:
              !user || sending || !commentInput.trim() ? "#ccc" : "#007AFF",
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            {sending ? "..." : "전송"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
