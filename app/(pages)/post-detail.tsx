import { Image, ImageStyle } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/common/Button";
import { TextInput } from "@/components/common/TextInput";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { formatCreatedAt } from "@/lib/formatCreatedAt";
import { fetchPostDelete } from "@/services/post";
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

  if (!postData) {
    return (
      <SafeAreaView style={styles.view.component_loading}>
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
    <SafeAreaView style={styles.view.component}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={commentsRefreshing}
            onRefresh={() => refreshComments(postId as string)}
          />
        }
        contentContainerStyle={styles.view.scrollView}
      >
        <View style={styles.view.contentView}>
          <View style={styles.view.header}>
            <Text style={styles.text.title} numberOfLines={2}>
              {postData.title}
            </Text>

            <View style={styles.view.profileImage}>
              {userData?.profileImageURL ? (
                <Image
                  source={{ uri: userData.profileImageURL }}
                  style={styles.image.profileImage}
                />
              ) : (
                <View style={styles.image.emptyProfileImage} />
              )}
              <Text style={styles.text.headerInfo}>
                {userData?.nickname ? `${userData.nickname} · ` : ""}
                {formatCreatedAt(postData.createdAt)}
              </Text>
            </View>
          </View>

          {isOwner && (
            <View style={styles.view.editableView}>
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

        <Text style={styles.text.content}>{postData.content}</Text>
        {!!postData.images.length && (
          <View style={{ gap: 12 }}>
            {postData.images.map((url) => (
              <Image
                key={url}
                source={{ uri: url }}
                style={styles.image.contentImage}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ))}
          </View>
        )}

        <View style={styles.view.commentView}>
          <View style={styles.view.commentViewHeader}>
            <Text style={{ fontWeight: "600", color: Colors.text }}>
              댓글 {comments.length}개
            </Text>
          </View>
          {comments.map((comment) => (
            <View key={comment.commentId} style={styles.view.comment}>
              {comment.profileImageURL ? (
                <Image
                  source={{ uri: comment.profileImageURL }}
                  style={styles.image.profileImage}
                />
              ) : (
                <View style={styles.image.emptyProfileImage} />
              )}

              <View style={{ flex: 1 }}>
                <View style={styles.view.commentInfo}>
                  {!!comment.nickname && (
                    <Text style={styles.text.commentInfo}>
                      {comment.nickname} {formatCreatedAt(comment.createdAt)}
                    </Text>
                  )}
                </View>
                <Text style={styles.text.comment}>{comment.comment}</Text>
              </View>
            </View>
          ))}
          {comments.length === 0 && !commentsRefreshing && (
            <Text style={{ color: Colors.muted }}>첫 댓글을 남겨보세요.</Text>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.view.commentInputContainer,
          { paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.view.commentInput}>
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

const styles = {
  view: StyleSheet.create({
    component: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    } as ViewStyle,

    component_loading: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors.backgroundColor,
    } as ViewStyle,

    scrollView: { padding: 16, gap: 16, paddingBottom: 120 } as ViewStyle,

    contentView: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    } as ViewStyle,

    header: { flex: 1 } as ViewStyle,

    profileImage: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
    } as ViewStyle,

    editableView: { flexDirection: "row", gap: 8 } as ViewStyle,

    commentView: {
      borderTopWidth: 1,
      borderTopColor: Colors.divider,
      paddingTop: 12,
    } as ViewStyle,

    commentViewHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    } as ViewStyle,

    comment: {
      flexDirection: "row",
      gap: 10,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: Colors.divider,
    } as ViewStyle,

    commentInfo: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 6,
    } as ViewStyle,

    commentInputContainer: {
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
    } as ViewStyle,

    commentInput: { flex: 1, justifyContent: "center" } as ViewStyle,
  }),

  text: StyleSheet.create({
    title: { fontSize: 20, fontWeight: "600", color: Colors.text } as TextStyle,

    headerInfo: { color: Colors.subText, fontSize: 12 } as TextStyle,

    content: { fontSize: 14, lineHeight: 20, color: Colors.text } as TextStyle,

    commentInfo: { fontSize: 12, color: Colors.subText } as TextStyle,

    comment: { fontSize: 14, color: Colors.text, marginTop: 2 } as TextStyle,
  }),

  image: StyleSheet.create({
    profileImage: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: Colors.avatarPlaceholder,
      marginRight: 8,
    } as ImageStyle,

    emptyProfileImage: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: Colors.avatarPlaceholder,
      marginRight: 8,
    } as ImageStyle,

    contentImage: {
      width: "100%",
      height: 220,
      borderRadius: 8,
      backgroundColor: Colors.cardBg,
    } as ImageStyle,
  }),
};
