/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useReducer } from 'react';

// import { Account } from '../../../client/graphql/fetch-account';
import { CommonAttributes } from '../types';

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
import {
  reducer as stateReducer,
  AppTitle,
  // newInitState,
} from '../state/app';
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
        handleProceed={advanceStep}
        // handleStepBack={stepBack}
        appTitle={AppTitle}
        state={state}
      />
    </PageWrapper>
  );

  const approvalView = (
    <PageWrapper classString={'b-c'}>
      <ConfirmationView
        handleProceed={advanceStep}
        handleStepBack={stepBack}
        appTitle={AppTitle}
        state={state}
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
    default:
      return defaultView;
  }
}
