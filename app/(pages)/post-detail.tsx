import { TextInput } from "@/components/common/TextInput";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/common/Button";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { formatCreatedAt } from "@/lib/formatCreatedAt";
import { fetchPostDelete } from "@/services/post";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePostDetail } from "../../hooks/usePostDetail";

export default function PostDetailScreen() {
  const {
    onPostDetailLoad,
    userData,
    postData,
    handleSubmitComment,
    comments,
    commentInput,
    refreshComments,
    setCommentInput,
  } = usePostDetail();

  const insets = useSafeAreaInsets();
  const { postId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false); // 전체 화면 로딩
  const [commentsRefreshing, setCommentsRefreshing] = useState(false); // 댓글 갱신 로딩

  const isOwner = !!user && !!postData && user.uid === postData.userId;
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    onPostDetailLoad(postId as string);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!postId) return;
    setCommentsRefreshing(true);
    refreshComments(postId as string);
    setCommentsRefreshing(false);
  }, []);

  useEffect(() => {
    if (postData?.images?.length) {
      Image.prefetch(postData.images.slice(0, 3));
    }
  }, [postData?.images]);

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
              <Button title="수정" onPress={goEditPage} />
              <Button
                title={deleting ? "삭제중" : "삭제"}
                onPress={onDelete}
                disabled={deleting}
                variant="danger"
              />
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
          paddingBottom: insets.bottom,
          flexDirection: "row",
          gap: 8,
        }}
      >
        <View style={{ flex: 1, justifyContent: "center" }}>
          <TextInput
            value={commentInput}
            onChangeText={setCommentInput}
            placeholder={user ? "댓글 입력..." : "로그인 후 작성 가능"}
            multiline={false}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>
        <Button
          title="등록"
          onPress={() => handleSubmitComment(commentInput)}
          disabled={!user || !commentInput.trim()}
        />
      </View>
    </SafeAreaView>
  );
}
