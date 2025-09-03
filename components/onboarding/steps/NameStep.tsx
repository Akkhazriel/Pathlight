import { View, Text, TextInput } from 'react-native';
import { useProfile } from '@/lib/store/profile';

export default function NameStep() {
  const { draft, setDraft } = useProfile();
  return (
    <View>
      <Text className="text-white text-lg font-medium">Как тебя называть?</Text>
      <TextInput
        value={draft.displayName}
        onChangeText={(t) => setDraft({ displayName: t })}
        placeholder="Например, Алекс"
        placeholderTextColor="rgba(255,255,255,0.4)"
        className="mt-3 text-white rounded-xl border border-white/15 bg-white/5 px-4 py-3"
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
      />
      <Text className="text-white/50 text-xs mt-2">Имя можно поменять позже в профиле.</Text>
    </View>
  );
}
