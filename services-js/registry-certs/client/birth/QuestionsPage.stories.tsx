import React from 'react';
import { storiesOf } from '@storybook/react';

import { BirthCertificateRequestInformation } from '../types';
import BirthCertificateRequest from '../store/BirthCertificateRequest';

import QuestionsPage from './QuestionsPage';

function makeBirthCertificateRequest(
  answers: Partial<BirthCertificateRequestInformation> = {}
): BirthCertificateRequest {
  const birthCertificateRequest = new BirthCertificateRequest();
  birthCertificateRequest.answerQuestion(answers);
  return birthCertificateRequest;
}

storiesOf('Birth/QuestionsFlow/1. Who is this for?', module)
  .add('blank', () => (
    <QuestionsPage
      currentStep="forWhom"
      birthCertificateRequest={makeBirthCertificateRequest()}
    />
  ))
  .add('for someone else', () => (
    <QuestionsPage
      currentStep="forWhom"
      birthCertificateRequest={makeBirthCertificateRequest({ forSelf: false })}
    />
  ));

storiesOf('Birth/QuestionsFlow/1a. Client instructions', module).add(
  'default',
  () => (
    <QuestionsPage
      currentStep="clientInstructions"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: false,
        howRelated: 'client',
      })}
    />
  )
);

storiesOf('Birth/QuestionsFlow/2. Born in Boston?', module)
  .add('blank', () => (
    <QuestionsPage
      currentStep="bornInBoston"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: true,
      })}
    />
  ))
  .add('maybe no', () => (
    <QuestionsPage
      currentStep="bornInBoston"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: true,
        bornInBoston: 'unknown',
        parentsLivedInBoston: 'unknown',
      })}
    />
  ))
  .add('hard no', () => (
    <QuestionsPage
      currentStep="bornInBoston"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: true,
        bornInBoston: 'no',
        parentsLivedInBoston: 'no',
      })}
    />
  ));

storiesOf('Birth/QuestionsFlow/3. Personal information', module).add(
  'blank',
  () => (
    <QuestionsPage
      currentStep="personalInformation"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: true,
      })}
    />
  )
);

storiesOf('Birth/QuestionsFlow/4. Parental information', module)
  .add('blank', () => (
    <QuestionsPage
      currentStep="parentalInformation"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: false,
        firstName: 'Stacy',
      })}
    />
  ))
  .add('may be restricted (self)', () => (
    <QuestionsPage
      currentStep="parentalInformation"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: true,
        firstName: 'Stacy',
        parentsMarried: 'no',
      })}
    />
  ))
  .add('may be restricted (other)', () => (
    <QuestionsPage
      currentStep="parentalInformation"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: false,
        firstName: 'Stacy',
        parentsMarried: 'unknown',
      })}
    />
  ));

storiesOf('Birth/QuestionsFlow/5. Identity verification', module).add(
  'blank',
  () => (
    <QuestionsPage
      currentStep="verifyIdentification"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: true,
        parentsMarried: 'no',
      })}
    />
  )
);
