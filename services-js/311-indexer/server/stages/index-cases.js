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

// Reduce batch records array down to only those whose cases loaded
const reduceToIndexableCases = (batch: LoadedCaseBatch) =>
  batch.reduce(
    (arr, r) =>
      r.case ? [...arr, { case: r.case, replayId: r.replayId }] : arr,
    []
  );

export default ({ elasticsearch, opbeat }: Deps) => (
  batch$: Rx.Observable<LoadedCaseBatch>
) =>
  batch$.let(
    queue(
      caseBatch =>
        Rx.Observable
          .defer(() =>
            elasticsearch.createCases(reduceToIndexableCases(caseBatch))
          )
          .let(
            retryWithFallback(5, 2000, {
              error: err => logNonfatalError('index-cases', err),
            })
          )
          .do(response => {
            logMessage('index-cases', 'Indexing complete', { response });
          }),
      {
        length: length => logQueueLength('index-cases', length),
        error: (err, batch: LoadedCaseBatch) => {
          opbeat.captureError(err);
          logMessage('index-cases', 'Permanent failure indexing cases', {
            ids: batch.map(v => v.id),
          });
        },
      }
    )
  );
