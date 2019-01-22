import React from 'react';
import { storiesOf } from '@storybook/react';

import BirthCertificateRequest from '../store/BirthCertificateRequest';

import QuestionsFlow from './QuestionsFlow';
import ForWhom from './questions/ForWhom';
import PersonalInformation from './questions/PersonalInformation';
import BornInBoston from './questions/BornInBoston';
import ParentalInformation from './questions/ParentalInformation';

const birthCertificateRequest = new BirthCertificateRequest();

storiesOf('Birth/QuestionsFlow', module)
  .add('QuestionsFlow page', () => (
    <QuestionsFlow birthCertificateRequest={birthCertificateRequest} />
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
    />
  ));
