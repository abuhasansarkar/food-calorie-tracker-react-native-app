import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { endGuestSession } from "@/utils/guest";
import { validateEmail, validatePassword } from "@/utils/validation";
import { useSignIn } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeContext } from "@/context/ThemeContext";

type Step = "email" | "code" | "password" | "done";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { signIn } = useSignIn();
  const { isDark, colors } = useThemeContext();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleSendCode = async () => {
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setError(validation.error!);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: createError } = await signIn.create({
        identifier: email,
      });
      if (createError) {
        setError(createError.longMessage || "Failed to send reset code");
        return;
      }
      const { error: sendError } =
        await signIn.resetPasswordEmailCode.sendCode();
      if (sendError) {
        setError(sendError.longMessage || "Failed to send reset code");
        return;
      }
      setStep("code");
    } catch {
      setError("Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      setError("Please enter the complete verification code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: verifyError } =
        await signIn.resetPasswordEmailCode.verifyCode({
          code: verificationCode,
        });
      if (verifyError) {
        setError(verifyError.longMessage || "Invalid code");
        return;
      }
      setStep("password");
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setError(validation.error!);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: resetError } =
        await signIn.resetPasswordEmailCode.submitPassword({
          password: newPassword,
        });
      if (resetError) {
        setError(resetError.longMessage || "Failed to reset password");
        return;
      }
      if (signIn.status === "complete") {
        await endGuestSession();
        const { error: finalizeError } = await signIn.finalize();
        if (!finalizeError) {
          setStep("done");
        }
      }
    } catch {
      setError("Failed to reset password. Please try again.");
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View 
          style={{ backgroundColor: isDark ? colors.background.dark : colors.background.light }}
          className="flex-1 px-6 justify-center"
        >
          {step === "done" ? (
            <View className="items-center gap-4">
              <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-2">
                <Text className="text-3xl text-green-600">✓</Text>
              </View>
              <Text 
                style={{ color: isDark ? colors.text.dark : colors.text.light }}
                className="text-3xl font-bold text-center"
              >
                Password Reset
              </Text>
              <Text 
                style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
                className="text-base text-center"
              >
                Your password has been reset successfully
              </Text>
              <Button
                title="Back to Login"
                onPress={() => router.push("/(auth)/login")}
                variant="outline"
                fullWidth
              />
            </View>
          ) : step === "password" ? (
            <View className="gap-4">
              <Text 
                style={{ color: isDark ? colors.text.dark : colors.text.light }}
                className="text-3xl font-bold mb-2"
              >
                New Password
              </Text>
              <Text 
                style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
                className="text-base mb-4"
              >
                Enter your new password
              </Text>
              <Input
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                secureTextEntry
                error={error}
              />
              <Button
                title="Reset Password"
                onPress={handleResetPassword}
                loading={loading}
                disabled={loading}
                size="lg"
                fullWidth
              />
              <Button
                title="Back to Login"
                onPress={() => router.push("/(auth)/login")}
                variant="ghost"
                fullWidth
              />
            </View>
          ) : step === "code" ? (
            <View className="gap-4">
              <Text 
                style={{ color: isDark ? colors.text.dark : colors.text.light }}
                className="text-3xl font-bold mb-2"
              >
                Check Your Email
              </Text>
              <Text 
                style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
                className="text-base mb-4"
              >
                Enter the 6-digit code sent to {email}
              </Text>
              <View className="flex-row justify-center gap-3 mb-4">
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
              {error ? (
                <Text className="text-sm text-red-500 text-center">{error}</Text>
              ) : null}
              <Button
                title="Verify Code"
                onPress={handleVerifyCode}
                loading={loading}
                disabled={loading || code.join("").length !== 6}
                size="lg"
                fullWidth
              />
              <Button
                title="Back to Login"
                onPress={() => router.push("/(auth)/login")}
                variant="ghost"
                fullWidth
              />
            </View>
          ) : (
            <View className="gap-4">
              <Text 
                style={{ color: isDark ? colors.text.dark : colors.text.light }}
                className="text-3xl font-bold mb-2"
              >
                Reset Password
              </Text>
              <Text 
                style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
                className="text-base mb-4"
              >
                Enter your email and we&apos;ll send you a reset code
              </Text>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={error}
              />
              <Button
                title="Send Reset Code"
                onPress={handleSendCode}
                loading={loading}
                disabled={loading}
                size="lg"
                fullWidth
              />
              <Button
                title="Back to Login"
                onPress={() => router.push("/(auth)/login")}
                variant="ghost"
                fullWidth
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
