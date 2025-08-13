import { Colors } from "@/constants/Colors";
import React from "react";
import { Pressable, Text, ViewStyle } from "react-native";

interface Props {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<Props> = ({
  title,
  onPress,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          position: "absolute",
          right: 16,
          bottom: 24,
          backgroundColor: Colors.primary,
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          opacity: pressed ? 0.9 : 1,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        } as ViewStyle,
        style,
      ]}
    >
      <Text style={{ color: "#fff", fontWeight: "700" }}>{title}</Text>
    </Pressable>
  );
};

export default FloatingActionButton;
