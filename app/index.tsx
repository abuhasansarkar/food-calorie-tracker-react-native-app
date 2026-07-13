import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(auth)/splash");
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-blue-50">
      <Text className="text-4xl font-bold text-blue-600">AceKy AI</Text>
    </View>
  );
}
