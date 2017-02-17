// @flow

import { connect } from 'react-redux';

import type { State, Dispatch } from '../../data/store';

import {
  setRequestFirstName,
  setRequestLastName,
  setRequestEmail,
  setRequestPhone,
  submitRequest,
} from '../../data/store/request';

import { navigate } from '../../data/store/route';

import ContactForm from './ContactForm';
import type { ValueProps, ActionProps } from './ContactForm';

const submitAndContinue = () => () => async (dispatch: Dispatch, getState: () => State) => {
  await dispatch(submitRequest());

  if (!getState().request.submitError) {
    dispatch(navigate(
      '/report',
      { step: 'complete' },
      '/report/complete',
    ));
  }
};

const mapStateToProps = ({ request: { firstName, lastName, email, phone, submitting, submitError } }: State): ValueProps => ({
  submitting,
  submitError,
  firstName,
  lastName,
  email,
  phone,
});

const mapDispatchToProps = (dispatch: Dispatch): ActionProps => ({
  onFirstNameChange: (ev) => dispatch(setRequestFirstName(ev.target.value)),
  onLastNameChange: (ev) => dispatch(setRequestLastName(ev.target.value)),
  onEmailChange: (ev) => dispatch(setRequestEmail(ev.target.value)),
  onPhoneChange: (ev) => dispatch(setRequestPhone(ev.target.value)),
  onSubmit: (ev) => {
    ev.preventDefault();
    dispatch(submitAndContinue());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ContactForm);
