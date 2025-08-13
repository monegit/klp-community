import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { usePost } from "@/hooks/usePost";
import { markPostDirty } from "@/lib/postRefresh";
import { uploadLocalImages } from "@/services/image";
import { fetchPostUpdate, fetchPostWrite } from "@/services/post";
import { ImageItem } from "@/types/post";

interface PostTemplate {
  title: string;
  content: string;
  images: ImageItem[];
}

export const usePostWrite = (postId: string) => {
  const isEdit = !!postId;

  const auth = useAuth();
  const { getPostDetail } = usePost();
  const router = useRouter();

  const [postTemplate, setPostTemplate] = useState<PostTemplate>({
    title: "",
    content: "",
    images: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const onLoad = async () => {
    try {
      const response = await getPostDetail(postId);

      if (!response?.post) {
        Alert.alert("오류", "게시글을 불러오는 데 실패했습니다.");
        router.back();
        return;
      }

      setPostTemplate({
        title: response.post.title || "",
        content: response.post.content || "",
        images: response.post.images.map((imageItem) => ({
          uri: imageItem,
          remote: true,
        })),
      });
    } catch (error) {
      console.error("Error loading post:", error);
      Alert.alert("오류", "게시글을 불러오는 데 실패했습니다.");
      router.back();
    }
  };

  const removeImage = (uri: string) => {
    setPostTemplate((prev) => ({
      ...prev,
      images: prev.images?.filter((image) => image.uri !== uri),
    }));
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("권한 필요", "이미지 접근 권한이 필요합니다.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.85,
      selectionLimit: 10,
    });
    if (!result.canceled && result.assets?.length) {
      const picked = result.assets
        .map((a) => a.uri)
        .filter(Boolean) as string[];
      setPostTemplate((prev) => ({
        ...prev,
        images: [
          ...prev.images,
          ...picked.map((uri) => ({ uri, remote: false })),
        ],
      }));
    }
  };

  const handleSubmit = async () => {
    if (!postTemplate.title.trim() || !postTemplate.content.trim()) {
      Alert.alert("확인", "제목과 내용을 입력해 주세요.");
      return;
    }

    if (!auth.user) {
      Alert.alert("로그인 필요", "로그인이 필요합니다.");
      return;
    }

    setSubmitting(true);

    try {
      if (!isEdit) {
        await fetchPostWrite({
          userId: auth.user.uid,
          title: postTemplate.title.trim(),
          content: postTemplate.content.trim(),
          images: postTemplate.images.map((image) => image.uri),
          createdAt: "",
        } as any);
        Alert.alert("완료", "게시글이 작성되었습니다.");

        router.back();
      } else {
        const remoteImages = postTemplate.images
          .filter((i) => i.remote)
          .map((i) => i.uri);
        const localImages = postTemplate.images.filter((i) => !i.remote);
        const uploaded = await uploadLocalImages(localImages);
        const finalImages = [...remoteImages, ...uploaded];

        await fetchPostUpdate(postId as string, {
          title: postTemplate.title.trim(),
          content: postTemplate.content.trim(),
          images: finalImages,
        });

        Alert.alert("완료", "게시글이 수정되었습니다.");

        markPostDirty(postId as string);

        router.back();
      }
    } catch (error: any) {
      Alert.alert("오류", error ?? (isEdit ? "수정 중 오류" : "작성 중 오류"));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    onLoad,
    postTemplate,
    setPostTemplate,
    removeImage,
    handlePickImage,
    handleSubmit,
    submitting,
    isEdit,
  };
};
