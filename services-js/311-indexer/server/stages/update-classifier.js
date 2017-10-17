// @flow

import Rx from 'rxjs';

import type { DetailedServiceRequest } from '../services/Open311';
import type Prediction from '../services/Prediction';

import type { HydratedCaseRecord } from './types';

import {
  queue,
  retryWithFallback,
  logNonfatalError,
  logMessage,
} from './stage-helpers';

type Opbeat = $Exports<'opbeat'>;

type Deps = {
  prediction: Prediction,
  opbeat: Opbeat,
};

// Converts a batch of loaded cases into a stream of individual cases which then
// get sent to the classifier, each with its own exponential retries.
export default ({ prediction, opbeat }: Deps) => (
  cases$: Rx.Observable<HydratedCaseRecord>
): Rx.Observable<mixed> =>
  cases$.filter(({ case: c }) => !!c).map(({ case: c }) => (c: any)).let(
    queue(
      (c: DetailedServiceRequest) =>
        Rx.Observable
          .defer(() => prediction.reportCaseUpdate(c))
          .let(
            retryWithFallback(5, 2000, {
              error: err => logNonfatalError('update-classifier', err),
            })
          )
          .do(response =>
            logMessage('update-classifier', 'Request complete', {
              response,
              id: c.service_request_id,
              service_code: c.service_code,
              status: c.status,
            })
          ),
      {
        error: (err, c) => {
          opbeat.captureError(err);
          logMessage('update-classifier', 'Permanent failure', {
            case: c,
          });
        },
      },
      5
    )
  );
