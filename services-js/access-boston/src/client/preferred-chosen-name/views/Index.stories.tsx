import React from 'react';
import { storiesOf } from '@storybook/react';

import PageWrapper from '../../PageWrapper';

import { AppTitle } from '../state/app';

import ConfirmationView from './confirmationView';
import WelcomeView from './welcomeView';
import EnterNameView from './enterNameView';
import SuccessView from './successView';

const viewAccountObj = {
  cobAgency: 'CH',
  firstName: 'Felipe',
  lastName: 'Rivera',
  email: 'felipe.rivera@boston.gov',
};

storiesOf('Preferred-Name', module)
  .add('Welcome', () => (
    <PageWrapper classString={'b-c'}>
      <WelcomeView
        handleProceed={() => {}}
        appTitle={AppTitle}
        account={viewAccountObj}
      />
    </PageWrapper>
  ))
  .add('Welcome BPL', () => (
    <PageWrapper classString={'b-c'}>
      <WelcomeView
        handleProceed={() => {}}
        appTitle={AppTitle}
        // Change the obj below to use same obj but different cobAgency: BPL
        account={viewAccountObj}
      />
    </PageWrapper>
  ))
  .add('Enter Names', () => (
    <PageWrapper classString={'b-c'}>
      <EnterNameView
        handleProceed={() => {}}
        appTitle={AppTitle}
        account={viewAccountObj}
      />
    </PageWrapper>
  ))
  .add('Confirmation', () => (
    <PageWrapper classString={'b-c'}>
      <ConfirmationView
        handleProceed={() => {}}
        handleStepBack={() => {}}
        appTitle={AppTitle}
        account={viewAccountObj}
      />
    </PageWrapper>
  ))
  .add('Success', () => (
    <PageWrapper classString={'b-c'}>
      <SuccessView
        handleQuit={() => {}}
        appTitle={AppTitle}
        account={viewAccountObj}
      />
    </PageWrapper>
  ));

