/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useReducer /* useState , useEffect */ } from 'react';

// LAYOUT Components
import PageWrapper from '../../PageWrapper';
import IntroView from './introView';

import {
  getViews,
  // getSteps
} from '../../storage/PreferredChosenNameRequest';
import { reducer as stateReducer, newInitState, AppTitle } from '../state/app';

export default function Index() {
  const [state, dispatchState] = useReducer(stateReducer, newInitState);
  //   const fetchedSteps: Array<string> = getSteps();
  const fetchedViews: Array<string> = getViews();

  const closeTab = () => {
    if (window) window.close();
  };

  const changeView = (newView: any) =>
    dispatchState({ type: 'APP/CHANGE_VIEW', view: newView });

  const updateUserState = (data: any) =>
    dispatchState({ type: 'APP/RESET_STATE', payload: data });

  const resetState = (): void => dispatchState({ type: 'APP/RESET_STATE' });

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
      <IntroView
        handleProceed={advanceStep}
        resetState={resetState}
        appTitle={AppTitle}
        handleQuit={closeTab}
        handleStepBack={stepBack}
      />
    </PageWrapper>
  );

  switch (fetchedViews[state.view]) {
    case 'intro':
      return defaultView;
    default:
      return defaultView;
  }
}
