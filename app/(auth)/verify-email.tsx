import { Button } from "@/components/ui/Button";
import { endGuestSession } from "@/utils/guest";
import { useClerk, useSignUp } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeContext } from "@/context/ThemeContext";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { signUp } = useSignUp();
  const clerk = useClerk();
  const { isDark, colors } = useThemeContext();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleVerify = async () => {
    if (!signUp) {
      setError("No pending registration found. Please sign up again.");
      return;
    }

    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      setError("Please enter the complete verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode(
        {
          code: verificationCode,
        },
      );

      if (verifyError) {
        setError(verifyError.longMessage || "Invalid verification code");
        return;
      }

      if (signUp.status === "complete") {
        await endGuestSession();
        await clerk.setActive({ session: signUp.createdSessionId });
        router.replace("/(onboarding)/gender");
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text.replace(/[^0-9]/g, "");
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!signUp) return;
    try {
      await signUp.verifications.sendEmailCode();
    } catch {}
  };

  if (!signUp) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}>
        <View 
          style={{ backgroundColor: isDark ? colors.background.dark : colors.background.light }}
          className="flex-1 items-center justify-center"
        >
          <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!signUp.status || signUp.status === "complete") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}>
        <View 
          style={{ backgroundColor: isDark ? colors.background.dark : colors.background.light }}
          className="flex-1 items-center justify-center px-6"
        >
          <Text 
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-xl font-bold mb-2"
          >
            No Pending Verification
          </Text>
          <Text 
            style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
            className="text-base text-center mb-6"
          >
            You don&apos;t have a pending email verification. Please sign up
            first.
          </Text>
          <Button
            title="Go to Sign Up"
            onPress={() => router.replace("/(auth)/register")}
            size="lg"
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}>
      <View 
        style={{ backgroundColor: isDark ? colors.background.dark : colors.background.light }}
        className="flex-1 px-6 justify-center"
      >
        <Text 
          style={{ color: isDark ? colors.text.dark : colors.text.light }}
          className="text-3xl font-bold mb-2"
        >
          Verify Email
        </Text>
        <Text 
          style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
          className="text-base mb-8"
        >
          Enter the 6-digit code sent to your email
        </Text>

        <View className="flex-row justify-center gap-3 mb-6">
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              style={{
                width: 48,
                height: 56,
                borderWidth: 1,
                borderRadius: 8,
                textAlign: "center",
                fontSize: 20,
                fontWeight: "700",
                color: isDark ? colors.text.dark : colors.text.light,
                borderColor: digit
                  ? colors.primary[500]
                  : (isDark ? colors.border.dark : colors.border.light),
                backgroundColor: isDark ? colors.surface.dark : colors.white,
              }}
            />
          ))}
        </View>

        {error && (
          <Text className="text-sm text-red-500 text-center mb-4">{error}</Text>
        )}

        <Button
          title="Verify"
          onPress={handleVerify}
          loading={loading}
          disabled={loading || code.join("").length !== 6}
          size="lg"
          fullWidth
        />

        <TouchableOpacity className="mt-4 items-center" onPress={handleResend}>
          <Text style={{ color: colors.primary[500] }} className="text-sm font-bold">Resend Code</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
