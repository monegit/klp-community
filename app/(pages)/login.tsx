import { useAuth } from "@/contexts/AuthContext";
import { AccountData } from "@/types/user";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Button,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginScreen() {
  const route = useRouter();
  const auth = useAuth();

  const [accountData, setAccountData] = useState<AccountData>({
    email: "",
    password: "",
  });

  return (
    <SafeAreaView>
      <Text>로그인 화면</Text>
      <View>
        <Text>이메일</Text>
        <TextInput
          onChangeText={(value) => {
            setAccountData((prev) => ({ ...prev, email: value }));
          }}
        />
      </View>
      <View>
        <Text>비밀번호</Text>
        <TextInput
          secureTextEntry
          onChangeText={(value) => {
            setAccountData((prev) => ({ ...prev, password: value }));
          }}
        />
      </View>
      <View>
        <Button
          title="로그인"
          onPress={() => {
            auth
              .signIn(accountData.email, accountData.password)
              .then(() => {
                route.replace("/home");
              })
              .catch(() => {
                Alert.alert(
                  "오류",
                  "로그인 중 오류가 발생했습니다. 다시 시도해주세요."
                );
              });
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
