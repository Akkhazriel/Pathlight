import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, StyleSheet } from 'react-native';
import { StatusBar } from "expo-status-bar";
import AssistantCanvas from './(core)/assistant/AssistantCanvas';
import Bubble from './(core)/assistant/ui/Bubble';
import '../global.css';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0b0b0f" },
            animation: 'fade'
          }}
        />
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <AssistantCanvas />
          <Bubble />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
