// @flow

import Rx from 'rxjs';

import type Open311, { Case } from '../services/Open311';

import {
  queue,
  retryWithFallback,
  logQueueLength,
  logNonfatalError,
  logMessage,
} from './stage-helpers';

type Opbeat = $Exports<'opbeat'>;

type Deps = {
  open311: Open311,
  opbeat: Opbeat,
};

export type CaseIdBatch = Array<{
  id: string,
  replayId: number,
}>;

export type LoadedCaseBatch = Array<{
  id: string,
  replayId: number,
  case: ?Case,
}>;

const hydrateIdBatch = (idBatch: CaseIdBatch) => (
  cases: Array<?Case>
): LoadedCaseBatch =>
  idBatch.map(({ id, replayId }, i) => ({
    id,
    replayId,
    case: cases[i],
  }));

// rxjs operation (use with "let") that converts a stream of CaseIdBatches (an
// array of caseIds and the associated Salesforce CometD replayId values) into a
// stream of hydrated batches suitable for indexing in Elasticsearch.
//
// The incoming batches are queued so that only one call to the Open311 API is
// active at any time. Open311 API failures are retried with an exponential
// backoff before failing.
//
// This op catches and logs / reports most errors so that the source observable
// isn't terminated. The exception is Salesforce session auth exceptions, which
// we propagate up to terminate the job.
export default ({ open311, opbeat }: Deps) => (
  batch$: Rx.Observable<CaseIdBatch>
): Rx.Observable<LoadedCaseBatch> =>
  batch$.let(
    queue(
      idBatch =>
        Rx.Observable
          .defer(() => open311.loadCases(idBatch.map(({ id }) => id)))
          .let(
            retryWithFallback(5, 2000, {
              error: err => logNonfatalError('load-cases', err),
            })
          )
          .map(hydrateIdBatch(idBatch))
          .do(caseBatch => {
            logMessage('load-cases', 'Loading complete', {
              ids: caseBatch.map(b => b.id),
            });
          }),
      {
        length: length => logQueueLength('load-cases', length),
        error: (err, batch) => {
          // If we get this error message from Salesforce, it means that our
          // OAuth token has expired and we need to restart to fetch it.
          //
          // Throwing out of this stage will fail back up to the server
          // pipeline.
          if (err.message === 'Session expired or invalid') {
            logMessage('load-cases', 'Salesforce auth error loading cases', {
              batch,
            });

            throw err;
          } else {
            opbeat.captureError(err);
            logMessage('load-cases', 'Permanent failure loading cases', {
              batch,
            });
          }
        },
      }
    )
  );
