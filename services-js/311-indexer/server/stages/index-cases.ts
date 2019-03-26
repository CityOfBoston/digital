import * as Rx from 'rxjs';
import { bufferTime, tap, filter } from 'rxjs/operators';
import Rollbar from 'rollbar';

import Elasticsearch from '../services/Elasticsearch';
import { HydratedCaseRecord } from './types';
import {
  queue,
  retryWithBackoff,
  logQueueLength,
  logNonfatalError,
  logMessage,
} from './stage-helpers';

interface Deps {
  elasticsearch: Elasticsearch;
  rollbar: Rollbar;
}

export default ({ elasticsearch, rollbar }: Deps) => (
  cases$: Rx.Observable<HydratedCaseRecord>
) =>
  cases$.pipe(
    bufferTime(1000),
    // Filter out the empty arrays from when the 1s buffer expires without any
    // values coming in.
    filter(arr => !!arr.length),
    queue(
      recordArr =>
        // We run `createCases` on defer so that retryWithFallback can cause
        // it to be tried again by re-subscribing.
        Rx.defer(() => elasticsearch.createCases(recordArr)).pipe(
          retryWithBackoff(5, 2000, {
            error: err => logNonfatalError('index-cases', err),
          }),
          tap(response => {
            logMessage('index-cases', 'Indexing complete', { response });
          })
        ),
      {
        length: length => logQueueLength('index-cases', length),
        error: (err, batch: HydratedCaseRecord[]) => {
          rollbar.error(err, { extra: (err as any).extra });
          logMessage('index-cases', 'Permanent failure indexing cases', {
            ids: batch.map(v => v.id),
          });
        },
      }
    )
  );
