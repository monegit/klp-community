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
          backgroundColor: "#f9f9f9",
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
          {title}
        </Text>
        <Text style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
          {formatCreatedAt(createdAt)}
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 12 }} numberOfLines={3}>
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
