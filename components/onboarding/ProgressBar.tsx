// components/onboarding/ProgressBar.tsx
import { useEffect, useRef } from 'react';
import { View, Animated, Text } from 'react-native';

type Props = { currentStep: number; totalSteps: number };

export default function ProgressBar({ currentStep, totalSteps }: Props) {
  // Держим стабильный Animated.Value
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ratio = Math.max(0, Math.min(1, (currentStep + 1) / Math.max(1, totalSteps)));
    Animated.timing(progress, {
      toValue: ratio,
      duration: 220,
      useNativeDriver: false, // width не поддерживается native driver
    }).start();
  }, [currentStep, totalSteps, progress]); // ← добавили progress

  return (
    <View className="w-full max-w-md self-center mt-4">
      <Text className="text-white/70 text-xs mb-2">
        Шаг {currentStep + 1} из {totalSteps}
      </Text>
      <View className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <Animated.View
          style={{
            height: '100%',
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
            backgroundColor: '#C9F36D',
          }}
        />
      </View>
    </View>
  );
}
