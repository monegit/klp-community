import { useRouter } from "expo-router";
import { Button, SafeAreaView, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const route = useRouter();

  return (
    <SafeAreaView>
      <Text>로그인 화면</Text>
      <View>
        <Text>이메일</Text>
        <TextInput />
      </View>
      <View>
        <Text>비밀번호</Text>
        <TextInput secureTextEntry />
      </View>
      <View>
        <Button
          title="로그인"
          onPress={() => {
            route.replace("/home");
          }}
        />
        <Button
          title="회원가입"
          onPress={() => {
            route.push("/registry");
          }}
        />
      </View>
    </SafeAreaView>
  );
}
