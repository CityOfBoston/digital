export interface Progress {
  totalSteps: number;
  currentStep: number;
  currentStepCompleted: boolean;
  offset?: number | undefined;
}
