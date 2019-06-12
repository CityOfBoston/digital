import React from 'react';

import { storiesOf } from '@storybook/react';

import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';
import { MarriageCertificateRequestInformation } from '../../types';

import DateOfMarriage from './DateOfMarriage';

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
  marriageCertificateRequest: makeMarriageCertificateRequest(),
};

storiesOf('Marriage/Question Components/DateOfMarriage', module)
  .add('default', () => (
    <div className="b-c b-c--hsm">
      <DateOfMarriage {...commonAttributes} />
    </div>
  ))
  .add('marriage too recent', () => (
    <div className="b-c b-c--hsm">
      <DateOfMarriage {...commonAttributes} showRecentBirthWarning={true} />
    </div>
  ));
