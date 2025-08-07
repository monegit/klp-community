import "@/firebase.config";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import "react-native-reanimated";

import { AuthProvider } from "@/contexts/AuthContext";
import { useLayoutEffect } from "react";

export default function RootLayout() {
  useLayoutEffect(() => {}, []);

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(pages)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AuthProvider>
  );
}
