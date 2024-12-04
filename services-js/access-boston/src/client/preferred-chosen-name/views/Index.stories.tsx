import React from 'react';
import { storiesOf } from '@storybook/react';

import PageWrapper from '../../PageWrapper';

import { AppTitle } from '../state/app';
import { CommonAttributes, PreferredChosenNameInformation } from '../types';

import WelcomeView from './welcomeView';
import WelcomeView2 from '../views2/WelcomeView';
import { EnterNameView } from './enterNameView';
import { EnterNameView2 } from '../views2/EnterNameView';
import { ConfirmationView2 } from '../views2/ConfirmationView';
import { SuccessView2 } from '../views2/SuccessView';
import { ErrorView2 } from '../views2/ErrorView';
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
    chosenFirstName: 'Phill',
    chosenLastName: 'Kelly',
    newEmail: 'phill.kelly@boston.gov',
  }
);

const altWorkflowAccount = {
  ...defaultWorkflowAccount,
  ...{ employeeType: 'BPL', altWorkflow: true },
};

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
  .add('Welcome 2', () => (
    <PageWrapper classString={'b-c'}>
      <WelcomeView2
        handleProceed={() => {}}
        appTitle={AppTitle}
        state={defaultWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Enter Names', () => (
    <PageWrapper classString={'b-c'}>
      <EnterNameView handleProceed={() => {}} state={defaultWorkflowAccount} />
    </PageWrapper>
  ))
  .add('Enter Names 2', () => (
    <PageWrapper classString={'b-c'}>
      <EnterNameView2
        handleProceed={() => {}}
        handleStepBack={() => {}}
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
  .add('Confirmation 2', () => (
    <PageWrapper classString={'b-c'}>
      <ConfirmationView2
        handleProceed={() => {}}
        handleStepBack={() => {}}
        handleUseNewEmailToogle={() => {}}
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
  .add('Success 2', () => (
    <PageWrapper classString={'b-c'}>
      <SuccessView2
        handleQuit={() => {}}
        appTitle={AppTitle}
        state={defaultWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Error', () => (
    <PageWrapper classString={'b-c'}>
      <ErrorView handleQuit={() => {}} appTitle={AppTitle} />
    </PageWrapper>
  ))
  .add('Error 2', () => (
    <PageWrapper classString={'b-c'}>
      <ErrorView2 handleQuit={() => {}} appTitle={AppTitle} />
    </PageWrapper>
  ));

// -------------------------------------------------------------------- //

// WORKFLOW (BPL / BPHC)
storiesOf('Preferred Chosen Name/Workflow 2', module)
  .add('Welcome', () => (
    <PageWrapper classString={'b-c'}>
      <WelcomeView
        handleProceed={() => {}}
        appTitle={AppTitle}
        state={altWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Welcome 2', () => (
    <PageWrapper classString={'b-c'}>
      <WelcomeView2
        handleProceed={() => {}}
        appTitle={AppTitle}
        state={altWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Enter Names', () => (
    <PageWrapper classString={'b-c'}>
      <EnterNameView
        handleProceed={() => {}}
        handleSubmit={() => {}}
        state={altWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Enter Names 2', () => (
    <PageWrapper classString={'b-c'}>
      <EnterNameView2
        handleProceed={() => {}}
        handleStepBack={() => {}}
        handleSubmit={() => {}}
        state={altWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Success', () => (
    <PageWrapper classString={'b-c'}>
      <SuccessView
        handleQuit={() => {}}
        appTitle={AppTitle}
        state={altWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Success 2', () => (
    <PageWrapper classString={'b-c'}>
      <SuccessView2
        handleQuit={() => {}}
        appTitle={AppTitle}
        state={altWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Error', () => (
    <PageWrapper classString={'b-c'}>
      <ErrorView handleQuit={() => {}} appTitle={AppTitle} />
    </PageWrapper>
  ))
  .add('Error 2', () => (
    <PageWrapper classString={'b-c'}>
      <ErrorView2 handleQuit={() => {}} appTitle={AppTitle} />
    </PageWrapper>
  ));
