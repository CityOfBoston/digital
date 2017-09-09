// @flow

import Rx from 'rxjs';

import type { Case } from '../services/Open311';
import type Prediction from '../services/Prediction';

import type { LoadedCaseBatch } from './load-cases';

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
  batch$: Rx.Observable<LoadedCaseBatch>
): Rx.Observable<mixed> =>
  batch$
    .mergeMap(batch => Rx.Observable.of(...batch))
    .map(r => r.case)
    .filter((c: ?Case) => !!c && c.status === 'closed')
    .let(
      // This queue is maintained across batches, which is nice.
      queue(
        (c: Case) =>
          Rx.Observable
            .defer(() => prediction.caseUpdated(c))
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
