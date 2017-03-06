// @flow

import { connect } from 'react-redux';

import type { State, Dispatch } from '../../../data/store';

import {
  setRequestFirstName,
setRequestLastName,
setRequestEmail,
setRequestPhone,
setAttribute,
} from '../../../data/store/request';

import QuestionsPane from './QuestionsPane';
import type { ValueProps as QuestionsPaneValueProps, ActionProps as QuestionsPaneActionProps } from './QuestionsPane';

import ContactPane from './ContactPane';
import type { ValueProps as ContactPaneValueProps, ActionProps as ContactPaneActionProps } from './ContactPane';

import LocationPopUp from './LocationPopUp';
import type { ValueProps as LocationPopUpValueProps } from './LocationPopUp';

export const QuestionsPaneContainer = connect(
  ({ request }: State): QuestionsPaneValueProps => ({
    request,
  }),
  (dispatch: Dispatch): QuestionsPaneActionProps => ({
    setAttribute(code, value) { dispatch(setAttribute(code, value)); },
  }),
)(QuestionsPane);

export const ContactPaneContainer = connect(
  ({ request }: State): ContactPaneValueProps => ({
    request,
  }),
  (dispatch: Dispatch): ContactPaneActionProps => ({
    setRequestFirstName(firstName) { dispatch(setRequestFirstName(firstName)); },
    setRequestLastName(lastName) { dispatch(setRequestLastName(lastName)); },
    setRequestEmail(email) { dispatch(setRequestEmail(email)); },
    setRequestPhone(phone) { dispatch(setRequestPhone(phone)); },
  }),
)(ContactPane);

export const LocationPopUpContainer = connect(
  ({ request }: State): LocationPopUpValueProps => ({
    address: request.address,
  }),
)(LocationPopUp);
