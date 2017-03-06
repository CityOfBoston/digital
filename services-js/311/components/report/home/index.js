// @flow

import { connect } from 'react-redux';

import type { State, Dispatch } from '../../../data/store';
import { setRequestDescription } from '../../../data/store/request';

import HomeDialog from './HomeDialog';
import type { ValueProps, ActionProps } from './HomeDialog';

export default connect(
  ({ request }: State): ValueProps => ({
    requestDescription: request.description,
  }),
  (dispatch: Dispatch): ActionProps => ({
    setRequestDescription(description) { dispatch(setRequestDescription(description)); },
  }),
)(HomeDialog);
