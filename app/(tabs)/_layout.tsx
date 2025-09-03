import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#111218", borderTopColor: "#222" },
        tabBarActiveTintColor: "#C9F36D",
        tabBarInactiveTintColor: "#9aa0a6",
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Главная" }} />
      <Tabs.Screen name="profile" options={{ title: "Профиль" }} />
    </Tabs>
  );
}
