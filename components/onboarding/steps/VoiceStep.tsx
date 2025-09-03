import React, { useEffect, useCallback, memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useProfile } from '@/lib/store/profile';
import type { OnboardingDraft } from '@/lib/store/profile';

// Мемо-чип с увеличенной зоной тапа и a11y-хинтами
const Chip = memo(function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      className={`rounded-2xl px-4 py-3 border ${
        selected ? 'bg-white/15 border-white/40' : 'bg-white/5 border-white/15'
      }`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <Text className="text-white">{label}</Text>
    </Pressable>
  );
});

export default function VoiceStep() {
  // Берём только нужные поля + setDraft, чтобы не триггерить лишние ререндеры
  const { addressForm, tone, setDraft } = useProfile((s) => ({
    addressForm: s.draft.addressForm,
    tone: s.draft.tone,
    setDraft: s.setDraft,
  }));

  // Санитация и дефолты на маунте (защита от «битого» кэша)
  useEffect(() => {
    const patch: Partial<OnboardingDraft> = {};
    if (addressForm !== 'ty' && addressForm !== 'vy') patch.addressForm = 'ty';
    if (tone !== 'warm' && tone !== 'concise') patch.tone = 'warm';
    if (Object.keys(patch).length) setDraft(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Стабильные обработчики — меньше перерисовок Chip
  const selectTy = useCallback(() => setDraft({ addressForm: 'ty' }), [setDraft]);
  const selectVy = useCallback(() => setDraft({ addressForm: 'vy' }), [setDraft]);
  const selectWarm = useCallback(() => setDraft({ tone: 'warm' }), [setDraft]);
  const selectConcise = useCallback(() => setDraft({ tone: 'concise' }), [setDraft]);

  return (
    <View>
      <Text className="text-white text-lg font-medium">Как к тебе обращаться?</Text>
      <View className="mt-3 flex-row gap-3">
        <Chip label="На ты" selected={addressForm === 'ty'} onPress={selectTy} />
        <Chip label="На вы" selected={addressForm === 'vy'} onPress={selectVy} />
      </View>

      <Text className="text-white/70 mt-6">Предпочитаемый тон</Text>
      <View className="mt-3 flex-row gap-3">
        <Chip label="Тепло" selected={tone === 'warm'} onPress={selectWarm} />
        <Chip label="Коротко и вежливо" selected={tone === 'concise'} onPress={selectConcise} />
      </View>
    </View>
  );
}
