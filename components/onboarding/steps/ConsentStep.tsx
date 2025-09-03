import React, { memo, useCallback } from 'react';
import { View, Text, Switch, Pressable } from 'react-native';
import { useProfile } from '@/lib/store/profile';
import { shallow } from 'zustand/shallow';

// Универсальная чип-кнопка (мемоизирована)
const Chip = memo(function Chip({
  label,
  selected,
  onPress,
  disabled,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      className={`rounded-2xl px-4 py-3 border ${
        selected ? 'bg-white/15 border-white/40' : 'bg-white/5 border-white/15'
      } ${disabled ? 'opacity-50' : ''}`}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      accessibilityLabel={label}
      accessibilityHint={disabled ? 'Недоступно для выбора' : undefined}
    >
      <Text className="text-white">{label}</Text>
    </Pressable>
  );
});

export default function ConsentStep() {
  // Забираем только нужные поля из стора, чтобы не дергать ререндер по каждому draft-полю
  const {
    consentAccepted,
    cloudSync,
    analyticsOptIn,
    aiScope,
    securityLock,
    setDraft,
  } = useProfile(
    (s) => ({
      consentAccepted: s.draft.consentAccepted,
      cloudSync: s.draft.cloudSync,
      analyticsOptIn: s.draft.analyticsOptIn,
      aiScope: s.draft.aiScope,
      securityLock: s.draft.securityLock,
      setDraft: s.setDraft,
    }),
    shallow
  );

  // Переключатели — стабильные ссылки
  const toggleConsent = useCallback(
    () => setDraft({ consentAccepted: !consentAccepted }),
    [consentAccepted, setDraft]
  );

  const toggleCloud = useCallback(
    (v: boolean) =>
      setDraft({
        cloudSync: v,
        // если выключаем синк — оставляем безопасный минимум
        aiScope: v ? aiScope ?? 'summaries' : 'summaries',
      }),
    [aiScope, setDraft]
  );

  const toggleAnalytics = useCallback(
    (v: boolean) => setDraft({ analyticsOptIn: v }),
    [setDraft]
  );

  const setScopeSummaries = useCallback(
    () => setDraft({ aiScope: 'summaries' }),
    [setDraft]
  );

  const setScopeNotes = useCallback(
    () => setDraft({ aiScope: 'summaries_and_notes' }),
    [setDraft]
  );

  const selectNoLock = useCallback(
    () => setDraft({ securityLock: 'none' }),
    [setDraft]
  );

  const selectBiometric = useCallback(
    () => setDraft({ securityLock: 'biometric' }),
    [setDraft]
  );

  return (
    <View>
      <Text className="text-white text-lg font-medium">Приватность и согласия</Text>
      <Text className="text-white/70 mt-2">
        По умолчанию данные хранятся локально. Синхронизацию и объём контекста для ИИ можно
        настроить ниже.
      </Text>

      {/* Обязательное согласие */}
      <Pressable
        onPress={toggleConsent}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className={`mt-4 rounded-xl px-4 py-3 border ${
          consentAccepted ? 'bg-white/15 border-white/40' : 'bg-white/5 border-white/15'
        }`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: consentAccepted }}
        accessibilityLabel="Согласие с условиями использования и приватности"
      >
        <Text className="text-white">
          {consentAccepted ? '✓ ' : ''}Я согласен(а) с условиями использования и приватности
        </Text>
      </Pressable>

      {/* Синхронизация и аналитика */}
      <View className="mt-6 gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-white">Синхронизация в облако</Text>
          <Switch
            value={cloudSync}
            onValueChange={toggleCloud}
            accessibilityLabel="Переключить синхронизацию в облако"
          />
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-white">Аналитика (анонимно)</Text>
          <Switch
            value={analyticsOptIn}
            onValueChange={toggleAnalytics}
            accessibilityLabel="Включить анонимную аналитику"
          />
        </View>
      </View>

      {/* Объём данных для ИИ (доступен, если включён синк) */}
      <View className="mt-6">
        <Text className="text-white/80 mb-2">Данные, доступные ИИ</Text>
        <View className="flex-row gap-3">
          <Chip
            label="Только сводки"
            selected={aiScope === 'summaries'}
            onPress={setScopeSummaries}
            disabled={!cloudSync}
          />
          <Chip
            label="Сводки + заметки"
            selected={aiScope === 'summaries_and_notes'}
            onPress={setScopeNotes}
            disabled={!cloudSync}
          />
        </View>
        {!cloudSync && (
          <Text className="text-white/40 text-xs mt-2">
            Включите синхронизацию, чтобы изменить объём данных для ИИ.
          </Text>
        )}
      </View>

      {/* Безопасность */}
      <View className="mt-6">
        <Text className="text-white/80 mb-2">Защита приложения</Text>
        <View className="flex-row gap-3">
          <Chip
            label="Без блокировки"
            selected={securityLock === 'none'}
            onPress={selectNoLock}
          />
          <Chip
            label="Биометрия"
            selected={securityLock === 'biometric'}
            onPress={selectBiometric}
          />
        </View>
      </View>

      <Text className="text-white/40 text-xs mt-6">
        Эти настройки можно поменять позже в Профиле.
      </Text>
    </View>
  );
}
