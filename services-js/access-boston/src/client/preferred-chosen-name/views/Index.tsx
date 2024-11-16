/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useReducer } from 'react';

// import fetch from 'node-fetch';

import { Account } from '../../../client/graphql/fetch-account';

// LAYOUT Components
import PageWrapper from '../../PageWrapper';
// import { ApprovalView } from './views';
import ConfirmationView from '../views/confirmationView';
import WelcomeView from '../views/welcomeView';
import { EnterNameView } from '../views/enterNameView';

import {
  getViews,
  // getSteps
} from '../../storage/PreferredChosenNameRequest';
import { reducer as stateReducer, newInitState, AppTitle } from '../state/app';
import SuccessView from './successView';

interface Props {
  account: Account;
}

export default function Index(props: Props) {
  const { account } = props;
  const viewAccountObj = {
    cobAgency: account.cobAgency || '',
    firstName: account.firstName || '',
    lastName: account.lastName || '',
    email: account.email || '',
  };

  const [state, dispatchState] = useReducer(stateReducer, newInitState);
  //   const fetchedSteps: Array<string> = getSteps();
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
    console.log('advanceStep!!!!!');
    const nextView = state.view + 1;
    console.log(`nextView: `, nextView, state, fetchedViews);

    if (nextView < fetchedViews.length) {
      changeView(fetchedViews[nextView]);
      // updateUserState({});
      // advanceStep();
    } else {
      changeView(fetchedViews[0]);
    }
  };

  // const advanceStepPreferredNameRequest = async (data: {
  //   id: string;
  //   preferredFirstName: string;
  //   preferredLastName: string;
  // }) => {
  //   const { id, preferredFirstName, preferredLastName } = data;
  //   return await fetch(
  //     `https://identity-test.boston.gov/identityiq/rest/workflows/COB-Workflow-GenerateUniqueEmail/launch` as string,
  //     {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: 'Basic Q09CX1BPUlRBTF9VU0VSOkJvc3RvbjIwMTgh',
  //       },
  //       body: JSON.stringify({
  //         workflowArgs: { id, preferredFirstName, preferredLastName },
  //       }),
  //     }
  //   )
  //     .then(response => response.json())
  //     .then(response => response);
  // };
  // // console.log(
  // //   `advanceStepPreferredNameRequest: `,
  // //   advanceStepPreferredNameRequest
  // // );

  // console.log(
  //   `advance ...: `,
  //   advanceStepPreferredNameRequest({
  //     id: '40000093',
  //     preferredFirstName: 'Manuelo',
  //     preferredLastName: 'WebTest',
  //     // email: 'manuelo.webtest2@boston.gov',
  //   })
  // );

  const defaultView = (
    <PageWrapper classString={'b-c'}>
      <WelcomeView
        handleProceed={advanceStep}
        appTitle={AppTitle}
        account={viewAccountObj}
      />
    </PageWrapper>
  );

  const enterNameView = (
    <PageWrapper classString={'b-c'}>
      <EnterNameView
        handleProceed={advanceStep}
        // handleStepBack={stepBack}
        appTitle={AppTitle}
        account={viewAccountObj}
      />
    </PageWrapper>
  );

  const approvalView = (
    <PageWrapper classString={'b-c'}>
      <ConfirmationView
        handleProceed={advanceStep}
        handleStepBack={stepBack}
        appTitle={AppTitle}
        account={viewAccountObj}
      />
    </PageWrapper>
  );

  const successView = (
    <PageWrapper classString={'b-c'}>
      <SuccessView
        handleQuit={closeTab}
        appTitle={AppTitle}
        account={viewAccountObj}
      />
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
    default:
      return defaultView;
  }
}
