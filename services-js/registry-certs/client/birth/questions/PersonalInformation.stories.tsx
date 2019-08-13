import React from 'react';
import { storiesOf } from '@storybook/react';

import BirthCertificateRequest from '../../store/BirthCertificateRequest';
import { BirthCertificateRequestInformation } from '../../types';

import PersonalInformation from './PersonalInformation';

function makeBirthCertificateRequest(
  answers: Partial<BirthCertificateRequestInformation> = {}
): BirthCertificateRequest {
  const birthCertificateRequest = new BirthCertificateRequest();
  birthCertificateRequest.answerQuestion(answers);

  return birthCertificateRequest;
}

const commonAttributes = {
  handleProceed: () => {},
  handleStepBack: () => {},
  birthCertificateRequest: makeBirthCertificateRequest(),
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
        birthCertificateRequest={makeBirthCertificateRequest({
          birthDate: new Date(1990, 3, 28),
        })}
        showRecentBirthWarning={true}
      />
    </div>
  ));
