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

import { Button } from "@/components/common/Button";
import { TextInput } from "@/components/common/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { UserData } from "@/types/user";

export default function RegistryScreen() {
  const route = useRouter();
  const auth = useAuth();

  const [accountData, setAccountData] = useState<
    UserData & { nickname: string }
  >({
    email: "",
    password: "",
    nickname: "",
  });

  const canSubmit =
    accountData.email.trim() &&
    accountData.password.trim() &&
    accountData.nickname.trim();

  const submit = () => {
    if (!canSubmit) return;
    auth
      .signUp(accountData.email, accountData.password, accountData.nickname)
      .then(() => route.replace("/home"))
      .catch(() =>
        Alert.alert(
          "오류",
          "회원가입 중 오류가 발생했습니다. 다시 시도해주세요."
        )
      );
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
              회원가입
            </Text>
            <Text style={{ fontSize: 13, color: "#666", marginTop: 8 }}>
              필수 정보를 입력해 계정을 만들어요
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
              onChangeText={(v) =>
                setAccountData((prev) => ({ ...prev, email: v }))
              }
            />
            <TextInput
              label="비밀번호"
              requiredMark
              placeholder="8자 이상"
              secureTextEntry
              value={accountData.password}
              onChangeText={(v) =>
                setAccountData((prev) => ({ ...prev, password: v }))
              }
            />
            <TextInput
              label="닉네임"
              requiredMark
              placeholder="표시할 닉네임"
              value={accountData.nickname}
              onChangeText={(v) =>
                setAccountData((prev) => ({ ...prev, nickname: v }))
              }
            />
          </View>

          <View style={{ marginTop: 32 }}>
            <Button
              title="회원가입"
              onPress={submit}
              disabled={!canSubmit}
              type="submit"
            />
            <Pressable
              onPress={() => route.back()}
              style={{ marginTop: 18, alignItems: "center" }}
            >
              <Text style={{ fontSize: 13, color: "#007AFF" }}>
                이미 계정이 있나요? 로그인
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
