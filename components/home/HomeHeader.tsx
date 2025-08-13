import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";

interface Props {
  pageSize: number;
  setPageSize: (n: number) => void;
}

export const HomeHeader: React.FC<Props> = ({ pageSize, setPageSize }) => {
  const { user, profile } = useAuth();
  const route = useRouter();

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
      <Pressable
        onPress={() => {
          if (!user) {
            Alert.alert(
              "로그인 필요",
              "프로필을 수정하려면 로그인해야 합니다."
            );
            return;
          }
          route.push("/profile-edit");
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          paddingVertical: 4,
        }}
      >
        {profile?.profileImageURL ? (
          <Image
            source={{ uri: profile.profileImageURL }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: Colors.avatarPlaceholder,
            }}
          />
        ) : (
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: Colors.avatarPlaceholder,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: Colors.subText, fontSize: 12 }}>프로필</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.text }}>
            {profile?.nickname || (user ? "닉네임 없음" : "게스트")}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.primary, marginTop: 4 }}>
            {user ? "프로필 수정 →" : "로그인 후 프로필 설정"}
          </Text>
        </View>
      </Pressable>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginTop: 12,
        }}
      ></View>
    </View>
  );
};

export default HomeHeader;
