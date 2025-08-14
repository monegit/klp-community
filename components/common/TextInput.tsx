import { Colors } from "@/constants/Colors";
import React from "react";
import * as ReactTextInput from "react-native";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

interface TextInputProps
  extends Omit<ReactTextInput.TextInputProps, "onChange"> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
  errorMessage?: string;
  requiredMark?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChangeText,
  containerStyle,
  errorMessage,
  requiredMark,
  multiline,
  ...rest
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {requiredMark && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <ReactTextInput.TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline]}
        placeholderTextColor={Colors.muted}
        {...rest}
      />
      {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  required: {
    color: Colors.danger,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.cardBg,
    color: Colors.text,
    fontSize: 14,
  },
  multiline: {
    minHeight: 140,
    textAlignVertical: "top",
    paddingVertical: 12,
  },
  error: {
    fontSize: 12,
    color: Colors.danger,
  },
});

export default TextInput;
