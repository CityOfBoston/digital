import React from 'react';
import { storiesOf } from '@storybook/react';

import PageWrapper from '../../PageWrapper';
import InitialView from './initialView/InitialView';
import EnterIdView from './enterId/EnterIdView';
import ValidataView from './validate/ValidateView';
import ReviewView from './review/ReviewView';
import SuccessView from './success/SuccessView';
import FailureView from './failure/FailureView';
import QuitView from './quit/QuitView';

storiesOf('Confirm-Identity', module)
  .add('Intro', () => (
    <PageWrapper classString={'b-c'}>
      <InitialView handleProceed={() => {}} resetState={() => {}} />
    </PageWrapper>
  ))
  .add('EnterID', () => (
    <PageWrapper
      classString={'b-c'}
      progress={{
        totalSteps: 4,
        currentStep: 1,
        currentStepCompleted: true,
      }}
    >
      <div>
        <EnterIdView
          handleProceed={() => {}}
          handleStepBack={() => {}}
          resetState={() => {}}
        />
      </div>
    </PageWrapper>
  ))
  .add('Validate', () => (
    <PageWrapper
      classString={'b-c'}
      progress={{
        totalSteps: 4,
        currentStep: 2,
        currentStepCompleted: true,
      }}
    >
      <div>
        <ValidataView
          handleProceed={() => {}}
          handleStepBack={() => {}}
          resetState={() => {}}
          handleQuit={() => {}}
          state={{
            employeeId: '40000093',
            employeeType: 'EMPLOYEEE',
            fname: 'Steve',
            lname: 'Martin',
            ssn: '1111',
            dob: '1/1/1989',
          }}
          ssn={'1111'}
          dob={'1/1/1989'}
          updateSnn={() => {}}
          updateDob={() => {}}
        />
      </div>
    </PageWrapper>
  ))
  .add('Review', () => (
    <PageWrapper
      progress={{
        totalSteps: 4,
        currentStep: 3,
        currentStepCompleted: true,
      }}
      classString={'b-c'}
    >
      <div>
        <ReviewView
          handleProceed={() => {}}
          handleStepBack={() => {}}
          resetState={() => {}}
          state={{
            employeeId: '40000093',
            employeeType: 'EMPLOYEEE',
            fname: 'Steve',
            lname: 'Martin',
            ssn: '1111',
            dob: '1/1/1989',
          }}
          ssn={'1111'}
          dob={'1/1/1989'}
          handleQuit={() => {}}
        />
      </div>
    </PageWrapper>
  ))
  .add('Success', () => (
    <PageWrapper
      progress={{
        totalSteps: 4,
        currentStep: 4,
        currentStepCompleted: true,
      }}
      classString={'b-c'}
    >
      <div>
        <SuccessView handleProceed={() => {}} />
      </div>
    </PageWrapper>
  ))
  .add('Failure', () => (
    <PageWrapper classString={'b-c'}>
      <FailureView handleProceed={() => {}} />
    </PageWrapper>
  ))
  .add('Quit', () => (
    <PageWrapper classString={'b-c'}>
      <QuitView
        handleProceed={() => {}}
        handleReset={() => {}}
        handleQuit={() => {}}
      />
    </PageWrapper>
  ));
