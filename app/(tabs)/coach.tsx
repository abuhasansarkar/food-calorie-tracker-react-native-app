import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/ui/Header";
import { useThemeContext } from "@/context/ThemeContext";
import { aiService } from "@/services/ai";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { spacing } from "@/theme/spacing";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT =
  "You are an expert AI fitness coach. Your name is AceKy AI and model name Fitness Coach. Your role is to help users with nutrition, exercise, weight management, and overall wellness. " +
  "Keep responses concise, actionable, and encouraging. " +
  "Provide specific advice based on fitness science and established nutrition guidelines. " +
  "If asked about medical issues, remind them to consult a doctor. " +
  "Format responses with short paragraphs for readability. " +
  "Use a motivational but professional tone.";

export default function CoachScreen() {
  const router = useRouter();
  const { isDark, colors } = useThemeContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hi! I'm your AI fitness coach. Ask me anything about nutrition, workouts, meal planning, or reaching your fitness goals!",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    setInputText("");
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const history = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        ...messages
          .filter((m) => m.id !== "welcome")
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: text },
      ];

      const response = await aiService.chat(history);

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: response,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [inputText, isLoading, messages]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header
        title="AI Fitness Coach"
        leftAction={
          <TouchableOpacity onPress={() => router.back()} style={{ padding: spacing.xs }}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color={isDark ? colors.text.dark : colors.neutral[700]}
            />
          </TouchableOpacity>
        }
        rightAction={
          <View className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.primary[500] }}
          >
            <MaterialCommunityIcons name="robot" size={20} color={colors.black} />
          </View>
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
          className="flex-1"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <View
                key={msg.id}
                className={`mb-3 flex-row ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-2 mt-1"
                    style={{ backgroundColor: colors.primary[500] }}
                  >
                    <MaterialCommunityIcons name="robot" size={16} color={colors.black} />
                  </View>
                )}
                <View
                  className="max-w-[80%] rounded-2xl px-4 py-3"
                  style={{
                    backgroundColor: isUser
                      ? colors.primary[500]
                      : isDark
                        ? colors.surface.dark
                        : colors.white,
                    borderTopLeftRadius: isUser ? 20 : 4,
                    borderTopRightRadius: isUser ? 4 : 20,
                  }}
                >
                  <Text
                    style={{
                      color: isUser ? colors.black : isDark ? colors.text.dark : colors.text.light,
                      fontSize: 15,
                      lineHeight: 21,
                    }}
                  >
                    {msg.content}
                  </Text>
                </View>
              </View>
            );
          })}

          {isLoading && (
            <View className="flex-row items-center mb-3">
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-2"
                style={{ backgroundColor: colors.primary[500] }}
              >
                <MaterialCommunityIcons name="robot" size={16} color={colors.black} />
              </View>
              <View
                className="rounded-2xl rounded-tl-sm px-5 py-3.5 flex-row items-center"
                style={{
                  backgroundColor: isDark ? colors.surface.dark : colors.white,
                }}
              >
                <ActivityIndicator size="small" color={colors.primary[500]} />
                <Text
                  style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
                  className="ml-2 text-sm font-medium"
                >
                  Thinking...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View
          className="flex-row items-center px-4 py-3 border-t"
          style={{
            backgroundColor: isDark ? colors.surface.dark : colors.white,
            borderColor: isDark ? colors.border.dark : colors.border.light,
          }}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask your fitness coach..."
            placeholderTextColor={isDark ? colors.text.secondary : colors.neutral[400]}
            multiline
            className="flex-1 text-base max-h-24 rounded-xl px-4 py-2.5 mr-2"
            style={{
              backgroundColor: isDark ? colors.background.dark : colors.neutral[100],
              color: isDark ? colors.text.dark : colors.text.light,
            }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{
              backgroundColor: inputText.trim() && !isLoading
                ? colors.primary[500]
                : isDark
                  ? colors.neutral[800]
                  : colors.neutral[200],
            }}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={
                inputText.trim() && !isLoading
                  ? colors.black
                  : isDark
                    ? colors.neutral[500]
                    : colors.neutral[400]
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
