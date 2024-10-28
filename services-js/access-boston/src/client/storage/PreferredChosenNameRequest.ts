import { View, PreferredChosenNameStep } from '../preferred-chosen-name/types';

const STEPS: PreferredChosenNameStep[] = ['intro', 'form', 'review', 'success'];

export const getSteps = () => {
  return [...STEPS];
};

const VIEWS: View[] = ['intro', 'form', 'verify', 'success'];

export const getViews = () => {
  return [...VIEWS];
};
