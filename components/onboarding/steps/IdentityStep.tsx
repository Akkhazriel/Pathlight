import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Localization from 'expo-localization';
import { useProfile } from '@/lib/store/profile';

export default function IdentityStep() {
  // Берём только нужные поля + setDraft (без второго аргумента, чтобы не упереться в типы)
  const { fullName, displayName, city, timezone, locale, setDraft } = useProfile((s) => ({
    fullName: s.draft.fullName ?? '',
    displayName: s.draft.displayName,
    city: s.draft.city ?? '',
    timezone: s.draft.timezone,
    locale: s.draft.locale,
    setDraft: s.setDraft,
  }));

  const [detecting, setDetecting] = useState(false);

  // Детект по умолчанию
  const detectedLocale =
    Localization.getLocales?.()[0]?.languageTag ?? 'en-US';
  const detectedTimeZone =
    Localization.getCalendars?.()[0]?.timeZone ??
    Intl.DateTimeFormat().resolvedOptions().timeZone ??
    'UTC';

  // Автозаполнение locale/timezone и «имени для обращения» из полного имени
  useEffect(() => {
    if (!locale || !timezone) {
      setDraft({
        locale: locale ?? detectedLocale,
        timezone: timezone ?? detectedTimeZone,
      });
    }
    if (!displayName && fullName?.trim()) {
      const first = fullName.trim().split(/\s+/)[0];
      if (first) setDraft({ displayName: first });
    }
  }, [fullName, displayName, locale, timezone, detectedLocale, detectedTimeZone, setDraft]);

  const detectCity = useCallback(async () => {
    try {
      setDetecting(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Нет доступа к геолокации',
          'Разрешите доступ в настройках или введите город вручную.'
        );
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});
      const parts = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      const first = parts[0];
      const cityName = [first?.city || first?.subregion, first?.region]
        .filter(Boolean)
        .join(', ');

      setDraft({
        city: cityName || city,
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        timezone: detectedTimeZone,
        locale: detectedLocale,
      });
    } catch {
      Alert.alert('Не удалось определить город', 'Попробуйте позже или заполните вручную.');
    } finally {
      setDetecting(false);
    }
  }, [setDraft, detectedLocale, detectedTimeZone, city]);

  return (
    <View>
      <Text className="text-white text-lg font-medium">Как тебя зовут?</Text>
      <TextInput
        value={fullName}
        onChangeText={(t) => setDraft({ fullName: t })}
        placeholder="Полное имя (например, Алексей Иванов)"
        placeholderTextColor="rgba(255,255,255,0.4)"
        className="mt-3 text-white rounded-xl border border-white/15 bg-white/5 px-4 py-3"
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        textContentType="name"
        autoComplete="name"
      />

      <Text className="text-white text-lg font-medium mt-5">Как к тебе обращаться?</Text>
      <TextInput
        value={displayName}
        onChangeText={(t) => setDraft({ displayName: t })}
        placeholder="Имя для обращения (например, Алекс)"
        placeholderTextColor="rgba(255,255,255,0.4)"
        className="mt-3 text-white rounded-xl border border-white/15 bg-white/5 px-4 py-3"
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        textContentType="nickname"
        autoComplete="nickname"
      />
      <Text className="text-white/50 text-xs mt-2">
        Это имя будет использоваться в подсказках и интерфейсе.
      </Text>

      <Text className="text-white text-lg font-medium mt-6">Город</Text>
      <View className="mt-3">
        <TextInput
          value={city}
          onChangeText={(t) => setDraft({ city: t })}
          placeholder="Город"
          placeholderTextColor="rgba(255,255,255,0.4)"
          className="text-white rounded-xl border border-white/15 bg-white/5 px-4 py-3"
          autoCorrect={false}
          textContentType="addressCity"
          autoComplete="postal-address"
        />
        <Pressable
          onPress={detectCity}
          disabled={detecting}
          className="mt-3 rounded-xl bg-white/10 border border-white/15"
          accessibilityRole="button"
          accessibilityLabel="Определить город автоматически"
        >
          <Text className="text-white text-center py-3">
            {detecting ? 'Определяю…' : 'Определить автоматически'}
          </Text>
        </Pressable>
      </View>

      <Text className="text-white/60 text-xs mt-4">
        Часовой пояс: {timezone ?? detectedTimeZone} · Локаль: {locale ?? detectedLocale}
      </Text>
    </View>
  );
}
