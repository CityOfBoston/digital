import React from 'react';
import { storiesOf } from '@storybook/react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';
import { MarriageIntentionCertificateRequestInformation } from '../../types';

import PersonalInformation from './PersonalInformation';

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
  marriageIntentionCertificateRequest: makeMarriageIntentionCertificateRequest(),
};

storiesOf('Birth/Question Components/PersonalInformation', module)
  .add('default', () => (
    <div className="b-c b-c--hsm">
      <PersonalInformation {...commonAttributes} />
    </div>
  ))
  .add('birth too recent', () => (
    <div className="b-c b-c--hsm">
      <PersonalInformation
        {...commonAttributes}
        marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest(
          {
            birthDate: new Date(1990, 3, 28),
          }
        )}
        showRecentBirthWarning={true}
      />
    </div>
  ));
