import * as Rx from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import Rollbar from 'rollbar';

import Open311 from '../services/Open311';
import { UpdatedCaseNotificationRecord, HydratedCaseRecord } from './types';
import {
  queue,
  retryWithBackoff,
  logQueueLength,
  logNonfatalError,
  logMessage,
} from './stage-helpers';

interface Deps {
  open311: Open311;
  rollbar: Rollbar;
}

declare global {
  interface Error {
    fatal?: boolean | null;
    missing?: boolean;
  }
}

const handleSingleLoadError = (err: Error) => {
  // These first two errors are permanent and should not be retried.
  const msg = err.message || '';

  if (
    msg.startsWith('Cannot execute GET on Service Type Code') ||
    msg.startsWith('Unexpected error - this could be caused by configuration')
  ) {
    // treat these as a missing load to be removed from the index
    err.missing = true;
    throw err;
  } else if (msg === 'Session expired or invalid') {
    err.fatal = true;
    throw err;
  } else {
    logNonfatalError('load-cases', err);
  }
};

const handleRetriedLoadError = (id: string, rollbar: Rollbar, err: Error) => {
  const { message, fatal, missing } = err;

  logMessage('load-cases', 'Permanent failure loading case', {
    message,
    id,
    missing,
    fatal,
  });

  // Throwing out of this stage will fail back up to the server
  // pipeline and kill the job (which will then get restarted)
  if (fatal) {
    throw err;
  } else if (missing) {
    return Rx.of(null);
  } else {
    rollbar.error(err, { extra: (err as any).extra });
    return Rx.empty();
  }
};

/**
 * rxjs operation that hydrates a stream of UpdatedCaseNotificationRecords.
 *
 * Catches and retries most errors, but propagates Salesforce authentication
 * errors to fail the job and cause a restart (which re-auths).
 */
export default function loadCases(
  concurrency: number,
  { open311, rollbar }: Deps
): Rx.OperatorFunction<UpdatedCaseNotificationRecord, HydratedCaseRecord> {
  return updates$ =>
    updates$.pipe(
      queue(
        ({ id, replayId }) =>
          Rx.defer(() => open311.loadCase(id)).pipe(
            retryWithBackoff(5, 2000, {
              error: handleSingleLoadError,
            }),
            tap(c => {
              if (c) {
                logMessage('load-cases', 'Successful case load', {
                  id: c.service_request_id,
                  code: c.service_code,
                  date: c.requested_datetime,
                });
              } else {
                logMessage('load-cases', 'Unsuccessful case load', {
                  id,
                });
              }
            }),
            catchError(handleRetriedLoadError.bind(null, id, rollbar)),
            map(
              (c): HydratedCaseRecord => ({
                id,
                case: c,
                replayId,
              })
            )
          ),

        {
          length: length => logQueueLength('load-cases', length),
          // Queue error handler to make sure we completely explode on fatal
          // errors. Necessary to cause a restart when auth expires.
          error: err => {
            if (err.fatal) {
              throw err;
            }
          },
        },

        concurrency
      )
    );
}
