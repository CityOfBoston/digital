// @flow

import Rx from 'rxjs';

import { awaitPromise, retryWithFallback, queue } from './stage-helpers';

describe('awaitPromise', () => {
  it('observes the promise value', done => {
    Rx.Observable.of(Promise.resolve('ok')).let(awaitPromise).subscribe({
      next: val => {
        expect(val).toEqual('ok');
        done();
      },
    });
  });

  it('completes after a resolution', done => {
    Rx.Observable.of(Promise.resolve('ok')).let(awaitPromise).subscribe({
      complete: () => {
        done();
      },
    });
  });

  it('errors with a promise rejection', done => {
    Rx.Observable.of(Promise.reject('error')).let(awaitPromise).subscribe({
      error: err => {
        expect(err).toEqual('error');
        done();
      },
    });
  });

  it('can be retried', done => {
    let count = 0;
    let observedErrors = 0;

    Rx.Observable
      .create(out => {
        count++;

        if (count > 4) {
          out.next(Promise.resolve('ok'));
        } else {
          out.next(Promise.reject('error'));
        }
      })
      .let(awaitPromise)
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

describe('retryWithFallback', () => {
  it('passes through a success', done => {
    Rx.Observable.of('ok').let(retryWithFallback(0, 0)).subscribe({
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
      .let(retryWithFallback(5, 1))
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
      .let(retryWithFallback(10, 1))
      .subscribe({
        next: val => {
          expect(val).toEqual('ok');
          done();
        },
      });
  });

  it('reports errors to its function', done => {
    const errorFn = jest.fn();

    Rx.Observable
      .create(() => {
        throw 'error';
      })
      .let(
        retryWithFallback(5, 1, {
          error: errorFn,
        })
      )
      .subscribe({
        error: () => {
          expect(errorFn).toHaveBeenCalledWith('error');
          expect(errorFn).toHaveBeenCalledTimes(5);
          done();
        },
      });
  });
});

describe('queue', () => {
  it('runs the operator on the input', done => {
    expect.assertions(1);

    Rx.Observable.of('in').let(queue(o => o.map(() => 'out'))).subscribe({
      next: val => {
        expect(val).toEqual('out');
      },
      complete: () => done(),
    });
  });

  it('increments and decrements a length', done => {
    const lengthFn = jest.fn();

    Rx.Observable.of('ok').let(queue(o => o, { length: lengthFn })).subscribe({
      complete: () => {
        expect(lengthFn.mock.calls.length).toBe(2);
        expect(lengthFn).toHaveBeenCalledWith(1);
        expect(lengthFn).toHaveBeenCalledWith(0);
        done();
      },
    });
  });

  it('decrements the length even on error', done => {
    const lengthFn = jest.fn();

    Rx.Observable
      .of('ok')
      .let(
        queue(
          o =>
            o.map(() => {
              throw 'err';
            }),
          { length: lengthFn }
        )
      )
      .subscribe({
        complete: () => {
          expect(lengthFn.mock.calls.length).toBe(2);
          expect(lengthFn).toHaveBeenCalledWith(1);
          expect(lengthFn).toHaveBeenCalledWith(0);
          done();
        },
      });
  });

  it('reports an error from the operator', done => {
    const errorFn = jest.fn();

    Rx.Observable
      .of('ok')
      .let(
        queue(
          o =>
            o.map(() => {
              throw 'err';
            }),
          {
            error: errorFn,
          }
        )
      )
      .subscribe({
        complete: () => {
          expect(errorFn).toHaveBeenCalledWith('err', 'ok');
          done();
        },
      });
  });

  it('doesn’t stop the parent on error', done => {
    const nextFn: () => mixed = jest.fn();

    Rx.Observable
      .of('first', 'second')
      .let(
        queue(o =>
          o.map(val => {
            if (val === 'first') {
              throw 'err';
            } else {
              return val;
            }
          })
        )
      )
      .subscribe({
        next: nextFn,
        complete: () => {
          expect(nextFn).toHaveBeenCalledTimes(1);
          expect(nextFn).toHaveBeenCalledWith('second');
          done();
        },
      });
  });
});
