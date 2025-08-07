import { useAuth } from "@/contexts/AuthContext";
import { Text, View } from "react-native";

export default function TabLayout() {
  const auth = useAuth();
  return (
    <View>
      {auth.user ? (
        <Text>환영합니다, {auth.user.email}!</Text>
      ) : (
        <Text>로그인해주세요.</Text>
      )}
    </View>
  );
  // return (
  //   <Tabs
  //     screenOptions={{
  //       tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
  //       headerShown: false,
  //       tabBarButton: HapticTab,
  //       tabBarBackground: TabBarBackground,
  //       tabBarStyle: Platform.select({
  //         ios: {
  //           // Use a transparent background on iOS to show the blur effect
  //           position: 'absolute',
  //         },
  //         default: {},
  //       }),
  //     }}>
  //     <Tabs.Screen
  //       name="index"
  //       options={{
  //         title: 'Home',
  //         tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
  //       }}
  //     />
  //     <Tabs.Screen
  //       name="explore"
  //       options={{
  //         title: 'Explore',
  //         tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
  //       }}
  //     />
  //   </Tabs>
  // );
}
