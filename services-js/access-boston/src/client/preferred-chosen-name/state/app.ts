/* eslint no-console: 0 */

import {
  View,
  CommonAttributes,
  PreferredChosenNameInformation,
} from '../types';
import { getViews } from '../../storage/PreferredChosenNameRequest';

export const AppTitle: string = 'Preferred / Chosen Name';
export type ActionTypes = 'APP/CHANGE_VIEW' | 'APP/RESET_STATE';

interface Action {
  type: ActionTypes;
  view: View;
  payload: CommonAttributes;
  altWorkflow: boolean;
}

export const initialState = new PreferredChosenNameInformation();
// export const completedStates = {
//   welcome: false,
//   enterName: false,
//   approval: false,
//   success: false,
// };

export const newInitState = {
  ...initialState,
  // ...completedStates,
};

export const reducer = (state: any, action: Partial<Action>) => {
  const startingState = newInitState;
  const fetchedViews: Array<string> = getViews();

  switch (action.type) {
    case 'APP/CHANGE_VIEW':
      if (action.view) {
        return {
          ...state,
          view: fetchedViews.indexOf(action.view),
        };
      } else {
        return { ...state, view: 0 };
      }
    case 'APP/RESET_STATE':
      return startingState;
    default:
      return state;
  }
};
