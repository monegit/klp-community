import { FloatingActionButton } from "@/components/common/FloatingActionButton";
import { PostBoard } from "@/components/home/PostBoard";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { Alert, SafeAreaView } from "react-native";

export default function HomeScreen() {
  const { user } = useAuth();
  const route = useRouter();

  return (
    <SafeAreaView style={{ backgroundColor: Colors.bg, flex: 1 }}>
      <PostBoard />

      <FloatingActionButton
        title="게시글 작성"
        onPress={() => {
          if (!user) {
            Alert.alert(
              "로그인 필요",
              "게시물을 작성하려면 로그인해야 합니다."
            );
            return;
          }
          route.push("/post-write");
        }}
      />
    </SafeAreaView>
  );
}
