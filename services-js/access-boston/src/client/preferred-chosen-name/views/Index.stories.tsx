import React from 'react';
import { storiesOf } from '@storybook/react';

import PageWrapper from '../../PageWrapper';

import { AppTitle } from '../state/app';

import WelcomeView, { EnterNameView, ApprovalView } from './views';
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
  .add('Enter Names', () => (
    <PageWrapper classString={'b-c'}>
      <EnterNameView
        handleProceed={() => {}}
        handleStepBack={() => {}}
        appTitle={AppTitle}
        account={viewAccountObj}
      />
    </PageWrapper>
  ))
  .add('Approval', () => (
    <PageWrapper classString={'b-c'}>
      <ApprovalView
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
