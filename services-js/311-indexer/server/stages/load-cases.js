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

export type Input = Array<{
  id: string,
  replayId: number,
}>;

export type Output = Array<{
  id: string,
  replayId: number,
  case: ?Case,
}>;

export default function({
  open311,
  opbeat,
}: Deps): (Rx.Observable<Input>) => Rx.Observable<Output> {
  const loadCases = observable =>
    observable
      .map(async (inputs: Input) => {
        const cases = await open311.loadCases(inputs.map(({ id }) => id));
        return inputs.map((input, i) => ({
          id: input.id,
          replayId: input.replayId,
          case: cases[i],
        }));
      })
      .let(awaitPromise)
      // We can use retryWithFallback because the queue below is creating a new
      // observable based on queued values, so the retrying bubbles up to there.
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
