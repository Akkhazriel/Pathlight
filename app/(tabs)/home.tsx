import { View, Text } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 bg-[#0b0b0f] items-center justify-center px-6">
      <Text className="text-white text-2xl font-semibold">Главный экран</Text>
      <Text className="text-white/70 mt-2 text-base text-center">
        Здесь позже появится 3D-светлячок, квесты и «Хроники героя».
      </Text>
    </View>
  );
}
