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
    <QuestionsPage
      birthCertificateRequest={birthCertificateRequest}
      currentStep={'forWhom'}
    />
  ))
  .add('who is this for?', () => (
    <div className="b-c b-c--nbp b-c--hsm">
      <ForWhom
        forSelf={null}
        handleProceed={() => {}}
        handleStepCompletion={() => {}}
      />
    </div>
  ))
  .add('born in Boston?', () => (
    <div className="b-c b-c--nbp b-c--hsm">
      <BornInBoston
        forSelf={true}
        handleProceed={() => {}}
        handleStepCompletion={() => {}}
        handleStepBack={() => {}}
        handleUserReset={() => {}}
      />
    </div>
  ))
  .add('personal information', () => (
    <div className="b-c b-c--nbp b-c--hsm">
      <PersonalInformation
        forSelf={true}
        handleProceed={() => {}}
        handleStepCompletion={() => {}}
        handleStepBack={() => {}}
      />
    </div>
  ))
  .add('parental information', () => (
    <div className="b-c b-c--nbp b-c--hsm">
      <ParentalInformation
        forSelf={false}
        firstName="Stacy"
        handleProceed={() => {}}
        handleStepCompletion={() => {}}
        handleStepBack={() => {}}
        verificationStepRequired={() => {}}
      />
    </div>
  ))
  .add('verify identification', () => (
    <div className="b-c b-c--nbp b-c--hsm">
      <VerifyIdentification
        handleStepCompletion={() => {}}
        handleProceed={() => {}}
        handleStepBack={() => {}}
      />
    </div>
  ));
