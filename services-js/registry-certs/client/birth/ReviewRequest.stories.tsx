import React from 'react';
import { storiesOf } from '@storybook/react';

import BirthCertificateRequest from '../store/BirthCertificateRequest';

import ReviewRequest from './ReviewRequest';

import { BirthCertificateRequestInformation } from '../types';

export const birthCertRequest: BirthCertificateRequestInformation = {
  forSelf: true,
  howRelated: '',
  bornInBoston: 'yes',
  parentsLivedInBoston: '',
  firstName: 'Martin',
  lastName: 'Walsh',
  altSpelling: '',
  birthDate: '1967-04-10',
  parentsMarried: '',
  parent1FirstName: 'Martin',
  parent1LastName: '',
  parent2FirstName: '',
  parent2LastName: '',
};

const birthCertificateRequest = new BirthCertificateRequest();

birthCertificateRequest.answerQuestion(birthCertRequest);

storiesOf('Birth/ReviewRequest', module).add('default page', () => (
  <ReviewRequest birthCertificateRequest={birthCertificateRequest} />
));
