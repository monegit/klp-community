import { Button } from "@/components/common/Button";
import { TextInput } from "@/components/common/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { UserData } from "@/types/user";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function LoginScreen() {
  const route = useRouter();
  const auth = useAuth();

  const [accountData, setAccountData] = useState<UserData>({
    email: "",
    password: "",
  });

  const canSubmit = accountData.email.trim() && accountData.password.trim();

  const submit = () => {
    if (!canSubmit) return;
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
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f2f4f7" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            justifyContent: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <Text style={{ fontSize: 28, fontWeight: "700", color: "#111" }}>
              로그인
            </Text>
            <Text style={{ fontSize: 13, color: "#666", marginTop: 8 }}>
              계정 정보를 입력해주세요
            </Text>
          </View>

          <View style={{ gap: 18 }}>
            <TextInput
              label="이메일"
              requiredMark
              placeholder="example@domain.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={accountData.email}
              onChangeText={(value) =>
                setAccountData((prev) => ({ ...prev, email: value }))
              }
            />
            <TextInput
              label="비밀번호"
              requiredMark
              placeholder="••••••••"
              secureTextEntry
              value={accountData.password}
              onChangeText={(value) =>
                setAccountData((prev) => ({ ...prev, password: value }))
              }
            />
          </View>

          <View style={{ marginTop: 32 }}>
            <Button
              title="로그인"
              onPress={submit}
              disabled={!canSubmit}
              type="submit"
            />
            <Pressable
              onPress={() => route.push("/registry")}
              style={{ marginTop: 18, alignItems: "center" }}
            >
              <Text style={{ fontSize: 13, color: "#007AFF" }}>
                아직 계정이 없으신가요? 회원가입
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
