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

function oneWeekAgo(): Date {
  const dayInMs = 8.64e7;

  return new Date(Date.now() - 7 * dayInMs);
}

const commonAttributes = {
  handleProceed: () => {},
  handleStepBack: () => {},
};

storiesOf('Marriage/Question Components/DateOfMarriage', module)
  .add('default', () => (
    <div className="b-c b-c--hsm">
      <DateOfMarriage
        {...commonAttributes}
        marriageCertificateRequest={makeMarriageCertificateRequest({})}
      />
    </div>
  ))
  .add('knows exact date', () => (
    <div className="b-c b-c--hsm">
      <DateOfMarriage
        {...commonAttributes}
        marriageCertificateRequest={makeMarriageCertificateRequest({
          dateOfMarriageExact: new Date(2008, 3, 23),
        })}
      />
    </div>
  ))
  .add('unsure of date', () => (
    <div className="b-c b-c--hsm">
      <DateOfMarriage
        {...commonAttributes}
        marriageCertificateRequest={makeMarriageCertificateRequest({
          dateOfMarriageUnsure: '00/0000 - 00/0000',
        })}
      />
    </div>
  ))
  .add('marriage too recent', () => (
    <div className="b-c b-c--hsm">
      <DateOfMarriage
        {...commonAttributes}
        marriageCertificateRequest={makeMarriageCertificateRequest({
          dateOfMarriageExact: oneWeekAgo(),
        })}
      />
    </div>
  ))
  .add('date range too vast', () => (
    <div className="b-c b-c--hsm">
      <DateOfMarriage
        {...commonAttributes}
        marriageCertificateRequest={makeMarriageCertificateRequest({
          dateOfMarriageUnsure: '1/2000 - 1/2006',
        })}
      />
    </div>
  ));
