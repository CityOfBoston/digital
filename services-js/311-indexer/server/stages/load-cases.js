// @flow

import Rx from 'rxjs';

import type Open311, { Case } from '../services/Open311';

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
  open311: Open311,
  opbeat: Opbeat,
};

export default function({
  open311,
  opbeat,
}: Deps): (Rx.Observable<Array<string>>) => Rx.Observable<Array<Case>> {
  const loadCases = (observable: Rx.Observable<Array<string>>) =>
    observable
      .map((ids: string[]) => open311.loadCases(ids))
      .let(awaitPromise)
      .let(
        retryWithFallback(5, 2000, {
          error: err => {
            opbeat.captureError(err);
            logError('load-cases', err);
          },
        })
      );

  return observable =>
    observable.let(
      queue(loadCases, {
        length: length => logQueueLength('load-cases', length),
        error: (err, val) => {
          logMessage('load-cases', 'Permanent failure loading cases', {
            ids: val,
          });
        },
      })
    );
}
