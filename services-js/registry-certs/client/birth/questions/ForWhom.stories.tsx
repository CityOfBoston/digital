import React from 'react';
import { storiesOf } from '@storybook/react';

import BirthCertificateRequest from '../../store/BirthCertificateRequest';
import { BirthCertificateRequestInformation } from '../../types';

import ForWhom from './ForWhom';

function makeBirthCertificateRequest(
  answers: Partial<BirthCertificateRequestInformation> = {}
): BirthCertificateRequest {
  const birthCertificateRequest = new BirthCertificateRequest();
  birthCertificateRequest.answerQuestion(answers);
  return birthCertificateRequest;
}

storiesOf('Birth/Question Components/ForWhom', module)
  .add('default', () => (
    <div className="b-c b-c--hsm">
      <ForWhom
        birthCertificateRequest={makeBirthCertificateRequest()}
        handleProceed={() => {}}
      />
    </div>
  ))
  .add('someone else’s', () => (
    <div className="b-c b-c--hsm">
      <ForWhom
        birthCertificateRequest={makeBirthCertificateRequest({
          forSelf: false,
        })}
        handleProceed={() => {}}
      />
    </div>
  ));
