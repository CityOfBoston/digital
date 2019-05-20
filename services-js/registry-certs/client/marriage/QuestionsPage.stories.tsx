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

storiesOf('Marriage/QuestionsFlowPage', module).add(
  '1. Who is this for?',
  () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="forWhom"
      marriageCertificateRequest={makeMarriageCertificateRequest()}
      testDontScroll
    />
  )
);
