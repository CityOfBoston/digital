// @flow
/* eslint no-console: 0 */

import Rx from 'rxjs';
import cleanup from 'node-cleanup';
import _ from 'lodash';

import Elasticsearch from './services/Elasticsearch';
import Salesforce from './services/Salesforce';
import Open311 from './services/Open311';
import type { DataMessage } from './services/Salesforce';

import {
  observableFromPromiseFunc,
  retryWithExponentialFallback,
} from './util/rxjs';

type Opbeat = $Exports<'opbeat'>;

type ServerArgs = {
  opbeat: Opbeat,
};

type CaseUpdate = {|
  'Status': string,
  'CaseNumber': string,
  'Id': string,
  'Incap311__Service_Type_Version_Code__c': string,
|};

// Use this function with "let" on an observer to insert our queueing behavior
// into the stream.
function processingStage<T, U>(
  opbeat: Opbeat,
  stage: string,
  fn: T => Promise<U>
): (Rx.Observable<T>) => Rx.Observable<U> {
  let queueLength = 0;

  const logQueueLength = () => {
    console.log(
      JSON.stringify({
        type: 'queue length',
        stage,
        length: queueLength,
      })
    );
  };

  return observable =>
    observable
      // This handler will get called on every observed value as fast as they
      // come in, so we use it to keep track of the current queue length in
      // concatMap.
      .do(() => {
        queueLength++;
        logQueueLength();
      })
      // concatMap queues values until each observable completes, so we use it to make sure that our
      // network requests are sequential.
      .concatMap(val =>
        observableFromPromiseFunc(() => fn(val))
          .let(
            retryWithExponentialFallback(3, 1000, error => {
              opbeat.captureError(error);

              console.log(
                JSON.stringify({
                  type: 'error',
                  stage,
                  error: `${error.toString()}`,
                })
              );
            })
          )
          // Report errors that caused a complete failure, but also in all cases
          // updates the queue length.
          .do({
            error: (error: Error) => {
              opbeat.captureError(error);

              console.log(
                JSON.stringify({
                  type: 'failure',
                  stage,
                  value: val,
                  error: `${error.toString()}`,
                })
              );

              queueLength--;
              logQueueLength();
            },
            complete: () => {
              queueLength--;
              logQueueLength();
            },
          })
          // We always catch at the end of this chain so that we don't kill the
          // original subscription. Returning empty will stop processing,
          // however, so we don't try to do any indexing.
          .catch(() => Rx.Observable.empty())
      );
}

export default async function startServer({ opbeat }: ServerArgs) {
  let salesforce: ?Salesforce;

  const shutdown = async () => {
    if (salesforce) {
      await salesforce.disconnect();
    }
  };

  cleanup((exitCode, signal) => {
    if (exitCode) {
      console.log(
        `----- FORCE EXITING WITH CODE ${exitCode}! NO CLEANUP! -----`
      );
      return true;
    } else {
      // keeps us from recursively cleaning up
      cleanup.uninstall();

      console.log('----- CLEAN SHUTDOWN START -----');

      shutdown().then(
        () => {
          console.log('----- CLEAN SHUTDOWN COMPLETE -----');
          process.kill(process.pid, signal);
        },
        err => {
          console.log('----- CLEAN SHUTDOWN FAILURE -----');
          console.error(err);
          process.exit(-1);
        }
      );

      // allows our clean shutdown to proceed
      return false;
    }
  });

  if (
    process.env.ELASTICSEARCH_URL &&
    process.env.ELASTICSEARCH_URL.endsWith('.amazonaws.com')
  ) {
    Elasticsearch.configureAws(process.env.AWS_REGION);
  }

  const elasticsearch = new Elasticsearch(
    process.env.ELASTICSEARCH_URL,
    process.env.ELASTICSEARCH_INDEX,
    opbeat
  );

  try {
    const info = await elasticsearch.info();
    console.log('Elasticsearch connected', info);
  } catch (err) {
    console.error('ERROR GETTING ELASTICSEARCH INFO', err);
  }

  const open311 = new Open311(
    process.env.PROD_311_ENDPOINT,
    process.env.PROD_311_KEY,
    opbeat
  );

  salesforce = new Salesforce(
    process.env.SALESFORCE_COMETD_URL,
    process.env.SALESFORCE_PUSH_TOPIC,
    process.env.SALESFORCE_CONSUMER_KEY,
    process.env.SALESFORCE_CONSUMER_SECRET,
    opbeat
  );

  salesforce.on('meta', (msg: Object) => {
    console.info(JSON.stringify(msg));
  });

  Rx.Observable
    .fromEvent(salesforce, 'event')
    .do((msg: DataMessage<CaseUpdate>) => console.info(JSON.stringify(msg)))
    // We buffer updates because we may get the same one back-to-back due to
    // fast updates. (We noticed that closing cases generated 2 updates
    // immediately.) This will always emit at least once a second, even if the
    // buffer is empty, so we filter those out below.
    .bufferTime(1000, null, 25)
    .filter(b => b.length > 0)
    // Convert the updates down to an array of uniq'd case numbers. Sometimes
    // the same case will have several updates in a row.
    .map((msgs: Array<DataMessage<CaseUpdate>>) =>
      _.uniq(msgs.map(msg => msg.data.sobject.CaseNumber))
    )
    .let(processingStage(opbeat, 'open311', ids => open311.loadCases(ids)))
    .subscribe(cases => {
      console.log('----- LOADED CASES -----');
      cases.forEach(c => {
        console.info(JSON.stringify(c));
      });
    });

  salesforce.on('error', (err: Error) => {
    // This may happen if your session expires. Rather than try to re-auth, just exit
    // and let the container agent restart us.
    console.log('----- SALESFORCE CONNECTION ERROR -----');
    console.error(err);

    opbeat.captureError(err);

    process.kill(process.pid, 'SIGHUP');
  });

  await salesforce.connect(
    process.env.SALESFORCE_OAUTH_URL,
    process.env.SALESFORCE_API_USERNAME,
    process.env.SALESFORCE_API_PASSWORD,
    process.env.SALESFORCE_API_SECURITY_TOKEN
  );
}
