import { useAuth } from "@/contexts/AuthContext";
import { db, storage } from "@/firebase.config";
import { usePost } from "@/hooks/usePost";
import { markPostDirty } from "@/lib/postRefresh";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
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

interface ImageItem {
  uri: string;
  remote?: boolean;
}

export default function PostWriteScreen() {
  const auth = useAuth();
  const { writePost, updatePost } = usePost();
  const { postId } = useLocalSearchParams();
  const router = useRouter();
  const isEdit = !!postId;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]); // remote:true 기존 이미지
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  // 기존 글 로드
  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "posts", postId as string));
        if (!snap.exists()) {
          Alert.alert("안내", "게시글을 찾을 수 없습니다.");
          router.back();
          return;
        }
        const data: any = snap.data();
        if (data.userId !== auth.user?.uid) {
          Alert.alert("권한 없음", "수정 권한이 없습니다.");
          router.back();
          return;
        }
        setTitle(data.title || "");
        setContent(data.content || "");
        const imgs: string[] = data.images || [];
        setImages(imgs.map((u) => ({ uri: u, remote: true })));
      } catch {
        Alert.alert("오류", "게시글을 불러오지 못했습니다.");
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [isEdit, postId, auth.user, router]);

  const pickImage = async () => {
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
      setImages((prev) => [
        ...prev,
        ...picked.map((u) => ({ uri: u })), // 신규(remote:false)
      ]);
    }
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((i) => i.uri !== uri));
  };

  const uploadLocalImages = async (locals: ImageItem[]) => {
    const uploaded: string[] = [];
    for (let i = 0; i < locals.length; i++) {
      try {
        const res = await fetch(locals[i].uri);
        if (!res.ok) continue;
        const blob = await res.blob();
        const storageRef = ref(storage, `images/post_${Date.now()}_${i}.jpg`);
        await uploadBytes(storageRef, blob as any, {
          contentType: (blob as any)?.type || "image/jpeg",
        });
        const url = await getDownloadURL(storageRef);
        uploaded.push(url);
      } catch (e) {
        console.warn("이미지 업로드 실패", locals[i].uri, e);
      }
    }
    return uploaded;
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
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
        // 신규 작성: writePost가 이미지 업로드 수행
        await writePost({
          userId: auth.user.uid,
          title: title.trim(),
          content: content.trim(),
          images: images.map((i) => i.uri),
          createdAt: "",
        });
        Alert.alert("완료", "게시글이 작성되었습니다.");
        setTitle("");
        setContent("");
        setImages([]);
        router.back();
      } else {
        // 수정: 기존(remote) 유지 + 신규 업로드 + 제거된 것은 제외
        const remoteImages = images.filter((i) => i.remote).map((i) => i.uri);
        const localImages = images.filter((i) => !i.remote);
        const uploaded = await uploadLocalImages(localImages);
        const finalImages = [...remoteImages, ...uploaded];
        await updatePost(postId as string, {
          title: title.trim(),
          content: content.trim(),
          images: finalImages,
        });
        Alert.alert("완료", "게시글이 수정되었습니다.");
        // 뒤로 가기 전에 더티 표시 -> post-detail focus에서 재조회
        markPostDirty(postId as string);
        router.back();
      }
    } catch (e: any) {
      Alert.alert(
        "오류",
        e?.message ?? (isEdit ? "수정 중 오류" : "작성 중 오류")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "600" }}>
          {isEdit ? "게시글 수정" : "게시글 작성"}
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: "500" }}>제목</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력하세요"
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          />
        </View>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: "500" }}>내용</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="내용을 입력하세요"
            multiline
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              minHeight: 140,
              textAlignVertical: "top",
              padding: 12,
            }}
          />
        </View>
        <View style={{ gap: 10 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "500" }}>
              이미지 ({images.length})
            </Text>
            <Pressable
              onPress={pickImage}
              style={{
                backgroundColor: "#007AFF",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}>
                추가
              </Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {images.map((img) => (
              <View key={img.uri} style={{ position: "relative" }}>
                <Image
                  source={{ uri: img.uri }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                    backgroundColor: "#eee",
                  }}
                />
                <Pressable
                  onPress={() => removeImage(img.uri)}
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: 12,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 12 }}>X</Text>
                </Pressable>
                {img.remote && (
                  <View
                    style={{
                      position: "absolute",
                      left: 4,
                      bottom: 4,
                      backgroundColor: "rgba(0,0,0,0.45)",
                      paddingHorizontal: 4,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 10 }}>기존</Text>
                  </View>
                )}
              </View>
            ))}
            {images.length === 0 && (
              <Text style={{ color: "#888" }}>
                이미지를 추가해보세요 (선택 사항)
              </Text>
            )}
          </View>
        </View>
        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={{
            backgroundColor: submitting ? "#ccc" : "#34C759",
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
            {submitting
              ? isEdit
                ? "수정 중..."
                : "작성 중..."
              : isEdit
              ? "수정 완료"
              : "작성"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// import { useAuth } from "@/contexts/AuthContext";
// import { usePost } from "@/hooks/usePost";
// import * as ImagePicker from "expo-image-picker";
// import React, { useState } from "react";
// import {
//   Button,
//   Image,
//   SafeAreaView,
//   Text,
//   TextInput,
//   View,
// } from "react-native";

// export default function PostWriteScreen() {
//   const auth = useAuth();
//   const [imageUri, setImageUri] = useState<string[] | null>(null);
//   const [postData, setPostData] = useState<{
//     title: string;
//     content: string;
//     images: string[];
//   }>({
//     title: "",
//     content: "",
//     images: [],
//   });
//   const { writePost } = usePost();

//   const pickImage = async () => {
//     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

//     if (!permission.granted) {
//       alert("이미지 접근 권한이 필요합니다.");
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 0.8,
//     });

//     if (!result.canceled && result.assets && result.assets.length > 0) {
//       setImageUri((prev) => [...(prev ?? []), result.assets[0].uri]);
//     }
//   };

//   return (
//     <SafeAreaView>
//       <View>
//         <Text>제목</Text>
//         <TextInput
//           onChangeText={(value) => {
//             setPostData((prev) => ({ ...prev, title: value }));
//           }}
//         />
//       </View>
//       <View>
//         <Text>내용</Text>
//         <TextInput
//           onChangeText={(value) => {
//             setPostData((prev) => ({ ...prev, content: value }));
//           }}
//         />
//       </View>
//       <Button title="이미지 등록" onPress={pickImage} />
//       {postData.images.map((uri) => (
//         <Image key={uri} source={{ uri }} style={{ width: 100, height: 100 }} />
//       ))}

//       <Button
//         title="작성"
//         onPress={async () => {
//           await writePost({
//             userId: auth.user?.uid ?? "",
//             title: postData.title ?? "",
//             content: postData.content ?? "",
//             images: imageUri ?? [],
//           });
//         }}
//       />
//     </SafeAreaView>
//   );
// }
