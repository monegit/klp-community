import { Image, ImageStyle } from "expo-image";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { Button } from "@/components/common/Button";
import { TextInput } from "@/components/common/TextInput";
import { Colors } from "@/constants/Colors";
import { useProfileEdit } from "../../hooks/useProfileEdit";
// useFocusEffect 제거: 최초 1회만 로드하도록 변경

export default function ProfileEditScreen() {
  const {
    profile,
    nickname,
    setNickname,
    isSaveNickname,
    isUploading,
    myPosts,
    isLoadingPosts,
    onSaveNickname,
    pickProfileImage,
  } = useProfileEdit();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.view.scrollView}>
        <View style={styles.view.profileImage}>
          <Pressable
            onPress={pickProfileImage}
            disabled={isUploading}
            style={{ alignItems: "center" }}
          >
            {profile?.profileImageURL ? (
              <Image
                source={{ uri: profile.profileImageURL }}
                style={styles.image.profileImage}
              />
            ) : (
              <View style={styles.image.emptyProfileImage}>
                <Text style={{ color: Colors.subText }}>이미지</Text>
              </View>
            )}
            <Text
              style={[
                styles.text.profileImageUpload,
                { color: isUploading ? "#999" : "#007AFF" },
              ]}
            >
              {isUploading ? "업로드 중..." : "이미지 변경"}
            </Text>
          </Pressable>
        </View>

        <View style={{ gap: 8 }}>
          <TextInput
            label="닉네임"
            requiredMark
            value={nickname}
            onChangeText={setNickname}
            placeholder="닉네임 입력"
            editable={!isSaveNickname}
          />
          <Button
            title={isSaveNickname ? "저장 중..." : "닉네임 저장"}
            type="submit"
            onPress={onSaveNickname}
            disabled={isSaveNickname || !nickname.trim()}
          />
        </View>

        <View style={styles.view.myPostHeader}>
          <Text style={styles.text.myPostHeader}>
            내 게시글 ({myPosts.length})
          </Text>
          {isLoadingPosts && <ActivityIndicator />}
          {!isLoadingPosts &&
            myPosts.map((post) => (
              <View key={post.postId} style={styles.view.myPost}>
                <Text style={styles.text.myPostTitle}>{post.title}</Text>
                <Text numberOfLines={2} style={styles.text.myPostContent}>
                  {post.content}
                </Text>
              </View>
            ))}
          {!isLoadingPosts && myPosts.length === 0 && (
            <Text style={{ color: Colors.muted }}>
              작성한 게시글이 없습니다.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  view: StyleSheet.create({
    scrollView: { padding: 20, gap: 28 } as ViewStyle,

    profileImage: { alignItems: "center", gap: 12 } as ViewStyle,

    myPostHeader: { gap: 12 },

    myPost: {
      padding: 12,
      backgroundColor: "#f5f5f5",
      borderRadius: 8,
    } as ViewStyle,
  }),

  text: StyleSheet.create({
    profileImageUpload: { marginTop: 6, fontSize: 12 } as TextStyle,

    myPostHeader: { fontSize: 16, fontWeight: "600" } as TextStyle,

    myPostTitle: { fontWeight: "600" } as TextStyle,

    myPostContent: { fontSize: 12, color: Colors.subText, marginTop: 4 },
  }),

  image: StyleSheet.create({
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: Colors.avatarPlaceholder,
    } as ImageStyle,

    emptyProfileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "#ccc",
      alignItems: "center",
      justifyContent: "center",
    } as ImageStyle,
  }),

  button: StyleSheet.create({}),
};
