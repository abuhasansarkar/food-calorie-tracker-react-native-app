import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OAuthButton } from "@/components/ui/OAuthButton";
import { Header } from "@/components/ui/Header";
import { endGuestSession } from "@/utils/guest";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "@/utils/validation";
import { useClerk, useSignUp, useSSO } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useThemeContext } from "@/context/ThemeContext";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useSignUp();
  const clerk = useClerk();
  const { startSSOFlow } = useSSO();
  const { isDark, colors } = useThemeContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};

    const nameValidation = validateName(name);
    if (!nameValidation.isValid) newErrors.name = nameValidation.error!;

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) newErrors.email = emailValidation.error!;

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid)
      newErrors.password = passwordValidation.error!;

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const { error: signUpError } = await signUp.password({
        emailAddress: email,
        password,
        firstName: name,
      });

      if (signUpError) {
        setErrors({
          general: signUpError.longMessage || "Registration failed",
        });
        return;
      }

      if (signUp.status === "complete") {
        await endGuestSession();
        await clerk.setActive({ session: signUp.createdSessionId });
        router.replace("/(onboarding)/gender");
        return;
      }

      if (
        signUp.status === "missing_requirements" &&
        signUp.unverifiedFields?.includes("email_address")
      ) {
        const { error: sendError } = await signUp.verifications.sendEmailCode();
        if (!sendError) {
          router.push("/(auth)/verify-email");
        }
      }
    } catch {
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    setLoading(true);
    setErrors({});

    try {
      const { createdSessionId } = await startSSOFlow({ strategy });

      if (!createdSessionId) {
        setErrors({
          general: "SSO failed to create a session. Please try again.",
        });
        return;
      }

      await endGuestSession();
      await clerk.setActive({ session: createdSessionId });

      router.replace("/(onboarding)/gender");
    } catch (e: any) {
      setErrors({
        general: e?.errors?.[0]?.message || e?.message || "SSO sign up failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView 
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header title="" onBack={() => router.back()} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
          className="flex-1 px-6"
        >
          <View className="mb-6">
            <Text 
              style={{ color: isDark ? colors.text.dark : colors.text.light }}
              className="text-3xl font-extrabold tracking-tight mb-2"
            >
              Create Account
            </Text>
            <Text 
              style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
              className="text-base font-medium"
            >
              Start your transformation today
            </Text>
          </View>

          {/* Input Form */}
          <View className="gap-4">
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              autoCapitalize="words"
              error={errors.name}
            />

            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
              error={errors.confirmPassword}
            />

            {errors.general && (
              <Text style={{ color: colors.error[500] }} className="text-sm font-medium">
                {errors.general}
              </Text>
            )}

            <View className="mt-4">
              <Button
                title="Sign Up"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                size="lg"
                fullWidth
              />
            </View>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View 
              style={{ backgroundColor: isDark ? colors.border.dark : colors.border.light }}
              className="flex-1 h-px" 
            />
            <Text 
              style={{ color: isDark ? colors.text.tertiary : colors.neutral[400] }}
              className="mx-4 text-xs font-semibold uppercase tracking-wider"
            >
              or
            </Text>
            <View 
              style={{ backgroundColor: isDark ? colors.border.dark : colors.border.light }}
              className="flex-1 h-px" 
            />
          </View>

          {/* SSO Buttons */}
          <View className="gap-3">
            <OAuthButton
              provider="google"
              onPress={() => handleOAuth("oauth_google")}
            />
            <OAuthButton
              provider="apple"
              onPress={() => handleOAuth("oauth_apple")}
            />
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-8">
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-sm font-medium">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={{ color: colors.primary[500] }} className="text-sm font-bold">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          <View nativeID="clerk-captcha" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
