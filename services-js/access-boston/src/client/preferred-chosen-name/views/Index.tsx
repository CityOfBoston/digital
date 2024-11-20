/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useReducer } from 'react';

// import { Account } from '../../../client/graphql/fetch-account';
import { reducer as stateReducer, AppTitle } from '../state/app';
import { CommonAttributes } from '../types';
import { getViews } from '../../storage/PreferredChosenNameRequest';
import {
  preferredNameRequest,
  preferredNameSubmit,
} from '../../../server/services/preferredName';

// LAYOUT Components
import PageWrapper from '../../PageWrapper';
// import { ApprovalView } from './views';
import { EnterNameView } from '../views/enterNameView';
import WelcomeView from '../views/welcomeView';
import ConfirmationView from '../views/confirmationView';
import ErrorView from '../views/errorView';
import SuccessView from './successView';

interface Props {
  accountState: CommonAttributes;
}

export default function Index(props: Props) {
  const { accountState } = props;

  const [state, dispatchState] = useReducer(stateReducer, accountState);
  const fetchedViews: Array<string> = getViews();

  const closeTab = () => {
    if (window) window.close();
  };

  const changeView = (newView: any) =>
    dispatchState({ type: 'APP/CHANGE_VIEW', view: newView });

  // const updateUserState = (data: any) =>
  //   dispatchState({ type: 'APP/RESET_STATE', payload: data });

  // const resetState = (): void => dispatchState({ type: 'APP/RESET_STATE' });

  const stepBack = (): void => {
    const prevView = state.view - 1;

    if (prevView > -1) {
      changeView(fetchedViews[prevView]);
    } else {
      changeView(fetchedViews[0]);
    }
  };

  const advanceStep = () => {
    const nextView = state.view + 1;
    // console.log('advanceStep!!!!!');
    // console.log(`nextView: `, nextView, state, fetchedViews);

    if (nextView < fetchedViews.length) {
      changeView(fetchedViews[nextView]);
      // updateUserState({});
      // advanceStep();
    } else {
      changeView(fetchedViews[0]);
    }
  };

  const handlerPreferredNameReq = async (data: {
    Id: string;
    FName: string;
    LName: string;
  }) => {
    const { Id, FName, LName } = data;
    const retObj = await preferredNameRequest({
      id: state.employeeId,
      preferredFirstName: FName,
      preferredLastName: LName,
    });

    // console.log(`preferredNameRequest(retObj): `, Id, retObj);

    if (retObj['attributes']) {
      dispatchState({
        type: 'APP/UPDATE_PREFERREDNAME',
        formData: {
          Id,
          FName,
          LName,
          Email: retObj['attributes']['result']['newEmail'],
        },
      });

      changeView(fetchedViews[2]);
    } else {
      changeView(fetchedViews[4]);
    }
  };

  const handlerPreferredNameSubmit = async (data: {
    Id: string;
    FName: string;
    LName: string;
    Email?: string;
  }) => {
    const { Id, FName, LName, Email } = data;
    let subObj = {
      id: state.employeeId,
      preferredFirstName: FName,
      preferredLastName: LName,
    };
    if (
      Email &&
      typeof Email === 'string' &&
      Email.length > 2 &&
      !state.altWorkflow
    ) {
      subObj['email'] = Email;
    }

    const retObj = await preferredNameSubmit(subObj);
    let formData = {
      Id,
      FName,
      LName,
    };
    if (
      formData['Email'] &&
      formData['Email'].length > 1 &&
      !state.altWorkflow
    ) {
      formData['Email'] = retObj['attributes']['result']['newEmail'];
    }

    // console.log(
    //   `handlerPreferredNameSubmit > preferredNameSubmit(retObj): `,
    //   retObj
    // );

    if (
      retObj['attributes'] &&
      retObj['attributes']['status'] &&
      retObj['attributes']['status'] === 'Success. Updated Attributes in IIQ'
    ) {
      // console.log(
      //   `handlerPreferredNameSubmit > pre-dispatchState(retObj): `,
      //   retObj
      // );
      // console.log(
      //   `handlerPreferredNameSubmit > pre-dispatchState(formData): `,
      //   formData
      // );

      dispatchState({
        type: 'APP/UPDATE__SUBMIT_PREFERREDNAME',
        formData,
      });

      changeView(fetchedViews[3]);
    } else {
      console.log(`Preferred Name Submit (error): `, retObj);
      console.error(`Preferred Name Submit (error): `, retObj);
      changeView(fetchedViews[4]);
    }
  };

  const defaultView = (
    <PageWrapper classString={'b-c'}>
      <WelcomeView
        handleProceed={advanceStep}
        appTitle={AppTitle}
        state={state}
      />
    </PageWrapper>
  );

  const enterNameView = (
    <PageWrapper classString={'b-c'}>
      <EnterNameView
        handleProceed={handlerPreferredNameReq}
        handleSubmit={handlerPreferredNameSubmit}
        state={state}
      />
    </PageWrapper>
  );

  const approvalView = (
    <PageWrapper classString={'b-c'}>
      <ConfirmationView
        handleProceed={handlerPreferredNameSubmit}
        handleStepBack={stepBack}
        appTitle={AppTitle}
        state={state}
      />
    </PageWrapper>
  );

  const errorView = (
    <PageWrapper classString={'b-c'}>
      <ErrorView
        handleQuit={() => {}}
        appTitle={AppTitle}
        // state={defaultWorkflowAccount}
      />
    </PageWrapper>
  );

  const successView = (
    <PageWrapper classString={'b-c'}>
      <SuccessView handleQuit={closeTab} appTitle={AppTitle} state={state} />
    </PageWrapper>
  );

  switch (fetchedViews[state.view]) {
    case 'welcomeView':
      return defaultView;
    case 'enterNameView':
      return enterNameView;
    case 'approvalView':
      return approvalView;
    case 'successView':
      return successView;
    case 'errorView':
      return errorView;
    default:
      return defaultView;
  }
}
