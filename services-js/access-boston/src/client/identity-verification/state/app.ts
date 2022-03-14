/* eslint no-console: 0 */

import {
  View,
  CommonAttributes,
  IdentityVerificationRequestInformation,
} from '../types';
import { getViews } from '../../storage/IdentityVerificationRequest';

import { isDateObj, formatDate } from '../helpers';

export type ActionTypes =
  | 'APP/CHANGE_VIEW'
  | 'APP/RESET_STATE'
  | 'USER/UPDATE_ID'
  | 'USER/UPDATE_USER';

interface Action {
  type: ActionTypes;
  view: View;
  payload: CommonAttributes;
}

export const initialState = new IdentityVerificationRequestInformation();
export const completedStates = {
  enterId: false,
  validate: false,
  review: false,
  success: false,
};

export const newInitState = {
  ...initialState,
  // ...completedStates,
};

export const reducer = (state: any, action: Partial<Action>) => {
  //@ts-ignore todo
  const startingState = newInitState;
  const fetchedViews: Array<string> = getViews();

  switch (action.type) {
    case 'APP/CHANGE_VIEW':
      if (action.view) {
        return { ...state, view: fetchedViews.indexOf(action.view) };
      } else {
        return { ...state, view: 0 };
      }
    case 'APP/RESET_STATE':
      return startingState;
    case 'USER/UPDATE_ID':
      return {
        ...state,
        employeeId:
          action.payload && action.payload.employeeId
            ? action.payload.employeeId
            : '',
      };
    case 'USER/UPDATE_USER':
      if (action.payload) {
        const dob = new Date(action.payload.dob);
        const dobStr = isDateObj(dob) ? formatDate(dob) : '';

        return {
          ...state,
          employeeId: action.payload.employeeId,
          fname: action.payload.fname,
          lname: action.payload.lname,
          employeeType: action.payload.employeeType,
          ssn: action.payload.ssn,
          dob: dobStr,
        };
      } else {
        return state;
      }
    default:
      return state;
  }
};
