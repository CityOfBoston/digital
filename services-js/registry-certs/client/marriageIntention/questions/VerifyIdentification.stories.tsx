import React from 'react';
import { storiesOf } from '@storybook/react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';
import { MarriageIntentionCertificateRequestInformation } from '../../types';

import VerifyIdentification from './VerifyIdentification';

function makeMarriageIntentionCertificateRequest(
  answers: Partial<MarriageIntentionCertificateRequestInformation> = {}
): MarriageIntentionCertificateRequest {
  const marriageIntentionCertificateRequest = new MarriageIntentionCertificateRequest();

  marriageIntentionCertificateRequest.answerQuestion(answers);

  return marriageIntentionCertificateRequest;
}

const commonAttributes = {
  siteAnalytics: {} as any,
  handleProceed: () => {},
  handleStepBack: () => {},
};

storiesOf('Birth/Question Components/VerifyIdentification', module).add(
  'default',
  () => (
    <div className="b-c b-c--hsm">
      <VerifyIdentification
        {...commonAttributes}
        marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
      />
    </div>
  )
);
