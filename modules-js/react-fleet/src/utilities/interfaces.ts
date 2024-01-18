export interface stepObj {
  label: string;
  name?: string;
  uri?: string;
  completed?: boolean;
}

export interface Progress {
  totalSteps: number;
  currentStep: number;
  currentStepCompleted: boolean;
  offset?: number | undefined;
}
