import { create } from 'zustand';

type BubbleState = {
  visible: boolean;
  text: string;
};

type ScreenPoint = {
  x: number; // пиксели
  y: number; // пиксели
  onScreen: boolean;
};

type UIStore = {
  fireflyScreen: ScreenPoint;
  setFireflyScreen: (p: ScreenPoint) => void;

  bubble: BubbleState;
  showBubble: (text: string) => void;
  hideBubble: () => void;
  setBubbleText: (text: string) => void;
};

export const useAssistantUI = create<UIStore>((set) => ({
  fireflyScreen: { x: 0, y: 0, onScreen: false },
  setFireflyScreen: (p) => set({ fireflyScreen: p }),

  bubble: { visible: false, text: '' },
  showBubble: (text) => set({ bubble: { visible: true, text } }),
  hideBubble: () => set((s) => ({ bubble: { ...s.bubble, visible: false } })),
  setBubbleText: (text) => set((s) => ({ bubble: { ...s.bubble, text } })),
}));
