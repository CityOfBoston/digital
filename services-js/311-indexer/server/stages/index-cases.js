// @flow

import Rx from 'rxjs';

import type Elasticsearch from '../services/Elasticsearch';
import type { Output as LoadCasesOutput } from './index-cases';

import {
  queue,
  awaitPromise,
  retryWithFallback,
  logQueueLength,
  logError,
  logMessage,
} from './stage-helpers';

type Opbeat = $Exports<'opbeat'>;

type Deps = {
  elasticsearch: Elasticsearch,
  opbeat: Opbeat,
};

export type Input = LoadCasesOutput;
export type Output = any;

export default function({
  elasticsearch,
  opbeat,
}: Deps): (Rx.Observable<Input>) => Rx.Observable<Output> {
  const indexCases = observable =>
    observable
      .map((inputs: Input) => {
        const cases = [];
        inputs.forEach(i => {
          if (i.case) {
            cases.push({ case: i.case, replayId: i.replayId });
          }
        });

        return elasticsearch.createCases(cases);
      })
      .let(awaitPromise)
      .let(
        retryWithFallback(5, 2000, {
          error: err => {
            opbeat.captureError(err);
            logError('index-cases', err);
          },
        })
      )
      .do(response => {
        logMessage('index-cases', 'Indexing complete', { response });
      });

  return observable =>
    observable.let(
      queue(indexCases, {
        length: length => logQueueLength('index-cases', length),
        error: (err, val: Input) => {
          logMessage('index-cases', 'Permanent failure loading cases', {
            ids: val.map(v => v.id),
          });
        },
      })
    );
}
