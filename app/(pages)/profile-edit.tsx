import { useAuth } from "@/contexts/AuthContext";
import { usePost } from "@/hooks/usePost";
import { PostResponse } from "@/types/post";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
// useFocusEffect 제거: 최초 1회만 로드하도록 변경

export default function ProfileEditScreen() {
  const { profile, updateNickname, updateProfileImage, user } = useAuth();
  const { getPostList } = usePost();
  const [nickname, setNickname] = useState(profile?.nickname || "");
  const [savingNick, setSavingNick] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [myPosts, setMyPosts] = useState<PostResponse[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const loadMyPosts = useCallback(async () => {
    if (!user) return;
    setLoadingPosts(true);
    try {
      // 간단히 전체 50개 불러온 뒤 필터 (추후 쿼리 최적화 가능)
      const res = await getPostList(50, true);
      setMyPosts(res.posts.filter((p) => p.userId === user.uid));
    } catch (e) {
      console.warn("내 게시글 로드 실패", e);
    } finally {
      setLoadingPosts(false);
    }
  }, [user, getPostList]);

  const loadedRef = useRef(false);
  useEffect(() => {
    if (!user || loadedRef.current) return;
    loadedRef.current = true;
    loadMyPosts();
  }, [user, loadMyPosts]);

  const onSaveNickname = async () => {
    if (!nickname.trim()) return;
    try {
      setSavingNick(true);
      await updateNickname(nickname.trim());
      Alert.alert("완료", "닉네임이 변경되었습니다.");
    } catch (e: any) {
      Alert.alert("오류", e?.message || "닉네임 변경 실패");
    } finally {
      setSavingNick(false);
    }
  };

  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("권한 필요", "사진 접근 권한이 필요합니다.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      try {
        setUploading(true);
        await updateProfileImage(uri);
        Alert.alert("완료", "프로필 이미지가 업데이트되었습니다.");
      } catch (e: any) {
        Alert.alert("오류", e?.message || "업로드 실패");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 28 }}>
        <View style={{ alignItems: "center", gap: 12 }}>
          <Pressable
            onPress={pickProfileImage}
            disabled={uploading}
            style={{ alignItems: "center" }}
          >
            {profile?.photoURL ? (
              <Image
                source={{ uri: profile.photoURL }}
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
                color: uploading ? "#999" : "#007AFF",
              }}
            >
              {uploading ? "업로드 중..." : "이미지 변경"}
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
            editable={!savingNick}
          />
          <Pressable
            onPress={onSaveNickname}
            disabled={savingNick || !nickname.trim()}
            style={{
              backgroundColor:
                savingNick || !nickname.trim() ? "#ccc" : "#34C759",
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              {savingNick ? "저장 중..." : "닉네임 저장"}
            </Text>
          </Pressable>
        </View>

        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>
            내 게시글 ({myPosts.length})
          </Text>
          {loadingPosts && <ActivityIndicator />}
          {!loadingPosts &&
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
          {!loadingPosts && myPosts.length === 0 && (
            <Text style={{ color: "#888" }}>작성한 게시글이 없습니다.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
