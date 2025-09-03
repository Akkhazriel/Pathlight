import { View, Text } from "react-native";

export default function Profile() {
  return (
    <View className="flex-1 bg-[#0b0b0f] items-center justify-center px-6">
      <Text className="text-white text-2xl font-semibold">Профиль</Text>
      <Text className="text-white/70 mt-2 text-base text-center">
        Тут будут настройки и прогресс.
      </Text>
    </View>
  );
}
