import React from 'react';
import { storiesOf } from '@storybook/react';

import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';
import { MarriageCertificateRequestInformation } from '../../types';

import PersonOnRecord, { Person } from './PersonOnRecord';

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
  person: 'person1' as Person,
  marriageCertificateRequest: makeMarriageCertificateRequest(),
};

storiesOf('Marriage/Question Components/PersonOnRecord', module)
  .add('person 1', () => (
    <div className="b-c b-c--hsm">
      <PersonOnRecord {...commonAttributes} />
    </div>
  ))
  .add('person 2', () => (
    <div className="b-c b-c--hsm">
      <PersonOnRecord {...commonAttributes} person="person2" />
    </div>
  ))
  .add('self', () => (
    <div className="b-c b-c--hsm">
      <PersonOnRecord
        {...commonAttributes}
        marriageCertificateRequest={makeMarriageCertificateRequest({
          forSelf: true,
        })}
      />
    </div>
  ));
