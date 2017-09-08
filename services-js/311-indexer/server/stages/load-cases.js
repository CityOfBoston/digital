// @flow

import Rx from 'rxjs';

import type Open311, { Case } from '../services/Open311';

import {
  queue,
  awaitPromise,
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

// rxjs operation (use with "let") that converts a stream of CaseIdBatches (an
// array of caseIds and the associated Salesforce CometD replayId values) into a
// stream of hydrated batches suitable for indexing in Elasticsearch.
//
// The incoming batches are queued so that only one call to the Open311 API is
// active at any time. Open311 API failures are retried with an exponential
// backoff before failing.
//
// This op catches and logs / reports all errors so that the source observable
// isn't terminated.
export default function queuingRetryingLoadCaseIdBatchOp({
  open311,
  opbeat,
}: Deps): (Rx.Observable<CaseIdBatch>) => Rx.Observable<LoadedCaseBatch> {
  const retryingLoadCaseIdBatchOp = caseIdBatchStream =>
    caseIdBatchStream
      .map(async (caseIdBatch: CaseIdBatch): Promise<LoadedCaseBatch> => {
        const cases = await open311.loadCases(caseIdBatch.map(({ id }) => id));

        return caseIdBatch.map(({ id, replayId }, i) => ({
          id,
          replayId,
          case: cases[i],
        }));
      })
      .let(awaitPromise)
      // retryWithFallback re-subscribes to an observable to cause the retry.
      // Since queue (used below) creates a new, single-value observable for
      // each value that comes out of the queue, the re-subscription will bubble
      // up to thet observable rather than all the way to our Salesforce event
      // source observable.
      //
      // This also means that permanent failures will only error that
      // single-value observable rather than the Salesforce event source
      // observable.
      .let(
        retryWithFallback(5, 2000, {
          error: err => {
            opbeat.captureError(err);
            logNonfatalError('load-cases', err);
          },
        })
      );

  return caseIdBatchStream =>
    caseIdBatchStream.let(
      queue(retryingLoadCaseIdBatchOp, {
        length: length => logQueueLength('load-cases', length),
        error: (err, batch) => {
          logMessage('load-cases', 'Permanent failure loading cases', {
            batch,
          });
        },
      })
    );
}
