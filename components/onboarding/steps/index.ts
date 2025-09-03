import type { OnboardingDraft } from '@/lib/store/profile';
import IdentityStep from './IdentityStep';
import RhythmStep from './RhythmStep';
import VoiceStep from './VoiceStep';
import ConsentStep from './ConsentStep';

export type StepDef = {
  key: 'identity' | 'rhythm' | 'voice' | 'consent';
  Component: React.ComponentType<{}>;
  validate: (d: OnboardingDraft) => boolean;
};

// утилита: валидное ли время формата HH:MM (00:00–23:59)
const isHHMM = (v?: string) => !!v && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

export const steps: StepDef[] = [
  {
    key: 'identity',
    Component: IdentityStep,
    validate: (d) => (d.displayName?.trim().length ?? 0) >= 2,
  },
  {
    key: 'rhythm',
    Component: RhythmStep,
    // Если уведомления включены — требуется хотя бы одно валидное время
    validate: (d) =>
      !d.notificationsOptIn || isHHMM(d.morningTime) || isHHMM(d.eveningTime),
  },
  {
    key: 'voice',
    Component: VoiceStep,
    // Требуем ОБА поля: обращение и тон
    validate: (d) =>
      (d.addressForm === 'ty' || d.addressForm === 'vy') &&
      (d.tone === 'warm' || d.tone === 'concise'),
  },
  {
    key: 'consent',
    Component: ConsentStep,
    validate: (d) => !!d.consentAccepted,
  },
];

export const TOTAL_STEPS = steps.length;
export default steps;
