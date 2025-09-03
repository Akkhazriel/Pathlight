// lib/store/profile.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Profile = {
  id: string;
  displayName: string;
  timezone?: string;
  locale?: string;
  createdAt: string;
  updatedAt: string;
};

// Шаги онбординга (можно расширять позже)
export type OnboardingStep = 0 | 1 | 2;

// Черновик данных, которые набираем по шагам
export type OnboardingDraft = {
  displayName: string;
  notificationsOptIn: boolean;
  consentAccepted: boolean;
  timezone?: string;
  locale?: string;
};

type ProfileState = {
  profile: Profile | null;
  onboarded: boolean;
  draft: OnboardingDraft;
  currentStep: OnboardingStep;

  // profile actions
  setProfile: (p: Omit<Profile, 'createdAt' | 'updatedAt'>) => void;
  setOnboarded: (v: boolean) => void;

  // onboarding actions
  setDraft: (patch: Partial<OnboardingDraft>) => void;
  setStep: (s: OnboardingStep) => void;
  clearDraft: () => void;

  reset: () => void;
};

const defaultDraft: OnboardingDraft = {
  displayName: '',
  notificationsOptIn: false,
  consentAccepted: false,
  timezone: undefined,
  locale: undefined,
};

export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      onboarded: false,
      draft: defaultDraft,
      currentStep: 0,

      setProfile: (p) =>
        set(() => ({
          profile: {
            ...p,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        })),
      setOnboarded: (v) => set({ onboarded: v }),

      setDraft: (patch) => set({ draft: { ...get().draft, ...patch } }),
      setStep: (s) => set({ currentStep: s }),
      clearDraft: () => set({ draft: defaultDraft, currentStep: 0 }),

      reset: () => set({ profile: null, onboarded: false, draft: defaultDraft, currentStep: 0 }),
    }),
    {
      name: 'pathlight.profile',
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
      migrate: async (state: any, version) => {
        if (!state) return state;
        // v2 -> v3: добавляем draft и currentStep, выбрасываем возможный устаревший archetype
        if (version < 3) {
          const draft = { ...defaultDraft };
          const currentStep = 0;
          const prof = state.profile || null;
          if (prof && 'archetype' in prof) {
            const { archetype, ...rest } = prof;
            return { ...state, profile: rest, draft, currentStep };
          }
          return { ...state, draft, currentStep };
        }
        return state;
      },
    }
  )
);
