import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OAuthButton } from "@/components/ui/OAuthButton";
import { Header } from "@/components/ui/Header";
import { endGuestSession } from "@/utils/guest";
import { useClerk, useSignIn, useSSO } from "@clerk/expo";
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
  SafeAreaView,
  StatusBar,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useSignIn();
  const clerk = useClerk();
  const { startSSOFlow } = useSSO();
  const { isDark, colors } = useThemeContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: signInError } = await signIn.password({
        emailAddress: email,
        password,
      });

      if (signInError) {
        setError(signInError.longMessage || "Sign in failed");
        return;
      }

      if (signIn.status === "complete") {
        await endGuestSession();
        await clerk.setActive({ session: signIn.createdSessionId });
        router.replace("/(onboarding)/gender");
      } else {
        setError("Additional verification is required");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    setLoading(true);
    setError("");

    try {
      const { createdSessionId } = await startSSOFlow({ strategy });

      if (!createdSessionId) {
        setError("SSO failed to create a session. Please try again.");
        return;
      }

      await endGuestSession();
      await clerk.setActive({ session: createdSessionId });

      router.replace("/(onboarding)/gender");
    } catch (e: any) {
      setError(e?.errors?.[0]?.message || e?.message || "SSO sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView 
      style={{ backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header title="" onBack={() => router.back()} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingBottom: 24 }}
          className="px-6"
        >
          <View className="mb-8">
            <Text 
              style={{ color: isDark ? colors.text.dark : colors.text.light }}
              className="text-3xl font-extrabold tracking-tight mb-2"
            >
              Welcome Back!
            </Text>
            <Text 
              style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
              className="text-base font-medium"
            >
              Sign in to continue
            </Text>
          </View>

          {/* SSO Buttons */}
          <View className="gap-3 mb-6">
            <OAuthButton
              provider="google"
              onPress={() => handleOAuth("oauth_google")}
            />
            <OAuthButton
              provider="apple"
              onPress={() => handleOAuth("oauth_apple")}
            />
          </View>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
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

          {/* Input Form */}
          <View className="gap-4">
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />

            {error ? (
              <Text style={{ color: colors.error[500] }} className="text-sm font-medium">
                {error}
              </Text>
            ) : null}

            <TouchableOpacity
              onPress={() => router.push("/(auth)/forgot-password")}
              className="self-end"
            >
              <Text 
                style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} 
                className="text-sm font-semibold"
              >
                Forgot password?
              </Text>
            </TouchableOpacity>

            <View className="mt-4">
              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                size="lg"
                fullWidth
              />
            </View>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-10">
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-sm font-medium">
              Don&apos;t have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={{ color: colors.primary[500] }} className="text-sm font-bold">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
