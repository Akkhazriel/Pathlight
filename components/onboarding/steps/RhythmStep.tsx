import React, { useCallback } from 'react';
import { View, Text, Switch, TextInput } from 'react-native';
import { useProfile } from '@/lib/store/profile';

// простая маска времени: оставляем цифры и автоматически вставляем двоеточие
function maskHHMM(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export default function RhythmStep() {
  // забираем только нужные поля + setDraft (без второго аргумента для совместимости)
  const {
    quietStart,
    quietEnd,
    notificationsOptIn,
    morningTime,
    eveningTime,
    setDraft,
  } = useProfile((s) => ({
    quietStart: s.draft.quietHours?.start ?? '',
    quietEnd: s.draft.quietHours?.end ?? '',
    notificationsOptIn: s.draft.notificationsOptIn,
    morningTime: s.draft.morningTime ?? '',
    eveningTime: s.draft.eveningTime ?? '',
    setDraft: s.setDraft,
  }));

  const setQuietStart = useCallback(
    (t: string) => {
      const v = maskHHMM(t);
      setDraft({ quietHours: { start: v, end: quietEnd || undefined } });
    },
    [quietEnd, setDraft]
  );

  const setQuietEnd = useCallback(
    (t: string) => {
      const v = maskHHMM(t);
      setDraft({ quietHours: { end: v, start: quietStart || undefined } });
    },
    [quietStart, setDraft]
  );

  const setMorning = useCallback(
    (t: string) => setDraft({ morningTime: maskHHMM(t) }),
    [setDraft]
  );
  const setEvening = useCallback(
    (t: string) => setDraft({ eveningTime: maskHHMM(t) }),
    [setDraft]
  );

  const toggleNotifications = useCallback(
    (v: boolean) => {
      // если включили и оба времени пустые — подставим мягкие дефолты
      if (v && !morningTime && !eveningTime) {
        setDraft({ notificationsOptIn: v, morningTime: '08:30', eveningTime: '20:00' });
      } else {
        setDraft({ notificationsOptIn: v });
      }
    },
    [eveningTime, morningTime, setDraft]
  );

  return (
    <View>
      <Text className="text-white text-lg font-medium">Ритм и уведомления</Text>
      <Text className="text-white/70 mt-2">Укажи тихие часы и напоминания.</Text>

      {/* Тихие часы */}
      <View className="mt-4">
        <Text className="text-white/80 mb-2">Тихие часы (не беспокоить)</Text>
        <View className="flex-row gap-3">
          <TextInput
            value={quietStart}
            onChangeText={setQuietStart}
            placeholder="Начало (напр. 22:30)"
            placeholderTextColor="rgba(255,255,255,0.4)"
            className="flex-1 text-white rounded-xl border border-white/15 bg-white/5 px-4 py-3"
            keyboardType="number-pad"
            maxLength={5}
            accessibilityLabel="Начало тихих часов"
          />
          <TextInput
            value={quietEnd}
            onChangeText={setQuietEnd}
            placeholder="Конец (напр. 07:30)"
            placeholderTextColor="rgba(255,255,255,0.4)"
            className="flex-1 text-white rounded-xl border border-white/15 bg-white/5 px-4 py-3"
            keyboardType="number-pad"
            maxLength={5}
            accessibilityLabel="Конец тихих часов"
          />
        </View>
        <Text className="text-white/50 text-xs mt-2">
          Формат времени: HH:MM. Можно настроить позже.
        </Text>
      </View>

      {/* Уведомления */}
      <View className="mt-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-white">Включить напоминания</Text>
          <Switch
            value={notificationsOptIn}
            onValueChange={toggleNotifications}
            accessibilityLabel="Переключатель напоминаний"
          />
        </View>

        {notificationsOptIn && (
          <View className="mt-3 flex-row gap-3">
            <TextInput
              value={morningTime}
              onChangeText={setMorning}
              placeholder="Утро (напр. 08:30)"
              placeholderTextColor="rgba(255,255,255,0.4)"
              className="flex-1 text-white rounded-xl border border-white/15 bg-white/5 px-4 py-3"
              keyboardType="number-pad"
              maxLength={5}
              accessibilityLabel="Время утреннего напоминания"
            />
            <TextInput
              value={eveningTime}
              onChangeText={setEvening}
              placeholder="Вечер (напр. 20:00)"
              placeholderTextColor="rgba(255,255,255,0.4)"
              className="flex-1 text-white rounded-xl border border-white/15 bg-white/5 px-4 py-3"
              keyboardType="number-pad"
              maxLength={5}
              accessibilityLabel="Время вечернего напоминания"
            />
          </View>
        )}
      </View>
    </View>
  );
}
