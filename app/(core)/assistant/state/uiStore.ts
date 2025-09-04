import { create } from 'zustand';

type BubbleState = {
  visible: boolean;
  text: string;
  anchorId?: string | null; // к чему привязан пузырь (опц.)
};

type ScreenPoint = {
  x: number; // экранные пиксели
  y: number;
  onScreen: boolean;
};

type UIStore = {
  fireflyScreen: ScreenPoint;
  setFireflyScreen: (p: ScreenPoint) => void;

  bubble: BubbleState;
  showBubble: (text: string, opts?: { anchorId?: string | null; autoHideMs?: number }) => void;
  hideBubble: () => void;
  setBubble: (patch: Partial<BubbleState>) => void;
};

export const useAssistantUI = create<UIStore>((set) => ({
  fireflyScreen: { x: 0, y: 0, onScreen: false },
  setFireflyScreen: (p) => set({ fireflyScreen: p }),

  bubble: { visible: false, text: '', anchorId: null },

  showBubble: (text, opts) => {
    set({
      bubble: {
        visible: true,
        text,
        anchorId: opts?.anchorId ?? null,
      },
    });

    if (opts?.autoHideMs) {
      setTimeout(() => {
        set((s) => ({ bubble: { ...s.bubble, visible: false } }));
      }, opts.autoHideMs);
    }
  },

  hideBubble: () =>
    set((s) => ({
      bubble: { ...s.bubble, visible: false },
    })),

  setBubble: (patch) =>
    set((s) => ({
      bubble: { ...s.bubble, ...patch },
    })),
}));
