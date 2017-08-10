// @flow

import Rx from 'rxjs';

// Returns an observable that runs a Promise-generating function on subscribe.
// Useful vs. fromPromise because it allows us to use .retry/.retryWhen to
// re-run the original function. (Retrying a fromPromise-based observable is not
// particularly interesting, as the Promise has already resolved/rejected.)
export function observableFromPromiseFunc<T>(
  fn: () => Promise<T>
): Rx.Observable<T> {
  return Rx.Observable.create(observable => {
    fn().then(
      val => {
        observable.next(val);
        observable.complete();
      },
      err => {
        observable.error(err);
      }
    );
  });
}

// Use with let to insert an exponential fallback retry in an observable chain.
export function retryWithExponentialFallback<T>(
  maxRetries: number,
  retryDelay: number,
  report?: (error: Error) => mixed
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
            if (report && lastError) {
              report(lastError);
            }
            return Rx.Observable.timer(errorCount * retryDelay);
          }
        })
    );
}
