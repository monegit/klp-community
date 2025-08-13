import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useProfileEdit } from "./_hooks/useProfileEdit";
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
      <ScrollView contentContainerStyle={{ padding: 20, gap: 28 }}>
        <View style={{ alignItems: "center", gap: 12 }}>
          <Pressable
            onPress={pickProfileImage}
            disabled={isUploading}
            style={{ alignItems: "center" }}
          >
            {profile?.profileImageURL ? (
              <Image
                source={{ uri: profile.profileImageURL }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: "#ddd",
                }}
              />
            ) : (
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: "#ccc",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#666" }}>이미지</Text>
              </View>
            )}
            <Text
              style={{
                marginTop: 6,
                fontSize: 12,
                color: isUploading ? "#999" : "#007AFF",
              }}
            >
              {isUploading ? "업로드 중..." : "이미지 변경"}
            </Text>
          </Pressable>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: "600" }}>닉네임</Text>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            placeholder="닉네임 입력"
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
            editable={!isSaveNickname}
          />
          <Pressable
            onPress={onSaveNickname}
            disabled={isSaveNickname || !nickname.trim()}
            style={{
              backgroundColor:
                isSaveNickname || !nickname.trim() ? "#ccc" : "#34C759",
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              {isSaveNickname ? "저장 중..." : "닉네임 저장"}
            </Text>
          </Pressable>
        </View>

        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>
            내 게시글 ({myPosts.length})
          </Text>
          {isLoadingPosts && <ActivityIndicator />}
          {!isLoadingPosts &&
            myPosts.map((p) => (
              <View
                key={p.postId}
                style={{
                  padding: 12,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontWeight: "600" }}>{p.title}</Text>
                <Text
                  numberOfLines={2}
                  style={{ fontSize: 12, color: "#555", marginTop: 4 }}
                >
                  {p.content}
                </Text>
              </View>
            ))}
          {!isLoadingPosts && myPosts.length === 0 && (
            <Text style={{ color: "#888" }}>작성한 게시글이 없습니다.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
