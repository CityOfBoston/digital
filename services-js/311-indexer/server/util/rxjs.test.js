// @flow

import Rx from 'rxjs';

import {
  observableFromPromiseFunc,
  retryWithExponentialFallback,
} from './rxjs';

describe('observableFromPromiseFunc', () => {
  it('observes the promise value', done => {
    observableFromPromiseFunc(() => Promise.resolve('ok')).subscribe({
      next: val => {
        expect(val).toEqual('ok');
        done();
      },
    });
  });

  it('completes after a resolution', done => {
    observableFromPromiseFunc(() => Promise.resolve('ok')).subscribe({
      complete: () => {
        done();
      },
    });
  });

  it('errors with a promise rejection', done => {
    observableFromPromiseFunc(() => Promise.reject('error')).subscribe({
      error: err => {
        expect(err).toEqual('error');
        done();
      },
    });
  });

  it('can be retried', done => {
    let count = 0;
    let observedErrors = 0;

    observableFromPromiseFunc(() => {
      if (++count > 4) {
        return Promise.resolve('ok');
      } else {
        return Promise.reject('error');
      }
    })
      .do({
        error: () => observedErrors++,
      })
      .retry()
      .subscribe({
        next: val => {
          expect(val).toEqual('ok');
          expect(observedErrors).toEqual(4);
          done();
        },
      });
  });
});

describe('retryWithExponentialFallback', () => {
  it('passes through a success', done => {
    Rx.Observable.of('ok').let(retryWithExponentialFallback(0, 0)).subscribe({
      next: val => {
        expect(val).toEqual('ok');
        done();
      },
    });
  });

  it('retries a failure until it’s done', done => {
    let count = 0;
    Rx.Observable
      .create(() => {
        count++;
        throw 'error';
      })
      .let(retryWithExponentialFallback(5, 1))
      .subscribe({
        error: err => {
          // first + 5 retries
          expect(count).toEqual(6);
          expect(err).toEqual('error');
          done();
        },
      });
  });

  it('will eventually succeed after failure', done => {
    let count = 0;
    Rx.Observable
      .create(observer => {
        if (++count < 5) {
          throw 'error';
        } else {
          observer.next('ok');
        }
      })
      .let(retryWithExponentialFallback(10, 1))
      .subscribe({
        next: val => {
          expect(val).toEqual('ok');
          done();
        },
      });
  });
});
