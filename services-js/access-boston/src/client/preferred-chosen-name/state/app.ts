/* eslint no-console: 0 */

import {
  View,
  CommonAttributes,
  FormInputs,
  PreferredChosenNameInformation,
} from '../types';
import { getViews } from '../../storage/PreferredChosenNameRequest';
// import { preferredNameRequest } from '../../../server/services/preferredName';

export const AppTitle: string = 'Preferred / Chosen Name';
export type ActionTypes =
  | 'APP/CHANGE_VIEW'
  | 'APP/RESET_STATE'
  | 'APP/INITIAL_STATE'
  | 'APP/UPDATE_PREFERREDNAME'
  | 'APP/UPDATE__SUBMIT_PREFERREDNAME'
  | 'APP/UPDATE_EMAIL_TO_USE'
  | 'APP/LOADING';

interface Action {
  type: ActionTypes;
  view: View;
  payload: CommonAttributes;
  formData: FormInputs;
  altWorkflow: boolean;
  useNewEmail: boolean;
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
    case 'APP/LOADING':
      return { ...state, loading: !state.loading };
    case 'APP/UPDATE_PREFERREDNAME':
      if (action.formData) {
        try {
          const updatedState = {
            ...state,
            chosenFirstName: action.formData.FName,
            chosenLastName: action.formData.LName,
            fetchNameReqRes: true,
            fetchNameReqResError: false,
            newEmail: action.formData.Email,
          };

          console.log(
            `APP/UPDATE_PREFERREDNAME (updatedState): `,
            updatedState
          );

          return updatedState;
        } catch (error) {
          console.log(`APP/UPDATE_PREFERREDNAME (error): `, error);
          console.log(`APP/UPDATE_PREFERREDNAME (post-error(state)): `, state);
          return {};
        }
      } else {
        return state;
      }
    case 'APP/UPDATE_EMAIL_TO_USE':
      if (action.useNewEmail) {
        return { ...state, useNewEmail: action.useNewEmail };
      } else {
        return state;
      }
    case 'APP/UPDATE__SUBMIT_PREFERREDNAME':
      if (action.formData) {
        try {
          const updatedState = {
            ...state,
            chosenFirstName: action.formData.FName,
            chosenLastName: action.formData.LName,
            submitNameChangeReq: true,
            submitNameChangeReqError: false,
          };

          console.log(
            `APP/UPDATE__SUBMIT_PREFERREDNAME (updatedState): `,
            updatedState
          );

          return updatedState;
        } catch (error) {
          console.log(`APP/UPDATE__SUBMIT_PREFERREDNAME (error): `, error);
          console.log(
            `APP/UPDATE__SUBMIT_PREFERREDNAME (post-error(state)): `,
            state
          );
          return {};
        }
      } else {
        return state;
      }
    default:
      return state;
  }
};
