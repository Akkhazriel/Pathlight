import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  LayoutChangeEvent,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAssistantUI } from '../state/uiStore';
import { assistantBus } from '../bus';
import { AnchorRegistry } from '../anchors/AnchorRegistry';

const H_MARGIN = 12;         // отступы от краёв экрана
const V_MARGIN = 12;
const TARGET_OFFSET_X = 12;  // базовый сдвиг от точки (светлячка/якоря) по X
const TARGET_OFFSET_Y = 28;  // базовый сдвиг по Y (вверх/вниз)
const MAX_WIDTH = 280;

export default function Bubble() {
  // подписка на speaking/hideBubble — один раз при монтировании
  const showBubble = useAssistantUI((s) => s.showBubble);
  const hideBubble = useAssistantUI((s) => s.hideBubble);

  useEffect(() => {
    const offSpeak = assistantBus.on('agent:speaking', ({ text }) => showBubble(text));
    const offHide = assistantBus.on('agent:hideBubble', () => hideBubble());
    const offListen = assistantBus.on('agent:listening', () => showBubble('Слушаю тебя…'));
    const offGreet = assistantBus.on('agent:greet', () => showBubble('Привет! Я рядом ✨'));
    return () => {
      offSpeak(); offHide(); offListen(); offGreet();
    };
  }, [showBubble, hideBubble]);

  const { width: screenW, height: screenH } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const firefly = useAssistantUI((s) => s.fireflyScreen);
  const bubble = useAssistantUI((s) => s.bubble);

  // размеры пузыря после layout
  const [bubbleW, setBubbleW] = useState<number>(180);
  const [bubbleH, setBubbleH] = useState<number>(48);
  // флаг, что размеры измерены (чтобы не мигал при первом появлении)
  const [measured, setMeasured] = useState(false);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      if (bubbleW !== width) setBubbleW(width);
      if (bubbleH !== height) setBubbleH(height);
      if (!measured) setMeasured(true);
    }
  };

  // Если указан anchorId, берём его координаты, иначе — координаты светлячка
  const anchorPt = bubble.anchorId ? AnchorRegistry.get(bubble.anchorId) : null;
  const srcX = anchorPt?.x ?? firefly.x;
  const srcY = anchorPt?.y ?? firefly.y;
  const srcOnScreen = (anchorPt ? true : firefly.onScreen);

  // решаем, где располагать пузырь: сверху или снизу от точки
  const placeAbove = srcY > screenH * 0.6;

  // базовая целевая позиция (до клэмпа)
  const targetLeft = srcX + TARGET_OFFSET_X;
  const targetTop = placeAbove ? srcY - TARGET_OFFSET_Y - bubbleH : srcY + TARGET_OFFSET_Y;

  // видимая область с учётом safe-area
  const minX = insets.left + H_MARGIN;
  const maxX = screenW - insets.right - H_MARGIN - bubbleW;
  const minY = insets.top + V_MARGIN;
  const maxY = screenH - insets.bottom - V_MARGIN - bubbleH;

  // клэмп по экрану
  const left = Math.min(Math.max(targetLeft, minX), Math.max(minX, maxX));
  const top  = Math.min(Math.max(targetTop,  minY), Math.max(minY, maxY));

  // хвост: где «указать» внутри пузыря
  const tailOnTop = !placeAbove; // если пузырь под точкой — хвост сверху
  const tailOffsetX = useMemo(() => {
    const desired = srcX - left;
    const safe = Math.max(12, Math.min(bubbleW - 12, desired));
    return Math.round(safe);
  }, [srcX, left, bubbleW]);

  // анимация появления/скрытия
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.98)).current;

  const visible = bubble.visible && srcOnScreen;

  useEffect(() => {
    // лёгкий fade/scale — не используем тяжёлые анимации
    Animated.parallel([
      Animated.timing(opacity, { toValue: visible ? 1 : 0, duration: 140, useNativeDriver: true }),
      Animated.spring(scale,   { toValue: visible ? 1 : 0.98, friction: 7, tension: 100, useNativeDriver: true }),
    ]).start();
  }, [visible, opacity, scale]);

  // Если не видно вообще — не рендерим
  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          left,
          top,
          maxWidth: MAX_WIDTH,
          opacity,
          transform: [{ scale }],
        },
      ]}
      // чтобы не было скачка позиции в первый раз — можно не считать layout до появления
      onLayout={handleLayout}
    >
      <View style={styles.bubble}>
        <Text style={styles.text} numberOfLines={5}>
          {bubble.text}
        </Text>

        {/* Хвост */}
        <View
          style={[
            styles.tailBase,
            tailOnTop ? styles.tailTop : styles.tailBottom,
            { left: tailOffsetX - 6 },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  bubble: {
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
    maxWidth: MAX_WIDTH,
  },
  tailBase: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  tailTop: {
    top: -6,
    borderBottomWidth: 6,
    borderBottomColor: 'rgba(20,20,24,0.92)',
  },
  tailBottom: {
    bottom: -6,
    borderTopWidth: 6,
    borderTopColor: 'rgba(20,20,24,0.92)',
  },
});
