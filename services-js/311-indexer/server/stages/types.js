// @flow

import type { DetailedServiceRequest } from '../services/Open311';

export type UpdatedCaseNotificationRecord = {|
  id: string,
  replayId: ?number,
|};

export type HydratedCaseRecord = {|
  id: string,
  // can be null if case is hidden or we don't have permission to get it.
  case: ?DetailedServiceRequest,
  replayId: ?number,
|};
