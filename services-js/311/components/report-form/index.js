// @flow

import { connect } from 'react-redux';
import type { State } from '../../data/store';

import {
  setRequestFirstName,
  setRequestLastName,
  setRequestEmail,
  setRequestPhone,
  resetForService,
} from '../../data/store/request';

import ReportFormDialog from './ReportFormDialog';
import type { ValueProps, ActionProps } from './ReportFormDialog';

const mapStateToProps = ({ request }: State): ValueProps => ({
  request,
});

const mapDispatchToProps = (dispatch: Dispatch): ActionProps => ({
  onFirstNameChange: (ev) => dispatch(setRequestFirstName(ev.target.value)),
  onLastNameChange: (ev) => dispatch(setRequestLastName(ev.target.value)),
  onEmailChange: (ev) => dispatch(setRequestEmail(ev.target.value)),
  onPhoneChange: (ev) => dispatch(setRequestPhone(ev.target.value)),
  onShowService: (service) => dispatch(resetForService(service)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReportFormDialog);
