import React from 'react';
import { storiesOf } from '@storybook/react';
import ApplicationForm, { Props } from './ApplicationForm';
import { action } from '@storybook/addon-actions';

const COMMISSIONS = [
  {
    name: 'Aberdeen Architectural Conservation District Commission',
    id: 0,
    openSeats: 2,
  },
  {
    name:
      'Back Bay West/Bay State Road Architectural Conservation District Commission',
    id: 1,
    openSeats: 1,
  },
  {
    name: 'Living Wage Advisory Committee',
    id: 2,
    openSeats: 1,
  },
  {
    name: 'Licensing Board for the City of Boston',
    id: 3,
    openSeats: 0,
  },
];

const COMMISSIONS_WITH_OPEN_SEATS = COMMISSIONS.filter(
  ({ openSeats }) => openSeats > 0
);
const COMMISSIONS_WITHOUT_OPEN_SEATS = COMMISSIONS.filter(
  ({ openSeats }) => openSeats === 0
);

const DEFAULT_PROPS: Props = {
  commissionsWithOpenSeats: COMMISSIONS_WITH_OPEN_SEATS,
  commissionsWithoutOpenSeats: COMMISSIONS_WITHOUT_OPEN_SEATS,
  formRef: React.createRef(),
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
  clearSubmissionError: action('clearSubmissionErro'),
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
  .add('auto-expand no open seats', () => (
    <ApplicationForm
      {...DEFAULT_PROPS}
      values={{ ...DEFAULT_PROPS.values, commissionIds: ['3'] }}
    />
  ))
  .add('submitting', () => <ApplicationForm {...DEFAULT_PROPS} isSubmitting />)
  .add('submission error', () => (
    <ApplicationForm {...DEFAULT_PROPS} submissionError />
  ));
