import React from 'react';
import { storiesOf } from '@storybook/react';

import BirthCertificateRequest from '../../store/BirthCertificateRequest';
import { BirthCertificateRequestInformation } from '../../types';

import ParentalInformation from './ParentalInformation';

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
};

storiesOf('Birth/Question Components/ParentalInformation', module)
  .add('default', () => (
    <div className="b-c b-c--hsm">
      <ParentalInformation
        {...commonAttributes}
        birthCertificateRequest={makeBirthCertificateRequest({ forSelf: true })}
      />
    </div>
  ))
  .add('may be restricted (self)', () => (
    <div className="b-c b-c--hsm">
      <ParentalInformation
        {...commonAttributes}
        birthCertificateRequest={makeBirthCertificateRequest({
          forSelf: true,
          parentsMarried: 'no',
        })}
      />
    </div>
  ))
  .add('may be restricted (other)', () => (
    <div className="b-c b-c--hsm">
      <ParentalInformation
        {...commonAttributes}
        birthCertificateRequest={makeBirthCertificateRequest({
          forSelf: false,
          firstName: 'Stacy',
          parentsMarried: 'no',
        })}
      />
    </div>
  ));
