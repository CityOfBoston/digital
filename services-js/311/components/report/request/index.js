// @flow

import { connect } from 'react-redux';

import type { Service } from '../../../data/types';
import type { State, Dispatch } from '../../../data/store';

import { resetRequestForService } from '../../../data/store/request';

import RequestDialog from './RequestDialog';
import type { ValueProps, ActionProps } from './RequestDialog';

export default connect(
  ({ request }: State): ValueProps => ({
    request,
  }),
  (dispatch: Dispatch): ActionProps => ({
    resetRequestForService(service: Service) { dispatch(resetRequestForService(service)); },
  }),
)(RequestDialog);
