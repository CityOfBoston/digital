/* eslint no-console: 0 */

import {
  View,
  CommonAttributes,
  FormInputs,
  PreferredChosenNameInformation,
} from '../types';
import { getViews } from '../../storage/PreferredChosenNameRequest';
import { preferredNameRequest } from '../../../server/services/preferredName';

export const AppTitle: string = 'Preferred / Chosen Name';
export type ActionTypes =
  | 'APP/CHANGE_VIEW'
  | 'APP/RESET_STATE'
  | 'APP/INITIAL_STATE'
  | 'APP/UPDATE_PREFERREDNAME';

interface Action {
  type: ActionTypes;
  view: View;
  payload: CommonAttributes;
  formData: FormInputs;
  altWorkflow: boolean;
}

export const initialState = new PreferredChosenNameInformation();
export const newInitState = {
  ...initialState,
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
    case 'APP/INITIAL_STATE':
      if (action.payload) {
        const altWorkflows = ['BPL', 'BPHC'];

        const retObj = {
          ...state,
          init: true,
          employeeId: action.payload.employeeId,
          employeeType: action.payload.employeeType,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          email: action.payload.email,
          altWorkflow: altWorkflows.includes(action.payload.employeeType),
          // displayName: action.payload.displayName,
          // chosenFirstName: action.payload.chosenFirstName,
          // chosenLastName: action.payload.chosenLastName,
        };
        console.log(`APP/RESET_STATE (action.type): `, action.type);
        console.log(`APP/RESET_STATE (action.payload): `, action.payload);
        console.log(`APP/RESET_STATE (retObj): `, retObj);

        return retObj;
      } else {
        return state;
      }
    case 'APP/UPDATE_PREFERREDNAME':
      if (action.formData) {
        try {
          const retObj = preferredNameRequest({
            id: action.formData.Id,
            preferredFirstName: action.formData.FName,
            preferredLastName: action.formData.LName,
          });

          console.log(`app state (retObj): `, retObj);

          return {
            ...state,
            chosenFirstName: action.formData.FName,
            chosenLastName: action.formData.LName,
            fetchNameReqRes: true,
            fetchNameReqResError: false,
            newEmail: retObj['attributes']['result']['newEmail'],
            // newEmail: retObj.attributes.result.newEmail,
          };

          // dispatchState({ type: 'APP/CHANGE_VIEW', view: newView });
          // dispatchState({ type: 'APP/CHANGE_VIEW', view: newView });
        } catch (error) {
          // dispatchState({ type: 'APP/CHANGE_VIEW', view: 4 });
          console.log(`APP/UPDATE_PREFERREDNAME (error): `, error);
          return state;
        }
      } else {
        return state;
      }
    default:
      return state;
  }
};
