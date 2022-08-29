import React from 'react';
import { storiesOf } from '@storybook/react';
import ApplicationForm, { Props } from './ApplicationForm';
import { action } from '@storybook/addon-actions';

const COMMISSIONS = [
  {
    name: 'Aberdeen Architectural Conservation District Commission',
    id: 0,
    openSeats: 2,
    homepageUrl: 'http://',
  },
  {
    name:
      'Back Bay West/Bay State Road Architectural Conservation District Commission',
    id: 1,
    openSeats: 1,
    homepageUrl: 'http://',
  },
  {
    name: 'Living Wage Advisory Committee',
    id: 2,
    openSeats: 1,
    homepageUrl: 'http://',
  },
  {
    name: 'Licensing Board for the City of Boston',
    id: 3,
    openSeats: 0,
    homepageUrl: 'http://',
  },
];

const DEFAULT_PROPS: Props = {
  commissions: COMMISSIONS,
  values: {
    firstName: '',
    middleName: '',
    lastName: '',
    streetAddress: '',
    unit: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    confirmEmail: '',
    commissionIds: [],
    degreeAttained: '',
    educationalInstitution: '',
    otherInformation: '',
    coverLetter: null,
    resume: null,
  },
  errors: {},
  touched: {},
  handleBlur: action('handleBlur'),
  handleChange: action('handleChange'),
  handleSubmit: action('handleSubmit'),
  setFieldValue: action('setFieldValue'),
  isSubmitting: false,
  isValid: false,
  submissionError: false,
  clearSubmissionError: action('clearSubmissionError'),
};

storiesOf('ApplicationForm', module)
  .addDecorator(story => <div className="b-c">{story()}</div>)
  .add('blank', () => <ApplicationForm {...DEFAULT_PROPS} />)
  .add('errors', () => (
    <ApplicationForm
      {...DEFAULT_PROPS}
      errors={{
        firstName: 'First name is required',
        lastName: 'Last name is required',
      }}
      touched={{ firstName: true, lastName: true }}
    />
  ))
  .add('filled in', () => (
    <ApplicationForm
      {...DEFAULT_PROPS}
      isValid
      values={{
        firstName: 'Gwen',
        middleName: '',
        lastName: 'Stacy',
        streetAddress: '123 Fake St.',
        unit: '',
        city: 'New York',
        state: 'NY',
        zip: '01110',
        phone: '(212) 555-1234',
        email: 'ghosty@spiders.net',
        confirmEmail: 'ghosty@spiders.net',
        commissionIds: ['2', '3'],
        degreeAttained: 'High School',
        educationalInstitution: 'Midtown High School',
        otherInformation: 'I have spider powers.',
        coverLetter: {} as any,
        resume: {} as any,
      }}
    />
  ))
  .add('submitting', () => <ApplicationForm {...DEFAULT_PROPS} isSubmitting />)
  .add('submission error', () => (
    <ApplicationForm {...DEFAULT_PROPS} submissionError />
  ));
