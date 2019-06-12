import React from 'react';
import { storiesOf } from '@storybook/react';

import BirthCertificateRequest from '../../store/BirthCertificateRequest';
import { BirthCertificateRequestInformation } from '../../types';

import VerifyIdentification from './VerifyIdentification';

function makeBirthCertificateRequest(
  answers: Partial<BirthCertificateRequestInformation> = {}
): BirthCertificateRequest {
  const birthCertificateRequest = new BirthCertificateRequest();

  birthCertificateRequest.answerQuestion(answers);

  return birthCertificateRequest;
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
        birthCertificateRequest={makeBirthCertificateRequest()}
      />
    </div>
  )
);
