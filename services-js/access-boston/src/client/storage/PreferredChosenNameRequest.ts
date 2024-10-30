import { View, PreferredChosenNameStep } from '../preferred-chosen-name/types';

const STEPS: PreferredChosenNameStep[] = [
  'welcome',
  'enterName',
  'approval',
  'success',
];

export const getSteps = () => {
  return [...STEPS];
};

const VIEWS: View[] = [
  'welcomeView',
  'enterNameView',
  'approvalView',
  'successView',
];

export const getViews = () => {
  return [...VIEWS];
};
