import { Colors } from "@/constants/Colors";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
  toDate?: () => Date;
};

type PostProps = {
  id: string;
  title: string;
  content: string;
  createdAt: string | Date | FirestoreTimestamp | null | undefined;
  images?: string[] | null;
  userNickname?: string;
  userPhotoURL?: string;
};

function formatCreatedAt(createdAt: PostProps["createdAt"]) {
  if (!createdAt) return "";
  if (typeof createdAt === "string")
    return new Date(createdAt).toLocaleString();
  if (createdAt instanceof Date) return createdAt.toLocaleString();
  if (typeof createdAt === "object" && "seconds" in createdAt) {
    return createdAt.toDate
      ? createdAt.toDate().toLocaleString()
      : new Date(createdAt.seconds * 1000).toLocaleString();
  }
  return String(createdAt);
}

// 개별 prop을 받도록 수정
export default function Post({
  id,
  title,
  content,
  createdAt,
  images,
  userNickname,
  userPhotoURL,
}: PostProps) {
  const navigation = useRouter();

  const onPress = () => {
    navigation.push(`/(pages)/post-detail?postId=${id}`);
  };

  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          padding: 16,
          backgroundColor: Colors.cardBg,
          borderRadius: 12,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: Colors.divider,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          {userPhotoURL ? (
            <ExpoImage
              source={{ uri: userPhotoURL }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: Colors.avatarPlaceholder,
                marginRight: 8,
              }}
            />
          ) : (
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: Colors.avatarPlaceholder,
                marginRight: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 10, color: Colors.subText }}>NA</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 16, fontWeight: "600", color: Colors.text }}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text style={{ fontSize: 11, color: Colors.subText, marginTop: 2 }}>
              {userNickname ? `${userNickname} · ` : ""}
              {formatCreatedAt(createdAt)}
            </Text>
          </View>
        </View>
        <Text
          style={{ fontSize: 16, marginBottom: 12, color: Colors.text }}
          numberOfLines={3}
        >
          {content}
        </Text>
        {!!images?.length && (
          <ExpoImage
            source={{ uri: images[0]! }}
            style={{ width: "100%", height: 200, borderRadius: 8 }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        )}
      </View>
    </Pressable>
  );
}
