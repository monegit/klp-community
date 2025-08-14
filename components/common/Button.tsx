import Colors from "@/constants/Colors";
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
type ButtonType = "submit" | "button";

interface AppButtonProps {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  type?: ButtonType;
  style?: ViewStyle | ViewStyle[];
}

const variantStyles: Record<
  Variant,
  { backgroundColor: string; color: string; border?: string }
> = {
  primary: { backgroundColor: Colors.primary, color: "#fff" },
  secondary: { backgroundColor: Colors.secondary, color: "#fff" },
  danger: { backgroundColor: Colors.danger, color: "#fff" },
  ghost: { backgroundColor: "transparent", color: "#007AFF" },
};

const buttonTypeStyles: Record<ButtonType, ViewStyle> = {
  submit: { width: "auto", paddingHorizontal: 18, paddingVertical: 14 },
  button: { width: "auto", paddingVertical: 8, paddingHorizontal: 12 },
};

export const Button: React.FC<AppButtonProps> = ({
  title,
  onPress,
  disabled,
  loading,
  variant = "primary",
  type = "button",
  style,
}) => {
  const variantStyle = variantStyles[variant];
  const variantType = buttonTypeStyles[type];
  const dimmed = disabled || loading;
  return (
    <Pressable
      onPress={dimmed ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        {
          width: variantType.width,
          paddingHorizontal: variantType.paddingHorizontal,
          paddingVertical: variantType.paddingVertical,
          backgroundColor: variantStyle.backgroundColor,
          opacity: dimmed ? 0.5 : pressed ? 0.8 : 1,
        },
        variant === "ghost" && styles.ghost,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.color} size="small" />
      ) : (
        <Text style={[styles.title, { color: variantStyle.color }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    // flex: 1,
    // paddingVertical: 14,
    // paddingHorizontal: 18,
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

export default Button;
