/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useReducer } from 'react';

import { reducer as stateReducer, AppTitle } from '../state/app';
import { CommonAttributes } from '../types';
import { getViews } from '../../storage/PreferredChosenNameRequest';
import {
  preferredNameRequest,
  preferredNameSubmit,
} from '../../../server/services/preferredName';

// LAYOUT Components
import PageWrapper from '../../PageWrapper';
import { WelcomeView2 } from './WelcomeView';
import { EnterNameView2 } from './EnterNameView';
import { ConfirmationView } from './ConfirmationView';
import { ErrorView2 } from './ErrorView';
import { SuccessView2 } from './SuccessView';

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
      changeView(fetchedViews[nextView]);
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

    dispatchState({ type: 'APP/LOADING' });

    const retObj = await preferredNameRequest({
      id: state.employeeId,
      preferredFirstName: FName,
      preferredLastName: LName,
    });

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

      dispatchState({ type: 'APP/LOADING' });
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

    dispatchState({ type: 'APP/LOADING' });

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

    if (
      retObj['attributes'] &&
      retObj['attributes']['status'] &&
      retObj['attributes']['status'] === 'Success. Updated Attributes in IIQ'
    ) {
      dispatchState({
        type: 'APP/UPDATE__SUBMIT_PREFERREDNAME',
        formData,
      });
      dispatchState({ type: 'APP/LOADING' });

      changeView(fetchedViews[3]);
    } else {
      console.log(`Preferred Name Submit (error): `, retObj);
      console.error(`Preferred Name Submit (error): `, retObj);
      changeView(fetchedViews[4]);
    }
  };

  const handleUseNewEmailToogle = () => {
    dispatchState({
      type: 'APP/UPDATE_EMAIL_TO_USE',
    });
  };

  const defaultView = (
    <PageWrapper classString={'b-c'}>
      <WelcomeView2
        handleProceed={advanceStep}
        appTitle={AppTitle}
        state={state}
      />
    </PageWrapper>
  );

  const enterNameView = (
    <PageWrapper classString={'b-c'}>
      <EnterNameView2
        handleProceed={handlerPreferredNameReq}
        handleSubmit={handlerPreferredNameSubmit}
        handleStepBack={stepBack}
        state={state}
      />
    </PageWrapper>
  );

  const approvalView = (
    <PageWrapper classString={'b-c'}>
      <ConfirmationView
        handleProceed={handlerPreferredNameSubmit}
        handleStepBack={stepBack}
        handleUseNewEmailToogle={handleUseNewEmailToogle}
        state={state}
      />
    </PageWrapper>
  );

  const errorView = (
    <PageWrapper classString={'b-c'}>
      <ErrorView2 handleQuit={() => {}} appTitle={AppTitle} />
    </PageWrapper>
  );

  const successView = (
    <PageWrapper classString={'b-c'}>
      <SuccessView2 handleQuit={closeTab} appTitle={AppTitle} state={state} />
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
