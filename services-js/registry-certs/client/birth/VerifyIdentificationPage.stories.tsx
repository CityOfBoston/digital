import React from 'react';
import { storiesOf } from '@storybook/react';

import BirthCertificateRequest from '../store/BirthCertificateRequest';

import VerifyIdentificationPage from './VerifyIdentificationPage';

const birthCertificateRequest = new BirthCertificateRequest();

storiesOf('Birth/VerifyIdentificationPage', module).add('default', () => (
  <VerifyIdentificationPage birthCertificateRequest={birthCertificateRequest} />
));
