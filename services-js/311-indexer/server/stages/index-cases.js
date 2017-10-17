// @flow

import Rx from 'rxjs';

import type Elasticsearch from '../services/Elasticsearch';
import type { HydratedCaseRecord } from './types';

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

export default ({ elasticsearch, opbeat }: Deps) => (
  cases$: Rx.Observable<HydratedCaseRecord>
) =>
  // 1s buffers so we can bulk index. Can push empty arrays, which we filter.
  cases$.bufferTime(1000).filter(arr => !!arr.length).let(
    queue(
      recordArr =>
        Rx.Observable
          .defer(() => elasticsearch.createCases(recordArr))
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
        error: (err, batch: Array<HydratedCaseRecord>) => {
          opbeat.captureError(err);
          logMessage('index-cases', 'Permanent failure indexing cases', {
            ids: batch.map(v => v.id),
          });
        },
      }
    )
  );
