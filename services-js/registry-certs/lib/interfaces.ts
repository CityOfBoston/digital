export interface ProgressProps {
  totalSteps: number;
  currentStep: number;
  currentStepCompleted: boolean;
  offset?: number | undefined;
  showStepName?: string;
}

export interface ProgressNavProps {
  steps: Array<string>;
  totalSteps: number;
  currentStep: number;
  showStepName?: boolean;
  offset?: number;
  completed?: Array<number>;
  clickHandler?: ((e: any) => void) | undefined;
  blockStepBackAfterLastNav?: boolean;
}
