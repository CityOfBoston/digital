import React from 'react';
import { storiesOf } from '@storybook/react';

import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';
import { MarriageCertificateRequestInformation } from '../../types';

import ForWhom from './ForWhom';

function makeMarriageCertificateRequest(
  answers: Partial<MarriageCertificateRequestInformation> = {}
): MarriageCertificateRequest {
  const marriageCertificateRequest = new MarriageCertificateRequest();
  marriageCertificateRequest.answerQuestion(answers);
  return marriageCertificateRequest;
}

storiesOf('Marriage/Question Components/ForWhom', module)
  .add('default', () => (
    <div className="b-c b-c--hsm">
      <ForWhom
        marriageCertificateRequest={makeMarriageCertificateRequest()}
        handleProceed={() => {}}
      />
    </div>
  ))
  .add('someone else’s', () => (
    <div className="b-c b-c--hsm">
      <ForWhom
        marriageCertificateRequest={makeMarriageCertificateRequest({
          forSelf: false,
        })}
        handleProceed={() => {}}
      />
    </div>
  ));
