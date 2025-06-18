import React from 'react';
import { storiesOf } from '@storybook/react';

import MarriageCertificateRequest from '../store/MarriageCertificateRequest';

import ReviewRequestPage from './ReviewRequestPage';

import { TYPICAL_REQUEST as marriageCertRequest } from '../../fixtures/client/marriage-certificates';

import CertMailProvider from '../store/CertifiedMailProvider';

const marriageCertificateRequest = new MarriageCertificateRequest();

marriageCertificateRequest.setRequestInformation(marriageCertRequest);

storiesOf('Marriage/ReviewRequestPage', module).add('default page', () => (
  <ReviewRequestPage
    marriageCertificateRequest={marriageCertificateRequest}
    certMailProvider={new CertMailProvider()}
    cardTypeProvider={{ get: () => new Promise(() => {}) } as any}
  />
));
