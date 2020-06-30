import React from 'react';
import { storiesOf } from '@storybook/react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';
import { MarriageIntentionCertificateRequestInformation } from '../../types';

import ParentalInformation from './ParentalInformation';

function makeMarriageIntentionCertificateRequest(
  answers: Partial<MarriageIntentionCertificateRequestInformation> = {}
): MarriageIntentionCertificateRequest {
  const marriageIntentionCertificateRequest = new MarriageIntentionCertificateRequest();
  marriageIntentionCertificateRequest.answerQuestion(answers);
  return marriageIntentionCertificateRequest;
}

const commonAttributes = {
  handleProceed: () => {},
  handleStepBack: () => {},
};

storiesOf('Marriage-Intention/Question Components/ParentalInformation', module)
  .add('default', () => (
    <div className="b-c b-c--hsm">
      <ParentalInformation
        {...commonAttributes}
        marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest(
          {
            forSelf: true,
          }
        )}
      />
    </div>
  ))
  .add('may be restricted (self)', () => (
    <div className="b-c b-c--hsm">
      <ParentalInformation
        {...commonAttributes}
        marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest(
          {
            forSelf: true,
            parentsMarried: 'no',
          }
        )}
      />
    </div>
  ))
  .add('may be restricted (other)', () => (
    <div className="b-c b-c--hsm">
      <ParentalInformation
        {...commonAttributes}
        marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest(
          {
            forSelf: false,
            firstName: 'Stacy',
            parentsMarried: 'no',
          }
        )}
      />
    </div>
  ));
