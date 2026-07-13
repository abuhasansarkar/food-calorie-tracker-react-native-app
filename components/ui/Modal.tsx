import { View, Text, Modal as RNModal, TouchableOpacity } from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  animationType?: "slide" | "fade" | "none";
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  animationType = "slide",
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={{
            backgroundColor: colors.white,
            borderTopLeftRadius: radius.xxl,
            borderTopRightRadius: radius.xxl,
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.lg,
            paddingBottom: spacing.huge,
            maxHeight: "80%",
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: colors.neutral[300],
              borderRadius: 2,
              alignSelf: "center",
              marginBottom: spacing.lg,
            }}
          />

          {title && (
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: colors.neutral[900],
                marginBottom: spacing.lg,
              }}
            >
              {title}
            </Text>
          )}

          {children}
        </View>
      </View>
    </RNModal>
  );
}
