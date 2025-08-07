import { useAuth } from "@/contexts/AuthContext";
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

interface AccountData {
  email: string;
  password: string;
}

export default function RegistryScreen() {
  const route = useRouter();
  const auth = useAuth();

  const [accountData, setAccountData] = useState<AccountData>({
    email: "",
    password: "",
  });

  return (
    <SafeAreaView>
      <Text>KLP Community 회원가입</Text>
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
          onChangeText={(value) => {
            setAccountData((prev) => ({ ...prev, password: value }));
          }}
        />
      </View>
      <Button
        title="완료"
        onPress={() => {
          auth
            .signUp(accountData.email, accountData.password)
            .then(() => {
              route.replace("/home");
            })
            .catch(() => {
              Alert.alert(
                "오류",
                "회원가입 중 오류가 발생했습니다. 다시 시도해주세요."
              );
            });
        }}
      />
    </SafeAreaView>
  );
}
