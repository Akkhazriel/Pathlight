import 'react-native-get-random-values';

import { View, Text, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { ulid } from 'ulid';
import * as Localization from 'expo-localization';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { steps } from '@/components/onboarding/steps';
import { useProfile } from '@/lib/store/profile';
import { useEffect } from 'react';

const TOTAL_STEPS = steps.length;

export default function Onboarding() {
  const { draft, currentStep, setStep, setProfile, setOnboarded } = useProfile();

  // страховка: при заходе в онбординг начинаем с первого шага
  useEffect(() => {
    if (currentStep !== 0) setStep(0);
  }, []); // один раз при монтировании

  const StepComponent = steps[currentStep].Component;
  const canProceed = steps[currentStep].validate(draft);

  const onBack = () => {
    if (currentStep === 0) return router.back();
    setStep(((currentStep - 1) as unknown) as any);
  };

  const onNext = () => {
    if (!canProceed) {
      const key = steps[currentStep].key;
      if (key === 'identity') Alert.alert('Введите имя', 'Минимум 2 символа.');
      if (key === 'consent') Alert.alert('Согласие', 'Нужно подтвердить согласие.');
      return;
    }

    if (currentStep < TOTAL_STEPS - 1) {
      setStep(((currentStep + 1) as unknown) as any);
      return;
    }

    // ---- Финализация: draft → profile ----
    const detectedLocale =
      Localization.getLocales?.()[0]?.languageTag ??
      'en-US';

    const detectedTimeZone =
      Localization.getCalendars?.()[0]?.timeZone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone ??
      'UTC';

    const quiet =
      draft.quietHours?.start && draft.quietHours?.end
        ? { start: draft.quietHours.start, end: draft.quietHours.end }
        : undefined;

    setProfile({
      id: ulid(),
      displayName: draft.displayName.trim(),
      fullName: draft.fullName?.trim() || undefined,
      city: draft.city,
      lat: draft.lat,
      lon: draft.lon,
      locale: draft.locale ?? detectedLocale,
      timezone: draft.timezone ?? detectedTimeZone,

      notifications: {
        enabled: draft.notificationsOptIn,
        morningTime: draft.morningTime,
        eveningTime: draft.eveningTime,
        frequency: 'low',
        quietHours: quiet,
        activeDays: undefined,
      },
      privacy: {
        cloudSync: draft.cloudSync,
        aiScope: draft.aiScope ?? 'summaries',
        analyticsOptIn: draft.analyticsOptIn,
      },
      security: { lock: draft.securityLock ?? 'none' },
      preferences: {
        theme: 'system',
        textSize: 'normal',
        haptics: true,
        tone: draft.tone ?? 'warm',
        addressForm: draft.addressForm ?? 'ty',
        format24h: draft.format24h ?? true,
        weekStartsOn: draft.weekStartsOn ?? 0,
      },
      focus: { tags: [], starterHabits: [] },
    });

    setOnboarded(true);
    router.replace('/(tabs)/home');
  };

  return (
    <View className="flex-1 bg-[#0b0b0f] px-6 pt-10">
      <Text className="text-white text-3xl font-semibold">Давай познакомимся</Text>
      <Text className="text-white/70 mt-2">Несколько шагов — и мы готовы начать.</Text>

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
          className={`flex-1 rounded-2xl border ${canProceed ? 'bg-white/10 border-white/15' : 'bg-white/5 border-white/10 opacity-60'
            }`}
        >
          <Text className="text-white text-center py-3 text-base">
            {currentStep < TOTAL_STEPS - 1 ? 'Далее' : 'Завершить'}
          </Text>
        </Pressable>
      </View>

      <Text className="text-white/40 text-xs mt-4 self-center">
        Всё можно поменять в настройках позже.
      </Text>
    </View>
  );
}
