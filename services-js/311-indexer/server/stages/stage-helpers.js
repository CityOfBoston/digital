// @flow
/* eslint no-console: 0 */

import Rx from 'rxjs';

export function logMessage(stage: string, message: string, data: mixed) {
  console.log(
    JSON.stringify({
      type: 'message',
      stage,
      message,
      data,
    })
  );
}

export function logQueueLength(stage: string, length: number) {
  console.log(
    JSON.stringify({
      type: 'queue length',
      stage,
      length,
    })
  );
}

export function logError(stage: string, err: Error) {
  console.log(
    JSON.stringify({
      type: 'error',
      stage,
      error: `${err.toString()}`,
    })
  );
}

// Operator that waits for a promise to resolve or reject before continuing.
// Uses concatMap to keep strict ordering of Promises. Will push an error if a
// Promise rejects.
export function awaitPromise<T>(
  obs: Rx.Observable<Promise<T>>
): Rx.Observable<T> {
  return obs.concatMap((p: Promise<T>) => {
    return Rx.Observable.create(out => {
      p.then(
        v => {
          out.next(v);
          out.complete();
        },
        err => {
          out.error(err);
        }
      );
    });
  });
}

// Use with let to insert an fallback retry in an observable chain.
export function retryWithFallback<T>(
  maxRetries: number,
  retryDelay: number,
  callbacks: { error?: (error: Error) => mixed } = {}
): (Rx.Observable<T>) => Rx.Observable<T> {
  return observable =>
    observable.retryWhen(errorObservable =>
      errorObservable
        // We use scan to maintain a count of how many errors have already
        // happened, since retryWhen gives an observable stream of all errors
        // the original observable threw. We save the lastError so we can report
        // and throw it.
        .scan(
          ({ errorCount }, error) => ({
            errorCount: errorCount + 1,
            lastError: error,
          }),
          {
            errorCount: 0,
            lastError: null,
          }
        )
        .switchMap(({ errorCount, lastError }) => {
          if (errorCount > maxRetries) {
            return Rx.Observable.throw(lastError);
          } else {
            if (callbacks.error && lastError) {
              callbacks.error(lastError);
            }
            return Rx.Observable.timer(errorCount * retryDelay);
          }
        })
    );
}

// Operator that institutes a one-at-a-time queue into the observable stream.
// Pass it an operator to apply to
//
// Reports the length of the queue.
//
// This operator does not cause the observable it modifies to error, since that
// would terminate any persistent loops going on, but instead calls its error
// callback and pushes an Empty to stop the observable stream.
export function queue<T, U>(
  operator: (Rx.Observable<T>) => Rx.Observable<U>,
  callbacks: {
    length?: number => mixed,
    error?: (Error, T) => mixed,
  } = {}
): (Rx.Observable<T>) => Rx.Observable<U> {
  let queueLength = 0;

  return observable =>
    observable
      // This handler will get called on every observed value as fast as they
      // come in, so we use it to keep track of the current queue length in
      // concatMap.
      .do(() => {
        queueLength++;

        if (callbacks.length) {
          callbacks.length(queueLength);
        }
      })
      // concatMap handles pipelining the operator.
      .concatMap((val: T) =>
        Rx.Observable
          .of(val)
          .let(operator)
          // We always catch at the end of this chain so that we don't kill the
          // original subscription, since concatMap will pass an error back.
          .catch((error: Error) => {
            queueLength--;

            if (callbacks.length) {
              callbacks.length(queueLength);
            }

            if (callbacks.error) {
              callbacks.error(error, val);
            }

            return Rx.Observable.empty();
          })
          .do({
            complete: () => {
              queueLength--;

              if (callbacks.length) {
                callbacks.length(queueLength);
              }
            },
          })
      );
}
