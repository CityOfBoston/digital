import React from 'react';
import { storiesOf } from '@storybook/react';

import BirthCertificateRequest from '../store/BirthCertificateRequest';

import QuestionsPage from './QuestionsPage';
import ForWhom from './questions/ForWhom';
import PersonalInformation from './questions/PersonalInformation';
import BornInBoston from './questions/BornInBoston';
import ParentalInformation from './questions/ParentalInformation';
import VerifyIdentification from './questions/VerifyIdentification';

const birthCertificateRequest = new BirthCertificateRequest();

storiesOf('Birth/QuestionsFlow', module)
  .add('QuestionsPage', () => (
    <QuestionsPage birthCertificateRequest={birthCertificateRequest} />
  ))
  .add('who is this for?', () => (
    <ForWhom
      forSelf={null}
      handleProceed={() => {}}
      handleStepCompletion={() => {}}
    />
  ))
  .add('born in Boston?', () => (
    <BornInBoston
      forSelf={true}
      handleProceed={() => {}}
      handleStepCompletion={() => {}}
      handleStepBack={() => {}}
      handleUserReset={() => {}}
    />
  ))
  .add('personal information', () => (
    <PersonalInformation
      forSelf={true}
      handleProceed={() => {}}
      handleStepCompletion={() => {}}
      handleStepBack={() => {}}
    />
  ))
  .add('parental information', () => (
    <ParentalInformation
      forSelf={false}
      firstName="Stacy"
      handleProceed={() => {}}
      handleStepCompletion={() => {}}
      handleStepBack={() => {}}
      verificationStepRequired={() => {}}
    />
  ))
  .add('verify identification', () => (
    <VerifyIdentification
      handleStepCompletion={() => {}}
      handleProceed={() => {}}
      handleStepBack={() => {}}
    />
  ));
