export interface ProgressProps {
  totalSteps: number;
  currentStep: number;
  currentStepCompleted: boolean;
  offset?: number | undefined;
  showStepName?: string;
}
