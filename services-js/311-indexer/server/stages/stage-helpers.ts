/* eslint no-console: 0 */
import * as Rx from 'rxjs';
import {
  catchError,
  retryWhen,
  scan,
  switchMap,
  tap,
  mergeMap,
} from 'rxjs/operators';

export function logMessage(stage: string, message: string, data: {}) {
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

export function logNonfatalError(stage: string, err: Error, data?: {}) {
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

interface ErrorStreamSummary {
  errorCount: number;
  lastError: Error | null;
}

/**
 * Your stream should do its retryable work on subscription (such as with
 * `defer`), so that `retry`’s re-subscription behavior triggers it.
 *
 * Errors on the stream are caught up to `maxRetries` times before being pushed
 * on to the source. Successful values are just passed through as normal.
 *
 * @param maxRetries How many times to retry before raising an error.
 * @param retryDelay Exponential fallback amount in ms.
 * @param callbacks
 */
export function retryWithBackoff<T>(
  maxRetries: number,
  retryDelay: number,
  callbacks: { error?: (error: Error) => unknown } = {}
): Rx.MonoTypeOperatorFunction<T> {
  return retryable$ =>
    retryable$.pipe(
      retryWhen((error$: Rx.Observable<Error>) =>
        error$.pipe(
          // We use scan to maintain a count of how many errors have already
          // happened, since retryWhen gives an observable stream of all errors
          // the original observable threw. We save the lastError so we can report
          // and throw it.
          scan<Error, ErrorStreamSummary>(
            ({ errorCount }, error) => ({
              errorCount: errorCount + 1,
              lastError: error,
            }),

            {
              errorCount: 0,
              lastError: null,
            }
          ),
          switchMap(({ errorCount, lastError }) => {
            if (errorCount > maxRetries) {
              // We’ve hit our max retries. This merges into switchMap and causes it
              // to error, which makes retryWhen error.
              return Rx.throwError(lastError);
            } else {
              // Lets us report transient errors to the stage, even though they're
              // being retried.
              if (callbacks.error && lastError) {
                callbacks.error(lastError);
              }

              // If the notifier observable we’re returning emits any actual value,
              // retryWhen will re-subscribe to its input and we’ll get a retry.
              // timer will emit a 0 after the delay. We square errorCount to get an
              // exponential backoff.
              return Rx.timer(retryDelay * (2 ^ (errorCount - 1)));
            }
          })
        )
      )
    );
}
/**
 * Operator that throttles a stream to handle a fixed number of concurrent
 * operations. Maintains a count of the queue’s length and reports errors
 * without terminating processing.
 *
 * @param project Function to operate on the elements of the stream.
 * @param callbacks Functions that get called with updates on the number of
 * elements in the queue and when an error occurs.
 * @param concurrency How many instances of project should be running at once.
 * Defaults to 1.
 *
 * @returns An observable of the projected values. The order is not guaranteed
 * due to concurrent processing.
 */
export function queue<T, U>(
  project: (val: T) => Rx.Observable<U> | Promise<U>,
  callbacks: {
    length?: (len: number) => unknown;
    error?: (err: Error, inVal: T) => unknown;
  } = {},
  concurrent: number = 1
): Rx.OperatorFunction<T, U> {
  let queueLength = 0;

  return val$ =>
    val$.pipe(
      // This handler will get called on every observed value as fast as they
      // come in, so we use it to keep track of the current queue length in
      // concatMap.
      tap(() => {
        queueLength++;

        if (callbacks.length) {
          callbacks.length(queueLength);
        }
      }),
      // mergeMap queues values (WARNING: it has no limit to its queue, so we
      // have no backpressure) and waits for each observable to complete before
      // running the next one, which effectively pipelines our input operator.
      //
      // defer is used so that we don’t call project until mergeMap actually
      // subscribes.
      mergeMap(
        val =>
          Rx.defer(() => project(val)).pipe(
            // We always catch at the end of this chain because errors will bubble
            // back into mergeMap, cancelling any values currently in its queue.
            catchError((error: Error) => {
              if (callbacks.error) {
                callbacks.error(error, val);
              }

              // Complete the stream after the error so that we can cleanly
              // decrement the queueLength.
              return Rx.empty();
            }),
            tap({
              complete: () => {
                queueLength--;

                if (callbacks.length) {
                  callbacks.length(queueLength);
                }
              },
            })
          ),

        concurrent
      )
    );
}
