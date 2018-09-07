// @flow

import Rx from 'rxjs';

import type Open311, { DetailedServiceRequest } from '../services/Open311';
import type {
  UpdatedCaseNotificationRecord,
  HydratedCaseRecord,
} from './types';

import {
  queue,
  retryWithFallback,
  logQueueLength,
  logNonfatalError,
  logMessage,
} from './stage-helpers';

type Opbeat = $Exports<'opbeat'>;

type Deps = {
  open311: Open311,
  opbeat: Opbeat,
};

const handleSingleLoadError = (err: any) => {
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

const handleRetriedLoadError = (id, opbeat, err) => {
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
    return Rx.Observable.of(null);
  } else {
    opbeat.captureError(err);
    return Rx.Observable.empty();
  }
};

// rxjs operation (use with "let") that hydrates a stream of
// UpdatedCaseNotificationRecords.
//
// Catches and retries most errors, but propagates Salesforce authentication
// errors to fail the job and cause a restart (which re-auths).
export default (parallel: number, { open311, opbeat }: Deps) => (
  updates$: Rx.Observable<UpdatedCaseNotificationRecord>
): Rx.Observable<HydratedCaseRecord> =>
  updates$.let(
    queue(
      ({ id, replayId }) =>
        Rx.Observable
          .defer(() => open311.loadCase(id))
          .let(
            retryWithFallback(5, 2000, {
              error: handleSingleLoadError,
            })
          )
          .do((c: ?DetailedServiceRequest) => {
            if (c) {
              logMessage('load-cases', 'Successful case load', {
                id: c.service_request_id,
                code: c.service_code,
              });
            } else {
              logMessage('load-cases', 'Unsuccessful case load', {
                id,
              });
            }
          })
          .catch(handleRetriedLoadError.bind(null, id, opbeat))
          .map((c: ?DetailedServiceRequest): HydratedCaseRecord => ({
            id,
            case: c,
            replayId,
          })),
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
      parallel
    )
  );
