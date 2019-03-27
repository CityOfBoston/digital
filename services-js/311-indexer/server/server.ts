/* eslint no-console: 0 */
import * as Rx from 'rxjs';
import { tap, takeUntil, share } from 'rxjs/operators';
import cleanup from 'node-cleanup';
import Rollbar from 'rollbar';

import decryptEnv from '@cityofboston/srv-decrypt-env';

import Elasticsearch from './services/Elasticsearch';
import Salesforce, { DataMessage } from './services/Salesforce';
import Open311 from './services/Open311';
import Prediction from './services/Prediction';
import convertSalesforceEvents, {
  CaseUpdate,
} from './stages/convert-salesforce-events';
import loadCases from './stages/load-cases';
import indexCases from './stages/index-cases';
import updateClassifier from './stages/update-classifier';

interface ServerArgs {
  rollbar: Rollbar;
}

const SIMULTANEOUS_CASE_LOADS = 5;
const SIMULTANEOUS_CLASSIFICATIONS = 5;

export default async function startServer({ rollbar }: ServerArgs) {
  let salesforce: Salesforce | undefined;
  let rxjsSubscription: Rx.Subscription | undefined;

  await decryptEnv();

  const shutdown = async () => {
    if (rxjsSubscription) {
      rxjsSubscription.unsubscribe();
    }

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
    process.env.ELASTICSEARCH_INDEX
  );

  try {
    const info = await elasticsearch.info();
    console.log('Elasticsearch connected', info);
  } catch (err) {
    console.error('ERROR GETTING ELASTICSEARCH INFO');
    rollbar.error(err);
  }

  let lastReplayId: number | null = null;
  try {
    lastReplayId = await elasticsearch.findLatestReplayId();
    console.log(`STARTING FROM REPLAY_ID: ${lastReplayId || 'null'}`);
  } catch (err) {
    console.log('ERROR GETTING LATEST REPLAY_ID');
    rollbar.error(err);
  }

  const open311 = new Open311(
    process.env.OPEN311_ENDPOINT,
    process.env.OPEN311_KEY
  );

  const prediction = new Prediction(process.env.PREDICTION_ENDPOINT);

  salesforce = new Salesforce(
    rollbar,
    process.env.SALESFORCE_COMETD_URL,
    process.env.SALESFORCE_PUSH_TOPIC,
    process.env.SALESFORCE_CONSUMER_KEY,
    process.env.SALESFORCE_CONSUMER_SECRET
  );

  salesforce.on('meta', msg => {
    console.info(JSON.stringify(msg));
  });

  const salesforceEvent$ = Rx.fromEvent<DataMessage<CaseUpdate>>(
    // The Node EventEmitter interface and rxjs’s NodeStyleEventEmitter interface
    // are mismatched for the type of the handler functions.
    salesforce as any,
    'event'
  );

  const salesforceError$ = Rx.fromEvent<Error>(
    // The Node EventEmitter interface and rxjs’s NodeStyleEventEmitter interface
    // are mismatched for the type of the handler functions.
    salesforce as any,
    'error'
  ).pipe(
    tap(err => {
      console.log('----- SALESFORCE CONNECTION ERROR -----');
      rollbar.error(err, { cometd: (err as any).cometd });
      console.error(err);
    })
  );

  const salesforceDisconnected$ = Rx.fromEvent<Error>(
    // The Node EventEmitter interface and rxjs’s NodeStyleEventEmitter interface
    // are mismatched for the type of the handler functions.
    salesforce as any,
    'disconnected'
  ).pipe(
    tap(() => {
      console.log('----- SALESFORCE CONNECTION CLOSED -----');
    })
  );

  const loadedBatch$ = salesforceEvent$.pipe(
    // This causes the first Salesforce error to complete the stream. The rest
    // of the pipeline will finish processing, then the complete handler below
    // will exit. Also handles general disconnecting.
    takeUntil(Rx.merge(salesforceError$, salesforceDisconnected$)),
    convertSalesforceEvents(),
    loadCases(SIMULTANEOUS_CASE_LOADS, { rollbar, open311 }),
    // multicast the same loaded cases to each of the later pipeline stages.
    share()
  );

  // We merge two streams off of the loaded cases so that indexing and
  // classification happen in parallel. The merging is just so we can control /
  // error out through a single subscription.
  rxjsSubscription = Rx.merge(
    loadedBatch$.pipe(
      updateClassifier(SIMULTANEOUS_CLASSIFICATIONS, { rollbar, prediction })
    ),
    loadedBatch$.pipe(indexCases({ rollbar, elasticsearch }))
  )
    // The above stages are supposed to capture and report all errors without
    // ever terminating. If we do accidentally error or complete, report that
    // and kill the process so we restart, rather than dangling without further
    // processing.
    .subscribe({
      error: err => {
        console.log('----- PROCESSING PIPELINE VERY FATAL ERROR -----');
        rollbar.error(err, { extra: (err as any).extra });
        process.kill(process.pid, 'SIGHUP');
      },
      complete: () => {
        console.log(
          '----- PROCESSING PIPELINE COMPLETED, LIKELY DUE TO SALESFORCE ERROR  -----'
        );

        process.kill(process.pid, 'SIGHUP');
      },
    });

  const oauthSessionId = await salesforce.connect(
    process.env.SALESFORCE_OAUTH_URL,
    process.env.SALESFORCE_API_USERNAME,
    process.env.SALESFORCE_API_PASSWORD,
    process.env.SALESFORCE_API_SECURITY_TOKEN,
    lastReplayId
  );

  // OK this is a little hacky. We had to add OAuth later.
  open311.oauthSessionId = oauthSessionId;
}
