import React from 'react';
import { storiesOf } from '@storybook/react';

import BirthCertificateRequest from '../../store/BirthCertificateRequest';
import { BirthCertificateRequestInformation } from '../../types';

import BornInBoston from './BornInBoston';

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
  handleUserReset: () => {},
};

storiesOf('Birth/Question Components/BornInBoston', module)
  .add('initial question', () => (
    <div className="b-c b-c--hsm">
      <BornInBoston
        {...commonAttributes}
        birthCertificateRequest={makeBirthCertificateRequest()}
      />
    </div>
  ))
  .add('secondary question', () => (
    <div className="b-c b-c--hsm">
      <BornInBoston
        {...commonAttributes}
        birthCertificateRequest={makeBirthCertificateRequest({
          bornInBoston: 'unknown',
        })}
      />
    </div>
  ))
  .add('may not have record', () => (
    <div className="b-c b-c--hsm">
      <BornInBoston
        {...commonAttributes}
        birthCertificateRequest={makeBirthCertificateRequest({
          bornInBoston: 'unknown',
          parentsLivedInBoston: 'unknown',
        })}
      />
    </div>
  ))
  .add('will not have record', () => (
    <div className="b-c b-c--hsm">
      <BornInBoston
        {...commonAttributes}
        birthCertificateRequest={makeBirthCertificateRequest({
          bornInBoston: 'no',
          parentsLivedInBoston: 'no',
        })}
      />
    </div>
  ));
