// @flow
import React from 'react';
import renderer from 'react-test-renderer';

import RequestForm from '../../../data/store/RequestForm';

import ContactPane from './ContactPane';

let requestForm;

beforeEach(() => {
  requestForm = new RequestForm();
});

test('blank request', () => {
  const component = renderer.create(
    <ContactPane serviceName="Cosmic Incursion" requestForm={requestForm} nextFunc={jest.fn()} />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});

test('filled request', () => {
  requestForm.firstName = 'Carol';
  requestForm.lastName = 'Danvers';
  requestForm.email = 'marvel@alphaflight.gov';
  requestForm.phone = '6175551234';

  const component = renderer.create(
    <ContactPane serviceName="Cosmic Incursion" requestForm={requestForm} nextFunc={jest.fn()} />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});
