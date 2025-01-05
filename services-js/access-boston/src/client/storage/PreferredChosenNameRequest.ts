import { View, PreferredChosenNameStep } from '../preferred-chosen-name/types';

const STEPS: PreferredChosenNameStep[] = [
  'welcome',
  'enterName',
  'approval',
  'success',
  'error',
];

export const getSteps = () => {
  return [...STEPS];
};

const VIEWS: View[] = [
  'welcomeView',
  'enterNameView',
  'approvalView',
  'successView',
  'errorView',
];
const VIEWSALT: View[] = ['welcomeView', 'enterNameView', 'successView'];

export const getViews = (alt?: boolean) => {
  const retViews = alt && alt === true ? [...VIEWSALT] : [...VIEWS];
  return retViews;
};
