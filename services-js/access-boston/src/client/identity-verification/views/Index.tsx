/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useReducer, useState, useEffect } from 'react';

// LAYOUT Components
import PageWrapper from '../../PageWrapper';

// VIEWS (Components)
import EnterIdView from './enterId/EnterIdView';
import ValidateView from './validate/ValidateView';
import ReviewView from './review/ReviewView';
import SuccessView from './success/SuccessView';
import FailureView from './failure/FailureView';
import QuitView from './quit/QuitView';

import { getViews, getSteps } from '../../storage/IdentityVerificationRequest';
import { reducer as stateReducer, newInitState, AppTitle } from '../state/app';

interface Props {
  groups: Array<string> | null;
}

export default function Index(props: Props) {
  const { groups } = props;
  const [state, dispatchState] = useReducer(stateReducer, newInitState);
  const [ssn, updateSnn] = useState('');
  const [dob, updateDob] = useState('');
  const fetchedSteps: Array<string> = getSteps();
  const fetchedViews: Array<string> = getViews();

  useEffect(() => {
    // Update the document title using the browser API
    if (
      !groups ||
      typeof groups !== 'object' ||
      groups.length < 0 ||
      groups.indexOf('SG_AB_CONFIRMID') === -1
    ) {
      if (window) window.location.href = '/';
    }
  });

  const changeView = (newView: any) =>
    dispatchState({ type: 'APP/CHANGE_VIEW', view: newView });

  const updateUserState = (data: any) =>
    dispatchState({ type: 'USER/UPDATE_USER', payload: data });

  const resetState = (): void => {
    dispatchState({ type: 'APP/RESET_STATE' });
  };

  const stepBack = (): void => {
    const prevView = state.view - 1;

    if (prevView > -1) {
      changeView(fetchedViews[prevView]);
    } else {
      changeView(fetchedViews[0]);
    }
  };

  const parseSailPointData = (data: any) => {
    const dataRoot = data.Resources[0];
    const userStr = 'urn:ietf:params:scim:schemas:sailpoint:1.0:User';

    return {
      fname: dataRoot.name.givenName ? dataRoot.name.givenName : '',
      lname: dataRoot.name.familyName ? dataRoot.name.familyName : '',
      employeeId: dataRoot.userName,
      employeeType: dataRoot[userStr].identity_type,
      ssn: dataRoot[userStr].ssn ? dataRoot[userStr].ssn : '',
      dob: dataRoot[userStr].cobDob ? dataRoot[userStr].cobDob : '',
    };
  };

  const advanceOnFetchEmployee = async (id: string) => {
    const userData = await fetch(`/id-verification?id=${id}` as string, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(response => response);

    if (userData.Resources && userData.Resources.length > 0) {
      const parseData = parseSailPointData(userData);
      updateUserState(parseData);
      advanceQuestion();
    } else {
      changeView(fetchedViews[fetchedViews.length - 2]);
    }
  };

  const advanceQuestion = () => {
    const nextView = state.view + 1;

    if (nextView < fetchedViews.length) {
      changeView(fetchedViews[nextView]);
    } else {
      changeView(fetchedViews[0]);
    }
  };

  const verifyUser = () => {
    if (state.employeeType === 'EMPLOYEE') {
      if (state.ssn === ssn) {
        advanceQuestion();
      } else {
        changeView(fetchedViews[fetchedViews.length - 2]);
      }
    } else {
      if (state.dob === dob) {
        advanceQuestion();
      } else {
        changeView(fetchedViews[fetchedViews.length - 2]);
      }
    }
  };

  const defaultView = (
    <PageWrapper
      progress={{
        totalSteps: fetchedSteps.length,
        currentStep: 1,
        currentStepCompleted: true,
      }}
      classString={'b-c'}
    >
      <div>
        <EnterIdView
          handleProceed={advanceOnFetchEmployee}
          resetState={resetState}
          appTitle={AppTitle}
        />
      </div>
    </PageWrapper>
  );

  switch (fetchedViews[state.view]) {
    case 'enterId':
      return defaultView;
    case 'validate':
      return (
        <PageWrapper
          progress={{
            totalSteps: fetchedSteps.length,
            currentStep: 2,
            currentStepCompleted: true,
          }}
          classString={'b-c'}
        >
          <div>
            <ValidateView
              handleProceed={advanceQuestion}
              handleStepBack={stepBack}
              resetState={resetState}
              handleQuit={() =>
                changeView(fetchedViews[fetchedViews.length - 1])
              }
              state={state}
              ssn={ssn}
              dob={dob}
              updateSnn={updateSnn}
              updateDob={updateDob}
              appTitle={AppTitle}
            />
          </div>
        </PageWrapper>
      );
    case 'review':
      return (
        <PageWrapper
          progress={{
            totalSteps: fetchedSteps.length,
            currentStep: 3,
            currentStepCompleted: true,
          }}
          classString={'b-c'}
        >
          <div>
            <ReviewView
              handleProceed={verifyUser}
              handleStepBack={stepBack}
              resetState={resetState}
              state={state}
              ssn={ssn}
              dob={dob}
              handleQuit={() =>
                changeView(fetchedViews[fetchedViews.length - 1])
              }
              appTitle={AppTitle}
            />
          </div>
        </PageWrapper>
      );
    case 'success':
      return (
        <PageWrapper
          progress={{
            totalSteps: fetchedSteps.length,
            currentStep: 4,
            currentStepCompleted: true,
          }}
          classString={'b-c'}
        >
          <div>
            <SuccessView handleProceed={resetState} appTitle={AppTitle} />
          </div>
        </PageWrapper>
      );
    case 'failure':
      return (
        <PageWrapper classString={'b-c'}>
          <FailureView handleProceed={resetState} appTitle={AppTitle} />
        </PageWrapper>
      );
    case 'quit':
      return (
        <PageWrapper classString={'b-c'}>
          <QuitView
            handleProceed={() => changeView(fetchedViews[1])}
            handleReset={resetState}
            handleQuit={() => changeView(fetchedViews[0])}
            appTitle={AppTitle}
          />
        </PageWrapper>
      );
    default:
      return defaultView;
  }
}
