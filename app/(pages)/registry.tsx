import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { Button } from "@/components/common/Button";
import { TextInput } from "@/components/common/TextInput";
import Colors from "@/constants/Colors";
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
    <SafeAreaView style={styles.view.component}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.view.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.view.header}>
            <Text style={styles.text.title}>회원가입</Text>
            <Text style={styles.text.subtitle}>
              필수 정보를 입력해 계정을 만들어요
            </Text>
          </View>

          <View style={styles.view.content}>
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

          <View style={styles.view.footer}>
            <Button
              title="회원가입"
              onPress={submit}
              disabled={!canSubmit}
              type="submit"
            />
            <Pressable
              onPress={() => route.back()}
              style={styles.button.submit}
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

const styles = {
  view: StyleSheet.create({
    component: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    } as ViewStyle,

    scrollView: {
      flexGrow: 1,
      padding: 24,
      justifyContent: "center",
    } as ViewStyle,

    header: { alignItems: "center", marginBottom: 40 } as ViewStyle,

    content: { gap: 18 } as ViewStyle,

    footer: { marginTop: 32 } as ViewStyle,
  }),

  text: StyleSheet.create({
    title: { fontSize: 28, fontWeight: "700", color: Colors.text } as TextStyle,

    subtitle: {
      fontSize: 13,
      color: Colors.subText,
      marginTop: 8,
    } as TextStyle,

    registry: { fontSize: 13, color: Colors.primary } as TextStyle,
  }),

  button: StyleSheet.create({
    submit: { marginTop: 18, alignItems: "center" } as ViewStyle,
  }),
};
