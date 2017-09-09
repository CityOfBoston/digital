// @flow

import Rx from 'rxjs';

import type Elasticsearch from '../services/Elasticsearch';
import type { LoadedCaseBatch } from './load-cases';

import {
  queue,
  retryWithFallback,
  logQueueLength,
  logNonfatalError,
  logMessage,
} from './stage-helpers';

type Opbeat = $Exports<'opbeat'>;

type Deps = {
  elasticsearch: Elasticsearch,
  opbeat: Opbeat,
};

export default function queuingRetryingIndexCasesOp({
  elasticsearch,
  opbeat,
}: Deps): (Rx.Observable<LoadedCaseBatch>) => Rx.Observable<mixed> {
  const retryingIndexCasesOp = caseBatchStream =>
    caseBatchStream
      .mergeMap((batch: LoadedCaseBatch): Promise<mixed> =>
        // Reduce batch records array down to only those whose cases loaded
        elasticsearch.createCases(
          batch.reduce(
            (arr, r) =>
              r.case ? [...arr, { case: r.case, replayId: r.replayId }] : arr,
            []
          )
        )
      )
      .let(
        retryWithFallback(5, 2000, {
          error: err => logNonfatalError('index-cases', err),
        })
      )
      .do(response => {
        logMessage('index-cases', 'Indexing complete', { response });
      });

  return caseBatchStream =>
    caseBatchStream.let(
      queue(retryingIndexCasesOp, {
        length: length => logQueueLength('index-cases', length),
        error: (err, batch: LoadedCaseBatch) => {
          opbeat.captureError(err);
          logMessage('index-cases', 'Permanent failure indexing cases', {
            ids: batch.map(v => v.id),
          });
        },
      })
    );
}
