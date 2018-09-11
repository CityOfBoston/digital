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

export function logNonfatalError(stage: string, err: Error, data?: mixed) {
  console.log(
    JSON.stringify({
      type: 'error',
      fatal: false,
      stage,
      error: `${err.toString()}`,
      data,
    })
  );
}

type ErrorStreamSummary = {|
  errorCount: number,
  lastError: ?Error,
|};

// Use with let to insert an fallback retry in an observable chain.
//
// Your stream should do its retryable work on subscription (such as with
// `defer`), so that `retry`’s re-subscription behavior triggers it.
//
// Errors on the stream are caught up to `maxRetries` times before being pushed
// on to the source. Successful values are just passed through as normal.
export const retryWithFallback = (
  maxRetries: number,
  retryDelay: number,
  callbacks: { error?: (error: Error) => mixed } = {}
) => (retryable$: Rx.Observable<*>) =>
  retryable$.retryWhen(error$ =>
    error$
      // We use scan to maintain a count of how many errors have already
      // happened, since retryWhen gives an observable stream of all errors
      // the original observable threw. We save the lastError so we can report
      // and throw it.
      .scan(
        ({ errorCount }: ErrorStreamSummary, error) => ({
          errorCount: errorCount + 1,
          lastError: error,
        }),
        {
          errorCount: 0,
          lastError: null,
        }
      )
      .switchMap(({ errorCount, lastError }: ErrorStreamSummary) => {
        if (errorCount > maxRetries) {
          // Sending an error down the errorStream will terminate retryWhen's
          // retrying.
          return Rx.Observable.throw(lastError);
        } else {
          // Lets us report transient errors to the stage, even though they're
          // being retried.
          if (callbacks.error && lastError) {
            callbacks.error(lastError);
          }

          // We delay sending a value to errorStream so that retryWhen waits
          // with a backoff before re-subscribing. Squaring the errorCount
          // causes an exponential backoff: e.g. 5s, 10s, 20s.
          return Rx.Observable.timer(retryDelay * (2 ^ (errorCount - 1)));
        }
      })
  );

// Operator that institutes a one-at-a-time queue into the observable stream.
// Pass it an operator to apply to
//
// Reports the length of the queue.
//
// This operator does not cause the observable it modifies to error, since that
// would terminate any persistent loops going on, but instead calls its error
// callback and pushes an Empty to stop the observable stream.
export function queue<T, U>(
  project: T => Rx.Observable<U> | Promise<U>,
  callbacks: {
    length?: number => mixed,
    error?: (Error, T) => mixed,
  } = {},
  concurrent?: number = 1
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
      // concatMap queues values (WARNING: it has no limit to its queue, so we
      // have no backpressure) and waits for each observable to complete before
      // running the next one, which effectively pipelines our input operator.
      .mergeMap(
        (val: T) =>
          // We make a new observable for the value off the queue,
          Rx.Observable
            .defer(() => project(val))
            // We always catch at the end of this chain because errors will bubble
            // back into mergeMap, cancelling any values currently in its queue.
            .catch((error: Error) => {
              if (callbacks.error) {
                callbacks.error(error, val);
              }

              // Complete the stream after the error so that we can cleanly
              // decrement the queueLength.
              return Rx.Observable.empty();
            })
            .do({
              complete: () => {
                queueLength--;

                if (callbacks.length) {
                  callbacks.length(queueLength);
                }
              },
            }),
        concurrent
      );
}
