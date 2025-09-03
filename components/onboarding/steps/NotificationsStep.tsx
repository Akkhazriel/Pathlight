import { View, Text, Switch } from 'react-native';
import { useProfile } from '@/lib/store/profile';

export default function NotificationsStep() {
  const { draft, setDraft } = useProfile();
  return (
    <View>
      <Text className="text-white text-lg font-medium">Уведомления</Text>
      <Text className="text-white/70 mt-2">Включить мягкие напоминания утром и вечером?</Text>
      <View className="mt-4 flex-row items-center justify-between">
        <Text className="text-white">Напоминания</Text>
        <Switch
          value={draft.notificationsOptIn}
          onValueChange={(v) => setDraft({ notificationsOptIn: v })}
        />
      </View>
      <Text className="text-white/50 text-xs mt-2">
        Максимум два уведомления в день. Всегда можно изменить позже.
      </Text>
    </View>
  );
}
