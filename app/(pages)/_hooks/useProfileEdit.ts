import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { usePost } from "@/hooks/usePost";
import { PostResponse } from "@/types/post";

export const useProfileEdit = () => {
  const { profile, updateNickname, updateProfileImage, user } = useAuth();
  const { getPosts } = usePost();

  const [nickname, setNickname] = useState(profile?.nickname || "");
  const [isSaveNickname, setIsSaveNickname] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [myPosts, setMyPosts] = useState<PostResponse[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  const loadedRef = useRef(false);

  const loadMyPosts = useCallback(async () => {
    if (!user) return;

    setIsLoadingPosts(true);

    try {
      const res = await getPosts(20);

      setMyPosts(res.posts.filter((p) => p.userId === user.uid));
    } catch (e) {
      console.warn("내 게시글 로드 실패", e);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [user, getPosts]);

  useEffect(() => {
    if (!user || loadedRef.current) return;

    loadedRef.current = true;

    loadMyPosts();
  }, [user, loadMyPosts]);

  const onSaveNickname = useCallback(async () => {
    if (!nickname.trim()) return;

    try {
      setIsSaveNickname(true);

      await updateNickname(nickname.trim());

      Alert.alert("완료", "닉네임이 변경되었습니다.");
    } catch (e: any) {
      Alert.alert("오류", e?.message || "닉네임 변경 실패");
    } finally {
      setIsSaveNickname(false);
    }
  }, [nickname, updateNickname]);

  const pickProfileImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("권한 필요", "사진 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;

      try {
        setIsUploading(true);

        await updateProfileImage(uri);

        Alert.alert("완료", "프로필 이미지가 업데이트되었습니다.");
      } catch (e: any) {
        Alert.alert("오류", e?.message || "업로드 실패");
      } finally {
        setIsUploading(false);
      }
    }
  }, [updateProfileImage]);

  return {
    profile,
    nickname,
    setNickname,
    isSaveNickname,
    isUploading,
    myPosts,
    isLoadingPosts,
    onSaveNickname,
    pickProfileImage,
  };
};
