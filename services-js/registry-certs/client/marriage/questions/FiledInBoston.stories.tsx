import React from 'react';
import { storiesOf } from '@storybook/react';

import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';
import { MarriageCertificateRequestInformation } from '../../types';

import FiledInBoston from './FiledInBoston';

function makeMarriageCertificateRequest(
  answers: Partial<MarriageCertificateRequestInformation> = {}
): MarriageCertificateRequest {
  const marriageCertificateRequest = new MarriageCertificateRequest();
  marriageCertificateRequest.answerQuestion(answers);
  return marriageCertificateRequest;
}

const commonAttributes = {
  handleProceed: () => {},
  handleStepBack: () => {},
  handleUserReset: () => {},
};

storiesOf('Marriage/Question Components/FiledInBoston', module)
  .add('default', () => (
    <div className="b-c b-c--hsm">
      <FiledInBoston
        {...commonAttributes}
        marriageCertificateRequest={makeMarriageCertificateRequest({
          forSelf: true,
        })}
      />
    </div>
  ))
  .add('user has selected “no”', () => (
    <div className="b-c b-c--hsm">
      <FiledInBoston
        {...commonAttributes}
        marriageCertificateRequest={makeMarriageCertificateRequest({
          forSelf: true,
          filedInBoston: 'no',
        })}
      />
    </div>
  ))
  .add('user is not sure', () => (
    <div className="b-c b-c--hsm">
      <FiledInBoston
        {...commonAttributes}
        marriageCertificateRequest={makeMarriageCertificateRequest({
          forSelf: true,
          filedInBoston: 'unknown',
        })}
      />
    </div>
  ));
