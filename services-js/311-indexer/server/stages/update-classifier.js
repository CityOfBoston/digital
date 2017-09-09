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

export default function queueingRetryingUpdateClassifierOp({
  prediction,
  opbeat,
}: Deps): (Rx.Observable<LoadedCaseBatch>) => Rx.Observable<LoadedCaseBatch> {
  const retryingUpdateClassifierOp = caseStream =>
    // We type c to "any" because Flow doesn't support filter as a way of
    // refining to non-maybe types, so it  thinks that this stream is still
    // operating over ?Case values.
    caseStream
      // mergeMap lets us run the caseUpdated API call while preserving access
      // to the original case for logging.
      .mergeMap(
        (c: any) =>
          Rx.Observable.of(c).mergeMap((c: Case) => prediction.caseUpdated(c)),
        (c: Case, response: ?string) => ({ case: c, response })
      )
      .let(
        retryWithFallback(5, 2000, {
          error: err => logNonfatalError('update-classifier', err),
        })
      );

  return caseBatchStream =>
    caseBatchStream.do(batch => {
      Rx.Observable
        .of(...batch)
        .map(r => r.case)
        .filter((c: ?Case) => !!c && c.status === 'closed')
        .let(
          queue(retryingUpdateClassifierOp, {
            error: (err, c) => {
              opbeat.captureError(err);
              logMessage('update-classifier', 'Permanent failure', {
                case: c,
              });
            },
          })
        )
        // Since the success / failure of these requests should not affect the
        // indexing, we just subscribe here and don't bother to merge any
        // results back in.
        .subscribe({
          next: ({ case: c, response }) =>
            logMessage('update-classifier', 'Request complete', {
              response,
              id: c.service_request_id,
              service_code: c.service_code,
              status: c.status,
            }),
          error: err => {
            opbeat.captureError(err);
            logMessage(
              'update-classifier',
              'Unexpected error escaped the queue operation'
            );
          },
          complete: () => logMessage('update-classifier', 'Batch complete'),
        });
    });
}
