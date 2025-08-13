import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { usePost } from "@/hooks/usePost";
import { fetchPostDelete } from "@/services/post";
import { usePostDetail } from "./_hooks/usePostDetail";

export default function PostDetailScreen() {
  const { getPostDetail } = usePost();
  const {
    onPostDetailLoad,
    userData,
    postData,
    onCommentSubmit,
    comments,
    refreshComments,
  } = usePostDetail();

  const { postId, rev } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false); // 전체 화면 로딩
  const [commentsRefreshing, setCommentsRefreshing] = useState(false); // 댓글 갱신 로딩
  const [commentInput, setCommentInput] = useState("");
  const [sending, setSending] = useState(false);

  const isOwner = !!user && !!postData && user.uid === postData.userId;
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!postId) return;
    onPostDetailLoad(postId as string);
  }, []);

  useEffect(() => {
    if (!postId) return;
    refreshComments(postId as string);
  }, [postId]);

  useEffect(() => {
    if (postData?.images?.length) {
      Image.prefetch(postData.images.slice(0, 3)); // 처음 3개만 프리패치
    }
  }, [postData?.images]);

  useEffect(() => {
    getPostDetail(postId as string);
  }, []);

  const formatCreatedAt = (input: any): string => {
    if (!input) return "";
    // Firestore Timestamp 형태 처리
    if (typeof input?.toDate === "function") {
      try {
        return input.toDate().toLocaleString();
      } catch {}
    }
    if (typeof input?.seconds === "number") {
      return new Date(input.seconds * 1000).toLocaleString();
    }
    if (input instanceof Date) {
      return input.toLocaleString();
    }
    if (typeof input === "string" || typeof input === "number") {
      const d = new Date(input);
      return isNaN(d.getTime()) ? String(input) : d.toLocaleString();
    }
    return "";
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

  if (!postData) {
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

  const onDelete = () => {
    if (!postId || !isOwner || deleting) return;
    Alert.alert("삭제", "정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            setDeleting(true);
            await fetchPostDelete(postId as string);
            Alert.alert("완료", "삭제되었습니다.");
            router.back();
          } catch {
            Alert.alert("오류", "삭제 중 문제가 발생했습니다.");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={commentsRefreshing}
            onRefresh={() => refreshComments(postId as string)}
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
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 20, fontWeight: "600", color: Colors.text }}
              numberOfLines={2}
            >
              {postData.title}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 6,
              }}
            >
              {userData?.profileImageURL ? (
                <Image
                  source={{ uri: userData.profileImageURL }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: Colors.avatarPlaceholder,
                    marginRight: 8,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: Colors.avatarPlaceholder,
                    marginRight: 8,
                  }}
                />
              )}
              <Text style={{ color: Colors.subText, fontSize: 12 }}>
                {userData?.nickname ? `${userData.nickname} · ` : ""}
                {formatCreatedAt(postData.createdAt)}
              </Text>
            </View>
          </View>
          {isOwner && (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                onPress={goEditPage}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: Colors.primary,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 12 }}>수정</Text>
              </Pressable>
              <Pressable
                onPress={onDelete}
                disabled={deleting}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: deleting ? "#ccc" : Colors.danger,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 12 }}>
                  {deleting ? "삭제중" : "삭제"}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
        {/* 상단으로 이동했으므로 제거 */}
        <Text style={{ fontSize: 14, lineHeight: 20, color: Colors.text }}>
          {postData.content}
        </Text>
        {!!postData.images.length && (
          <View style={{ gap: 12 }}>
            {postData.images.map((url) => (
              <Image
                key={url}
                source={{ uri: url }}
                style={{
                  width: "100%",
                  height: 220,
                  borderRadius: 8,
                  backgroundColor: Colors.cardBg,
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
            borderTopColor: Colors.divider,
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
            <Text style={{ fontWeight: "600", color: Colors.text }}>
              댓글 {comments.length}
            </Text>
            <Pressable
              onPress={() => refreshComments(postId as string)}
              disabled={commentsRefreshing}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: commentsRefreshing ? "#ccc" : Colors.primary,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12 }}>
                {commentsRefreshing ? "갱신중..." : "새로고침"}
              </Text>
            </Pressable>
          </View>
          {comments.map((comment) => (
            <View
              key={comment.commentId}
              style={{
                flexDirection: "row",
                gap: 10,
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: Colors.divider,
              }}
            >
              {comment.profileImageURL ? (
                <Image
                  source={{ uri: comment.profileImageURL }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: Colors.avatarPlaceholder,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: Colors.avatarPlaceholder,
                  }}
                />
              )}
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "baseline",
                    gap: 6,
                  }}
                >
                  {!!comment.nickname && (
                    <Text style={{ fontSize: 12, color: Colors.subText }}>
                      {comment.nickname}
                    </Text>
                  )}
                  <Text style={{ fontSize: 10, color: Colors.muted }}>
                    {formatCreatedAt(comment.createdAt)}
                  </Text>
                </View>
                <Text
                  style={{ fontSize: 14, color: Colors.text, marginTop: 2 }}
                >
                  {comment.comment}
                </Text>
              </View>
            </View>
          ))}
          {comments.length === 0 && !commentsRefreshing && (
            <Text style={{ color: Colors.muted }}>첫 댓글을 남겨보세요.</Text>
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
          backgroundColor: Colors.cardBg,
          borderTopWidth: 1,
          borderTopColor: Colors.divider,
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
            borderColor: Colors.border,
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 8,
            backgroundColor: Colors.cardBg,
          }}
          multiline
        />
        <Pressable
          onPress={() => onCommentSubmit(postId as string)}
          disabled={!user || sending || !commentInput.trim()}
          style={{
            justifyContent: "center",
            paddingHorizontal: 16,
            backgroundColor:
              !user || sending || !commentInput.trim()
                ? "#ccc"
                : Colors.primary,
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
