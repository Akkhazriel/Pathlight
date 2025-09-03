import { View, Text, Pressable } from 'react-native';
import { useProfile } from '@/lib/store/profile';

export default function ConsentStep() {
  const { draft, setDraft } = useProfile();
  const accepted = draft.consentAccepted;
  return (
    <View>
      <Text className="text-white text-lg font-medium">Приватность</Text>
      <Text className="text-white/70 mt-2">
        По умолчанию данные хранятся локально. Синхронизацию и ИИ-анализ можно включить позже.
      </Text>
      <Pressable
        onPress={() => setDraft({ consentAccepted: !accepted })}
        className={`mt-4 rounded-xl px-4 py-3 border ${
          accepted ? 'bg-white/15 border-white/40' : 'bg-white/5 border-white/15'
        }`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
      >
        <Text className="text-white">
          {accepted ? '✓ ' : ''}Я согласен(а) с условиями использования и приватности
        </Text>
      </Pressable>
    </View>
  );
}
