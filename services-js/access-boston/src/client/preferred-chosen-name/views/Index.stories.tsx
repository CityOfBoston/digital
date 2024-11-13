import React from 'react';
import { storiesOf } from '@storybook/react';

import PageWrapper from '../../PageWrapper';

import { AppTitle } from '../state/app';

import WelcomeView from './welcomeView';
import EnterNameView from './enterNameView';
import ConfirmationView from './confirmationView';
import SuccessView from './successView';

const defaultWorkflowAccount = {
  cobAgency: 'CH',
  firstName: 'Felipe',
  lastName: 'Rivera',
  email: 'felipe.rivera@boston.gov',
};

const defaultAltWorkflowAccount = {
  ...defaultWorkflowAccount,
  ...{ cobAgency: 'BPL' },
};

storiesOf('Preferred Chosen Name/Workflow 1', module)
  .add('Welcome', () => (
    <PageWrapper classString={'b-c'}>
      <WelcomeView
        handleProceed={() => {}}
        appTitle={AppTitle}
        account={defaultWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Enter Names', () => (
    <PageWrapper classString={'b-c'}>
      <EnterNameView
        handleProceed={() => {}}
        appTitle={AppTitle}
        account={defaultWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Confirmation', () => (
    <PageWrapper classString={'b-c'}>
      <ConfirmationView
        handleProceed={() => {}}
        handleStepBack={() => {}}
        appTitle={AppTitle}
        account={defaultWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Success', () => (
    <PageWrapper classString={'b-c'}>
      <SuccessView
        handleQuit={() => {}}
        appTitle={AppTitle}
        account={defaultWorkflowAccount}
      />
    </PageWrapper>
  ));

storiesOf('Preferred Chosen Name/Workflow 2', module)
  .add('Welcome', () => (
    <PageWrapper classString={'b-c'}>
      <WelcomeView
        handleProceed={() => {}}
        appTitle={AppTitle}
        account={defaultAltWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Enter Names', () => (
    <PageWrapper classString={'b-c'}>
      <EnterNameView
        handleProceed={() => {}}
        appTitle={AppTitle}
        account={defaultAltWorkflowAccount}
      />
    </PageWrapper>
  ))
  .add('Success', () => (
    <PageWrapper classString={'b-c'}>
      <SuccessView
        handleQuit={() => {}}
        appTitle={AppTitle}
        account={defaultAltWorkflowAccount}
      />
    </PageWrapper>
  ));
