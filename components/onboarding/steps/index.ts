import type { OnboardingDraft } from '@/lib/store/profile';
import NameStep from './NameStep';
import NotificationsStep from './NotificationsStep';
import ConsentStep from './ConsentStep';

export type StepDef = {
  key: string;
  Component: React.FC;
  validate: (d: OnboardingDraft) => boolean;
};

export const steps: StepDef[] = [
  { key: 'name', Component: NameStep, validate: (d) => d.displayName.trim().length >= 2 },
  { key: 'notifications', Component: NotificationsStep, validate: () => true },
  { key: 'consent', Component: ConsentStep, validate: (d) => d.consentAccepted },
];
