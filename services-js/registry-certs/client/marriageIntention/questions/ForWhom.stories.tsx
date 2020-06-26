import React from 'react';
import { storiesOf } from '@storybook/react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';
import { MarriageIntentionCertificateRequestInformation } from '../../types';

import ForWhom from './ForWhom';

function makeMarriageIntentionCertificateRequest(
  answers: Partial<MarriageIntentionCertificateRequestInformation> = {}
): MarriageIntentionCertificateRequest {
  const marriageIntentionCertificateRequest = new MarriageIntentionCertificateRequest();
  marriageIntentionCertificateRequest.answerQuestion(answers);
  return marriageIntentionCertificateRequest;
}

storiesOf('Birth/Question Components/ForWhom', module)
  .add('default', () => (
    <div className="b-c b-c--hsm">
      <ForWhom
        marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
        handleProceed={() => {}}
      />
    </div>
  ))
  .add('someone else’s', () => (
    <div className="b-c b-c--hsm">
      <ForWhom
        marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest(
          {
            forSelf: false,
          }
        )}
        handleProceed={() => {}}
      />
    </div>
  ));
