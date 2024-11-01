/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useReducer /* useState , useEffect */ } from 'react';

import { Account } from '../../../client/graphql/fetch-account';

// LAYOUT Components
import PageWrapper from '../../PageWrapper';
// import IntroView from './welcomView';
// import SuccessView from './successView';
import WelcomeView from './views';

import {
  getViews,
  // getSteps
} from '../../storage/PreferredChosenNameRequest';
import { reducer as stateReducer, newInitState, AppTitle } from '../state/app';

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

  // const closeTab = () => {
  //   if (window) window.close();
  // };

  const changeView = (newView: any) =>
    dispatchState({ type: 'APP/CHANGE_VIEW', view: newView });

  const updateUserState = (data: any) =>
    dispatchState({ type: 'APP/RESET_STATE', payload: data });

  // const resetState = (): void => dispatchState({ type: 'APP/RESET_STATE' });

  // const stepBack = (): void => {
  //   const prevView = state.view - 1;

  //   if (prevView > -1) {
  //     changeView(fetchedViews[prevView]);
  //   } else {
  //     changeView(fetchedViews[0]);
  //   }
  // };

  const advanceStep = () => {
    const nextView = state.view + 1;

    if (nextView < fetchedViews.length) {
      // changeView(fetchedViews[nextView]);
      updateUserState({});
      advanceStep();
    } else {
      // changeView(fetchedViews[0]);
      changeView(fetchedViews[0]);
    }
  };

  const defaultView = (
    <PageWrapper classString={'b-c'}>
      <WelcomeView
        handleProceed={advanceStep}
        handleStepBack={() => {}}
        appTitle={AppTitle}
        account={viewAccountObj}
      />

      {/* <IntroView
        handleProceed={advanceStep}
        resetState={resetState}
        appTitle={AppTitle}
        handleQuit={closeTab}
        handleStepBack={stepBack}
        account={viewAccountObj}
      /> */}
    </PageWrapper>
  );

  // const successView = (
  //   <PageWrapper classString={'b-c'}>
  //     <SuccessView
  //       handleProceed={advanceStep}
  //       resetState={resetState}
  //       appTitle={AppTitle}
  //       handleQuit={closeTab}
  //       handleStepBack={stepBack}
  //       account={viewAccountObj}
  //     />
  //   </PageWrapper>
  // );

  switch (fetchedViews[state.view]) {
    case 'welcomeView':
      return defaultView;
    // case 'enterNameView':
    //   return defaultView;
    // case 'confirmationView':
    //   return defaultView;
    // case 'successView':
    //   return successView;
    default:
      return defaultView;
  }
}
