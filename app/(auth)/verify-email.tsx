import { Button } from "@/components/ui/Button";
import { colors } from "@/theme/colors";
import { endGuestSession } from "@/utils/guest";
import { useClerk, useSignUp } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { signUp } = useSignUp();
  const clerk = useClerk();
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
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  if (!signUp.status || signUp.status === "complete") {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-xl font-bold text-gray-900 mb-2">
          No Pending Verification
        </Text>
        <Text className="text-base text-gray-500 text-center mb-6">
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
    );
  }

  return (
    <View className="flex-1 px-6 justify-center bg-white">
      <Text className="text-3xl font-bold text-gray-900 mb-2">
        Verify Email
      </Text>
      <Text className="text-base text-gray-500 mb-8">
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
              color: colors.neutral[900],
              borderColor: digit ? colors.primary[500] : colors.neutral[300],
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
        <Text className="text-sm text-blue-600">Resend Code</Text>
      </TouchableOpacity>
    </View>
  );
}
