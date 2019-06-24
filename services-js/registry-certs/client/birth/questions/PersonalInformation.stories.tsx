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

function oneWeekAgo(): Date {
  const dayInMs = 8.64e7;

  return new Date(Date.now() - 7 * dayInMs);
}

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
          birthDate: oneWeekAgo(),
        })}
      />
    </div>
  ));
