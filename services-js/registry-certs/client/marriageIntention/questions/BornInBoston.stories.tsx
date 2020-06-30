import React from 'react';
import { storiesOf } from '@storybook/react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';
import { MarriageIntentionCertificateRequestInformation } from '../../types';

import BornInBoston from './BornInBoston';

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
  handleUserReset: () => {},
};

storiesOf('Marriage-Intention/Question Components/BornInBoston', module)
  .add('initial question', () => (
    <div className="b-c b-c--hsm">
      <BornInBoston
        {...commonAttributes}
        marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
      />
    </div>
  ))
  .add('secondary question', () => (
    <div className="b-c b-c--hsm">
      <BornInBoston
        {...commonAttributes}
        marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest(
          {
            bornInBoston: 'unknown',
          }
        )}
      />
    </div>
  ))
  .add('may not have record', () => (
    <div className="b-c b-c--hsm">
      <BornInBoston
        {...commonAttributes}
        marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest(
          {
            bornInBoston: 'unknown',
            parentsLivedInBoston: 'unknown',
          }
        )}
      />
    </div>
  ))
  .add('will not have record', () => (
    <div className="b-c b-c--hsm">
      <BornInBoston
        {...commonAttributes}
        marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest(
          {
            bornInBoston: 'no',
            parentsLivedInBoston: 'no',
          }
        )}
      />
    </div>
  ));
