import React from 'react';
import { storiesOf } from '@storybook/react';

import PageWrapper from '../../PageWrapper';

import { AppTitle } from '../state/app';
import { CommonAttributes, PreferredChosenNameInformation } from '../types';

import WelcomeView from './welcomeView';
import { EnterNameView } from './enterNameView';
import ConfirmationView from './confirmationView';
import SuccessView from './successView';
import ErrorView from './errorView';

const defaultWorkflowAccount: CommonAttributes = new PreferredChosenNameInformation(
  {
    init: true,
    employeeId: 'CON12345',
    employeeType: 'CH',
    firstName: 'Felipe',
    lastName: 'Rivera',
    email: 'felipe.rivera@boston.gov',
  }
);

const defaultAltWorkflowAccount = {
  ...defaultWorkflowAccount,
  ...{ employeeType: 'BPL', altWorkflow: true },
};

// console.log(`defaultWorkflowAccount: `, defaultWorkflowAccount);
// console.log(`defaultAltWorkflowAccount: `, defaultAltWorkflowAccount);

// WORKFLOW (Default)
storiesOf('Preferred Chosen Name/Workflow 1', module)
  .add('Welcome', () => (
    <PageWrapper classString={'b-c'}>
      <WelcomeView
        handleProceed={() => {}}
        appTitle={AppTitle}
        state={defaultWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Enter Names', () => (
    <PageWrapper classString={'b-c'}>
      <EnterNameView
        handleProceed={() => {}}
        appTitle={AppTitle}
        state={defaultWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Confirmation', () => (
    <PageWrapper classString={'b-c'}>
      <ConfirmationView
        handleProceed={() => {}}
        handleStepBack={() => {}}
        appTitle={AppTitle}
        state={defaultWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Success', () => (
    <PageWrapper classString={'b-c'}>
      <SuccessView
        handleQuit={() => {}}
        appTitle={AppTitle}
        state={defaultWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Error', () => (
    <PageWrapper classString={'b-c'}>
      <ErrorView
        handleQuit={() => {}}
        appTitle={AppTitle}
        // state={defaultWorkflowAccount}
      />
    </PageWrapper>
  ));

// WORKFLOW (BPL / BPHC)
storiesOf('Preferred Chosen Name/Workflow 2', module)
  .add('Welcome', () => (
    <PageWrapper classString={'b-c'}>
      <WelcomeView
        handleProceed={() => {}}
        appTitle={AppTitle}
        state={defaultAltWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Enter Names', () => (
    <PageWrapper classString={'b-c'}>
      <EnterNameView
        handleProceed={() => {}}
        appTitle={AppTitle}
        state={defaultAltWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Success', () => (
    <PageWrapper classString={'b-c'}>
      <SuccessView
        handleQuit={() => {}}
        appTitle={AppTitle}
        state={defaultAltWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Error', () => (
    <PageWrapper classString={'b-c'}>
      <ErrorView
        handleQuit={() => {}}
        appTitle={AppTitle}
        // state={defaultWorkflowAccount}
      />
    </PageWrapper>
  ));
