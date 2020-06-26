import React from 'react';
import { storiesOf } from '@storybook/react';

import { MarriageIntentionCertificateRequestInformation } from '../types';
import MarriageIntentionCertificateRequest from '../store/MarriageIntentionCertificateRequest';

import QuestionsPage from './QuestionsPage';

function makeMarriageIntentionCertificateRequest(
  answers: Partial<MarriageIntentionCertificateRequestInformation> = {}
): MarriageIntentionCertificateRequest {
  const marriageIntentionCertificateRequest = new MarriageIntentionCertificateRequest();
  marriageIntentionCertificateRequest.answerQuestion(answers);
  return marriageIntentionCertificateRequest;
}

storiesOf('Birth/QuestionsFlowPage', module).add('1. Who is this for?', () => (
  <QuestionsPage
    siteAnalytics={{} as any}
    currentStep="forWhom"
    marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
  />
));

storiesOf('Birth/QuestionsFlowPage', module).add(
  '1a. Client instructions',
  () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="clientInstructions"
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest(
        {
          forSelf: false,
          howRelated: 'client',
        }
      )}
    />
  )
);

storiesOf('Birth/QuestionsFlowPage', module).add('2. Born in Boston?', () => (
  <QuestionsPage
    siteAnalytics={{} as any}
    currentStep="bornInBoston"
    marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest(
      {
        forSelf: true,
      }
    )}
  />
));

storiesOf('Birth/QuestionsFlowPage', module).add(
  '3. Personal information',
  () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="personalInformation"
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest(
        {
          forSelf: true,
        }
      )}
    />
  )
);

storiesOf('Birth/QuestionsFlowPage', module).add(
  '4. Parental information',
  () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="parentalInformation"
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest(
        {
          forSelf: false,
          firstName: 'Stacy',
        }
      )}
    />
  )
);

storiesOf('Birth/QuestionsFlowPage', module).add(
  '5. Identity verification',
  () => (
    <QuestionsPage
      siteAnalytics={{} as any}
      currentStep="verifyIdentification"
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest(
        {
          forSelf: true,
          parentsMarried: 'no',
        }
      )}
    />
  )
);
