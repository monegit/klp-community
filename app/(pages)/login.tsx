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
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { UserData } from "@/types/user";

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
    <SafeAreaView style={styles.view.component}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.view.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.view.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.view.header}>
            <Text style={styles.text.title}>로그인</Text>
            <Text style={styles.text.subtitle}>계정 정보를 입력해주세요</Text>
          </View>

          <View style={styles.view.content}>
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

          <View style={styles.view.footer}>
            <Button
              title="로그인"
              onPress={submit}
              disabled={!canSubmit}
              type="submit"
            />
            <Pressable
              onPress={() => route.push("/registry")}
              style={styles.button.registry}
            >
              <Text style={styles.text.registry}>
                아직 계정이 없으신가요? 회원가입
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

    keyboardAvoidingView: {
      flex: 1,
    } as ViewStyle,

    scrollView: {
      flexGrow: 1,
      padding: 24,
      justifyContent: "center",
    } as ViewStyle,

    header: {
      alignItems: "center",
      marginBottom: 40,
    } as ViewStyle,

    content: {
      gap: 18,
    } as ViewStyle,

    footer: {
      marginTop: 32,
    } as ViewStyle,
  }),

  text: StyleSheet.create({
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: Colors.text,
    } as TextStyle,

    subtitle: {
      fontSize: 13,
      color: Colors.subText,
      marginTop: 8,
    } as TextStyle,

    registry: {
      fontSize: 13,
      color: Colors.primary,
    } as TextStyle,
  }),

  button: StyleSheet.create({
    registry: {
      marginTop: 18,
      alignItems: "center",
    } as ViewStyle,
  }),
};
