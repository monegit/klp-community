import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface AppButtonProps {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  style?: ViewStyle | ViewStyle[];
}

const variantStyles: Record<
  Variant,
  { bg: string; color: string; border?: string }
> = {
  primary: { bg: "#007AFF", color: "#fff" },
  secondary: { bg: "#5856D6", color: "#fff" },
  danger: { bg: "#FF3B30", color: "#fff" },
  ghost: { bg: "transparent", color: "#007AFF" },
};

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  disabled,
  loading,
  variant = "primary",
  style,
}) => {
  const vs = variantStyles[variant];
  const dimmed = disabled || loading;
  return (
    <Pressable
      onPress={dimmed ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: vs.bg, opacity: dimmed ? 0.5 : pressed ? 0.8 : 1 },
        variant === "ghost" && styles.ghost,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vs.color} size="small" />
      ) : (
        <Text style={[styles.title, { color: vs.color }]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  ghost: {
    paddingVertical: 10,
  },
});

export default AppButton;
