import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function Welcome() {
  return (
    <View className="flex-1 bg-[#0b0b0f] items-center justify-center px-6">
      <View className="w-full max-w-md rounded-2xl bg-white/5 p-6 border border-white/10">
        <Text className="text-white text-3xl font-semibold">Pathlight</Text>
        <Text className="text-white/80 text-base mt-2">
          RPG-путь к себе. Светлячок-наставник, который помогает прокачивать жизнь.
        </Text>

        <Pressable
          onPress={() => router.push('/(onboarding)')}
          className="mt-4 rounded-2xl bg-white/10 border border-white/15"
        >
          <Text className="text-white text-center py-3 text-base font-medium">
            Начать
          </Text>
        </Pressable>
      </View>

      <Text className="text-white/50 text-xs mt-6">
        Магия загорается с первого шага ✨
      </Text>
    </View>
  );
}
