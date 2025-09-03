import { View, Text, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { steps } from '@/components/onboarding/steps';
import { useProfile } from '@/lib/store/profile';

// простая локальная генерация id; позже заменим на uuid/ulid
const genId = () => 'local-' + Math.random().toString(36).slice(2, 10);

const TOTAL_STEPS = steps.length;

export default function Onboarding() {
  const { draft, currentStep, setStep, setProfile, setOnboarded } = useProfile();
  const StepComponent = steps[currentStep].Component;
  const canProceed = steps[currentStep].validate(draft);

  const onBack = () => {
    if (currentStep === 0) return router.back();
    setStep((currentStep - 1) as any);
  };

  const onNext = () => {
    if (!canProceed) {
      if (steps[currentStep].key === 'name') Alert.alert('Введите имя', 'Минимум 2 символа.');
      if (steps[currentStep].key === 'consent') Alert.alert('Согласие', 'Нужно подтвердить согласие.');
      return;
    }
    if (currentStep < TOTAL_STEPS - 1) {
      setStep((currentStep + 1) as any);
    } else {
      // финал: переносим черновик в профиль
      const name = draft.displayName.trim();
      setProfile({
        id: genId(),
        displayName: name,
        timezone: draft.timezone,
        locale: draft.locale,
      });
      setOnboarded(true);
      router.replace('/(tabs)/home');
    }
  };

  return (
    <View className="flex-1 bg-[#0b0b0f] px-6 pt-10">
      <Text className="text-white text-3xl font-semibold">Давай познакомимся</Text>
      <Text className="text-white/70 mt-2">Несколько быстрых шагов — и мы готовы начать.</Text>

      <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <View className="w-full max-w-md self-center mt-6 rounded-2xl bg-white/5 p-6 border border-white/10">
        <StepComponent />
      </View>

      <View className="w-full max-w-md self-center mt-6 flex-row gap-12">
        <Pressable onPress={onBack} className="flex-1 rounded-2xl bg-white/5 border border-white/15">
          <Text className="text-white text-center py-3 text-base">Назад</Text>
        </Pressable>
        <Pressable
          onPress={onNext}
          disabled={!canProceed}
          className={`flex-1 rounded-2xl border ${
            canProceed ? 'bg-white/10 border-white/15' : 'bg-white/5 border-white/10 opacity-60'
          }`}
        >
          <Text className="text-white text-center py-3 text-base">
            {currentStep < TOTAL_STEPS - 1 ? 'Далее' : 'Завершить'}
          </Text>
        </Pressable>
      </View>

      <Text className="text-white/40 text-xs mt-4 self-center">Всё можно поменять в настройках позже.</Text>
    </View>
  );
}
