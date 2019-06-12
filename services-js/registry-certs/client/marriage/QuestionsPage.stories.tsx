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
      siteAnalytics={{} as any}
      currentStep="forWhom"
      marriageCertificateRequest={makeMarriageCertificateRequest()}
      testDontScroll
    />
  ))
  .add('1a. Client instructions', () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="clientInstructions"
      marriageCertificateRequest={makeMarriageCertificateRequest({
        forSelf: false,
        howRelated: 'client',
      })}
      testDontScroll
    />
  ))
  .add('2. Filed in Boston?', () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="filedInBoston"
      marriageCertificateRequest={makeMarriageCertificateRequest({
        forSelf: true,
      })}
      testDontScroll
    />
  ))
  .add('3. Date of marriage?', () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="dateOfMarriage"
      marriageCertificateRequest={makeMarriageCertificateRequest({
        forSelf: true,
      })}
      testDontScroll
    />
  ))
  .add('4. Person on record (1)', () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="personOnRecord1"
      marriageCertificateRequest={makeMarriageCertificateRequest({
        forSelf: true,
      })}
      testDontScroll
    />
  ))
  .add('5. Person on record (2)', () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="personOnRecord2"
      marriageCertificateRequest={makeMarriageCertificateRequest({
        forSelf: true,
      })}
      testDontScroll
    />
  ))
  .add('6. Identity verification', () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="verifyIdentification"
      marriageCertificateRequest={makeMarriageCertificateRequest({
        forSelf: true,
        parentsMarried1: 'no',
      })}
      testDontScroll
    />
  ));
