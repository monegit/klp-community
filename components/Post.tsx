import { Colors } from "@/constants/Colors";
import { Image as ExpoImage, ImageStyle } from "expo-image";
import { useRouter } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

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
  nickname?: string;
  profileImageURL?: string;
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
  nickname,
  profileImageURL,
}: PostProps) {
  const navigation = useRouter();

  const onPress = () => {
    navigation.push(`/(pages)/post-detail?postId=${id}`);
  };

  return (
    <Pressable onPress={onPress}>
      <View style={styles.view.component}>
        <View style={styles.view.header}>
          {profileImageURL ? (
            <ExpoImage
              source={{ uri: profileImageURL }}
              style={styles.image.profileImage}
            />
          ) : (
            <View style={styles.image.emptyProfileImage} />
          )}
          <View style={styles.view.title}>
            <Text style={styles.text.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.text.titleInfo}>
              {nickname ? `${nickname} · ` : ""}
              {formatCreatedAt(createdAt)}
            </Text>
          </View>
        </View>
        <Text style={styles.text.content} numberOfLines={3}>
          {content}
        </Text>
        {!!images?.length && (
          <ExpoImage
            source={{ uri: images[0]! }}
            style={styles.image.contentImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = {
  view: StyleSheet.create({
    component: {
      padding: 16,
      backgroundColor: Colors.cardBg,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: Colors.divider,
    } as ViewStyle,

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    } as ViewStyle,

    title: { flex: 1 } as ViewStyle,
  }),

  text: StyleSheet.create({
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors.text,
    } as TextStyle,

    titleInfo: {
      fontSize: 11,
      color: Colors.subText,
      marginTop: 2,
    } as TextStyle,

    content: {
      fontSize: 16,
      marginBottom: 12,
      color: Colors.text,
    } as TextStyle,
  }),

  image: StyleSheet.create({
    profileImage: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: Colors.avatarPlaceholder,
      marginRight: 8,
    } as ImageStyle,

    emptyProfileImage: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: Colors.avatarPlaceholder,
      marginRight: 8,
      alignItems: "center",
      justifyContent: "center",
    } as ViewStyle,

    contentImage: { width: "100%", height: 200, borderRadius: 8 } as ImageStyle,
  }),
};
