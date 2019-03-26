import * as Rx from 'rxjs';
import { filter, tap, map } from 'rxjs/operators';
import Rollbar from 'rollbar';

import { DetailedServiceRequest } from '../services/Open311';
import Prediction from '../services/Prediction';
import { HydratedCaseRecord } from './types';
import {
  queue,
  retryWithBackoff,
  logNonfatalError,
  logMessage,
} from './stage-helpers';

interface Deps {
  prediction: Prediction;
  rollbar: Rollbar;
}

/**
 * Converts a batch of loaded cases into a stream of individual cases which then
 * get sent to the classifier, each with its own exponential retries.
 */
export default function updateClassifier(
  concurrency: number,
  { prediction, rollbar }: Deps
): Rx.OperatorFunction<HydratedCaseRecord, unknown> {
  return cases$ =>
    cases$.pipe(
      filter(({ case: c }) => !!c),
      // We know case is not null because of the above filter, but we need the
      // "any" to tell TypeScript that.
      map<HydratedCaseRecord, DetailedServiceRequest>(
        ({ case: c }) => c as any
      ),
      queue(
        c =>
          Rx.defer(() => prediction.reportCaseUpdate(c)).pipe(
            retryWithBackoff(5, 2000, {
              error: err => logNonfatalError('update-classifier', err),
            }),
            tap(response =>
              logMessage('update-classifier', 'Request complete', {
                response,
                id: c.service_request_id,
                service_code: c.service_code,
                status: c.status,
              })
            )
          ),
        {
          error: (err, c) => {
            rollbar.error(err, { extra: (err as any).extra });
            logMessage('update-classifier', 'Permanent failure', {
              case: c,
            });
          },
        },
        concurrency
      )
    );
}
