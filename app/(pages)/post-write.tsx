import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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

import { Colors } from "@/constants/Colors";
import { usePostWrite } from "./_hooks/usePostWrite";

export default function PostWriteScreen() {
  const { postId } = useLocalSearchParams();

  const {
    onLoad,
    postTemplate,
    setPostTemplate,
    handlePickImage,
    removeImage,
    isEdit,
    handleSubmit,
    submitting,
  } = usePostWrite(postId as string);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  // 기존 글 로드
  useEffect(() => {
    if (!isEdit) return;
    setInitialLoading(true);
    onLoad();
    setInitialLoading(false);
  }, []);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "600" }}>
          {isEdit ? "게시글 수정" : "게시글 작성"}
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: "500" }}>제목</Text>
          <TextInput
            value={postTemplate.title}
            onChangeText={(value) =>
              setPostTemplate((prev) => ({ ...prev, title: value }))
            }
            placeholder="제목을 입력하세요"
            style={{
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          />
        </View>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: "500" }}>내용</Text>
          <TextInput
            value={postTemplate.content}
            onChangeText={(value) =>
              setPostTemplate((prev) => ({ ...prev, content: value }))
            }
            placeholder="내용을 입력하세요"
            multiline
            style={{
              borderWidth: 1,
              borderColor: Colors.border,
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
              이미지 ({postTemplate.images.length})
            </Text>
            <Pressable
              onPress={handlePickImage}
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
            {postTemplate.images.map((img, index) => (
              <View
                key={`${img.uri}_${index}`}
                style={{ position: "relative" }}
              >
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
            {postTemplate.images.length === 0 && (
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
            backgroundColor: submitting ? "#ccc" : Colors.primary,
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
