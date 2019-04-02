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

storiesOf('Birth/QuestionsFlowPage', module).add('1. Who is this for?', () => (
  <QuestionsPage
    siteAnalytics={{} as any}
    currentStep="forWhom"
    birthCertificateRequest={makeBirthCertificateRequest()}
  />
));

storiesOf('Birth/QuestionsFlowPage', module).add(
  '1a. Client instructions',
  () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="clientInstructions"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: false,
        howRelated: 'client',
      })}
    />
  )
);

storiesOf('Birth/QuestionsFlowPage', module).add('2. Born in Boston?', () => (
  <QuestionsPage
    siteAnalytics={{} as any}
    currentStep="bornInBoston"
    birthCertificateRequest={makeBirthCertificateRequest({
      forSelf: true,
    })}
  />
));

storiesOf('Birth/QuestionsFlowPage', module).add(
  '3. Personal information',
  () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="personalInformation"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: true,
      })}
    />
  )
);

storiesOf('Birth/QuestionsFlowPage', module).add(
  '4. Parental information',
  () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="parentalInformation"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: false,
        firstName: 'Stacy',
      })}
    />
  )
);

storiesOf('Birth/QuestionsFlowPage', module).add(
  '5. Identity verification',
  () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="verifyIdentification"
      birthCertificateRequest={makeBirthCertificateRequest({
        forSelf: true,
        parentsMarried: 'no',
      })}
    />
  )
);
