import React from 'react';
import { storiesOf } from '@storybook/react';

import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';
import { MarriageCertificateRequestInformation } from '../../types';

import VerifyIdentification from './VerifyIdentification';

function makeMarriageCertificateRequest(
  answers: Partial<MarriageCertificateRequestInformation> = {}
): MarriageCertificateRequest {
  const marriageCertificateRequest = new MarriageCertificateRequest();

  marriageCertificateRequest.answerQuestion(answers);

  return marriageCertificateRequest;
}

const commonAttributes = {
  handleProceed: () => {},
  handleStepBack: () => {},
};

storiesOf('Marriage/Question Components/VerifyIdentification', module).add(
  'default',
  () => (
    <div className="b-c b-c--hsm">
      <VerifyIdentification
        {...commonAttributes}
        marriageCertificateRequest={makeMarriageCertificateRequest()}
      />
    </div>
  )
);
