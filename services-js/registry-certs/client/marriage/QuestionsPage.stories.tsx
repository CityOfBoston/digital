import React from 'react';
import { storiesOf } from '@storybook/react';

import { MarriageCertificateRequestInformation } from '../types';
import MarriageCertificateRequest from '../store/MarriageCertificateRequest';

import QuestionsPage from './QuestionsPage';

function makeMarriageCertificateRequest(
  answers: Partial<MarriageCertificateRequestInformation> = {}
): MarriageCertificateRequest {
  const marriageCertificateRequest = new MarriageCertificateRequest();

  marriageCertificateRequest.answerQuestion(answers);

  return marriageCertificateRequest;
}

storiesOf('Marriage/QuestionsFlowPage', module)
  .add('1. Who is this for?', () => (
    <QuestionsPage
      currentStep="forWhom"
      marriageCertificateRequest={makeMarriageCertificateRequest()}
    />
  ))
  .add('1a. Client instructions', () => (
    <QuestionsPage
      currentStep="clientInstructions"
      marriageCertificateRequest={makeMarriageCertificateRequest({
        forSelf: false,
        howRelated: 'client',
      })}
    />
  ))
  .add('2. Filed in Boston?', () => (
    <QuestionsPage
      currentStep="filedInBoston"
      marriageCertificateRequest={makeMarriageCertificateRequest({
        forSelf: true,
      })}
    />
  ))
  .add('3. Date of marriage?', () => (
    <QuestionsPage
      currentStep="dateOfMarriage"
      marriageCertificateRequest={makeMarriageCertificateRequest({
        forSelf: true,
      })}
    />
  ))
  .add('4. Person on record (1)', () => (
    <QuestionsPage
      currentStep="personOnRecord1"
      marriageCertificateRequest={makeMarriageCertificateRequest({
        forSelf: true,
      })}
    />
  ))
  .add('5. Person on record (2)', () => (
    <QuestionsPage
      currentStep="personOnRecord2"
      marriageCertificateRequest={makeMarriageCertificateRequest({
        forSelf: true,
      })}
    />
  ))
  .add('6. Identity verification', () => (
    <QuestionsPage
      currentStep="verifyIdentification"
      marriageCertificateRequest={makeMarriageCertificateRequest({
        forSelf: true,
        parentsMarried1: 'no',
      })}
    />
  ));
