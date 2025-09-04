import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAssistantUI } from '../state/uiStore';

export default function Bubble() {
  const { x, y, onScreen } = useAssistantUI((s) => s.fireflyScreen);
  const bubble = useAssistantUI((s) => s.bubble);

  if (!bubble.visible || !onScreen) return null;

  // Смещение пузыря относительно светлячка (чуть выше и вправо)
  const offsetX = 12;
  const offsetY = -28;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        { left: x + offsetX, top: y + offsetY },
      ]}
    >
      <View style={styles.bubble}>
        <Text style={styles.text} numberOfLines={3}>
          {bubble.text}
        </Text>
        <View style={styles.tail} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  bubble: {
    maxWidth: 260,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(20,20,24,0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 18,
  },
  tail: {
    position: 'absolute',
    width: 0,
    height: 0,
    bottom: -6,
    left: 12,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(20,20,24,0.92)',
  },
});
