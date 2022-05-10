import { View, IdentityVerificationStep } from '../../client/confirmid/types';

const STEPS: IdentityVerificationStep[] = [
  'enterId',
  'validate',
  'review',
  'success',
];

export const getSteps = () => {
  return [...STEPS];
};

const VIEWS: View[] = [
  'enterId',
  'validate',
  'review',
  'success',
  'failure',
  'quit',
];

export const getViews = () => {
  return [...VIEWS];
};
