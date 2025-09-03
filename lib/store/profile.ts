// lib/store/profile.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Вспомогательные типы */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Mon (ISO)
export type TimeHM = string;                      // 'HH:mm'
export type TimeWindow = { start: TimeHM; end: TimeHM };

export type NotificationSettings = {
  enabled: boolean;
  morningTime?: TimeHM;
  eveningTime?: TimeHM;
  frequency: 'low' | 'normal';
  quietHours?: TimeWindow;
  activeDays?: Weekday[];
};

export type PrivacySettings = {
  cloudSync: boolean; // по умолчанию выкл
  aiScope: 'summaries' | 'summaries_and_notes';
  analyticsOptIn: boolean;
};

export type SecuritySettings = {
  lock: 'none' | 'biometric';
};

export type UiPreferences = {
  theme: 'system' | 'dark' | 'light';
  textSize: 'normal' | 'large';
  haptics: boolean;
  tone: 'warm' | 'concise';
  addressForm: 'ty' | 'vy';
  format24h: boolean;
  weekStartsOn: Weekday;
};

export type FocusSettings = {
  tags: string[];          // оставим на потом
  starterHabits: string[]; // оставим на потом
};

/** Профиль (финальные данные) */
export type Profile = {
  id: string;
  displayName: string;     // Имя для обращения в UI
  fullName?: string;       // Полное имя (опционально)
  city?: string;
  lat?: number;
  lon?: number;
  locale?: string;
  timezone?: string;
  createdAt: string;
  updatedAt: string;

  notifications: NotificationSettings;
  privacy: PrivacySettings;
  security: SecuritySettings;
  preferences: UiPreferences;
  focus: FocusSettings;
};

/** Черновик онбординга (то, что копим по шагам) */
export type OnboardingDraft = {
  // Шаг 1
  fullName?: string;
  displayName: string;
  city?: string;
  lat?: number;
  lon?: number;
  locale?: string;
  timezone?: string;
  format24h?: boolean;
  weekStartsOn?: Weekday;

  // Шаг 2
  notificationsOptIn: boolean;
  morningTime?: TimeHM;
  eveningTime?: TimeHM;
  quietHours?: TimeWindow;

  // Шаг 3
  addressForm?: 'ty' | 'vy';
  tone?: 'warm' | 'concise';

  // Шаг 4
  consentAccepted: boolean;
  cloudSync: boolean;
  aiScope: 'summaries' | 'summaries_and_notes';
  analyticsOptIn: boolean;
  securityLock: 'none' | 'biometric';
};

export type OnboardingStep = 0 | 1 | 2 | 3;

type ProfileState = {
  profile: Profile | null;
  onboarded: boolean;
  draft: OnboardingDraft;
  currentStep: OnboardingStep;
  setProfile: (p: Omit<Profile, 'createdAt' | 'updatedAt'>) => void;
  setOnboarded: (v: boolean) => void;
  setDraft: (patch: Partial<OnboardingDraft>) => void;
  setStep: (s: OnboardingStep) => void;
  clearDraft: () => void;
  reset: () => void;
};

const defaultDraft: OnboardingDraft = {
  displayName: '',
  notificationsOptIn: false,
  consentAccepted: false,
  cloudSync: false,
  aiScope: 'summaries',
  analyticsOptIn: false,
  securityLock: 'none',
  addressForm: 'ty',
  tone: 'warm',
  format24h: true,
  weekStartsOn: 0,
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
      reset: () =>
        set({ profile: null, onboarded: false, draft: defaultDraft, currentStep: 0 }),
    }),
    {
      name: 'pathlight.profile',
      storage: createJSONStorage(() => AsyncStorage),
      version: 4,
      migrate: async (state: any, version) => {
        if (!state) return state;
        // простая миграция: добавим недостающие поля в draft, удалим рудименты, сохраним profile как есть
        if (version < 4) {
          return {
            ...state,
            draft: { ...defaultDraft, ...(state.draft ?? {}) },
            currentStep: state.currentStep ?? 0,
          };
        }
        return state;
      },
    }
  )
);
