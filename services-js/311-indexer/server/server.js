// @flow
/* eslint no-console: 0 */

import os from 'os';
import Rx from 'rxjs';
import cleanup from 'node-cleanup';
import fetch from 'node-fetch';

import Elasticsearch from './services/Elasticsearch';
import Salesforce from './services/Salesforce';
import Open311 from './services/Open311';
import Prediction from './services/Prediction';

import decryptEnv from './lib/decrypt-env';

import convertSalesforceEvents from './stages/convert-salesforce-events';
import loadCases from './stages/load-cases';
import indexCases from './stages/index-cases';
import updateClassifier from './stages/update-classifier';

type Opbeat = $Exports<'opbeat'>;

type ServerArgs = {
  opbeat: Opbeat,
};

const SIMULTANEOUS_CASE_LOADS = 5;

// https://opbeat.com/docs/api/intake/v1/#release-tracking
async function reportDeployToOpbeat(opbeat) {
  if (
    process.env.OPBEAT_APP_ID &&
    process.env.OPBEAT_ORGANIZATION_ID &&
    process.env.OPBEAT_SECRET_TOKEN &&
    process.env.GIT_BRANCH &&
    process.env.GIT_REVISION
  ) {
    try {
      const res = await fetch(
        `https://opbeat.com/api/v1/organizations/${process.env
          .OPBEAT_ORGANIZATION_ID}/apps/${process.env.OPBEAT_APP_ID}/releases/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${process.env.OPBEAT_SECRET_TOKEN}`,
          },
          body: [
            `rev=${process.env.GIT_REVISION}`,
            `branch=${encodeURIComponent(process.env.GIT_BRANCH)}`,
            `machine=${encodeURIComponent(os.hostname())}`,
            `status=machine-completed`,
          ].join('&'),
        }
      );
      console.log(
        'Reported deploy to Opbeat:',
        JSON.stringify(await res.json())
      );
    } catch (err) {
      // We swallow the error because we won't interrupt startup because we
      // couldn't report the release.
      console.error('Error reporting deploy to Opbeat');

      // bwaaaaaa
      opbeat.captureError(err);
    }
  }
}

export default async function startServer({ opbeat }: ServerArgs) {
  reportDeployToOpbeat(opbeat);

  let salesforce: ?Salesforce;
  let rxjsSubscription: ?Rx.Subscription;

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
    process.env.ELASTICSEARCH_INDEX,
    opbeat
  );

  try {
    const info = await elasticsearch.info();
    console.log('Elasticsearch connected', info);
  } catch (err) {
    console.error('ERROR GETTING ELASTICSEARCH INFO');
    opbeat.captureError(err);
  }

  let lastReplayId = null;
  try {
    lastReplayId = await elasticsearch.findLatestReplayId();
    console.log(`STARTING FROM REPLAY_ID: ${lastReplayId || 'null'}`);
  } catch (err) {
    console.log('ERROR GETTING LATEST REPLAY_ID');
    opbeat.captureError(err);
  }

  const open311 = new Open311(
    process.env.PROD_311_ENDPOINT,
    process.env.PROD_311_KEY,
    opbeat
  );

  const prediction = new Prediction(process.env.PREDICTION_ENDPOINT, opbeat);

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

  salesforce.on('error', (err: Error) => {
    // This may happen if your session expires. Rather than try to re-auth, just exit
    // and let the container agent restart us.
    console.log('----- SALESFORCE CONNECTION ERROR -----');
    opbeat.captureError(err);
    process.kill(process.pid, 'SIGHUP');
  });

  const loadedBatch$ = Rx.Observable
    .fromEvent(salesforce, 'event')
    .let(convertSalesforceEvents())
    .let(loadCases(SIMULTANEOUS_CASE_LOADS, { opbeat, open311 }))
    // multicast the same loaded cases to each of the later pipeline stages.
    .share();

  // We merge two streams off of the loaded cases so that indexing and
  // classification happen in parallel. The merging is just so we can control /
  // error out through a single subscription.
  rxjsSubscription = Rx.Observable
    .merge(
      loadedBatch$.let(updateClassifier({ opbeat, prediction })),
      loadedBatch$.let(indexCases({ opbeat, elasticsearch }))
    )
    // The above stages are supposed to capture and report all errors without
    // ever terminating. If we do accidentally error or complete, report that
    // and kill the process so we restart, rather than dangling without further
    // processing.
    .subscribe({
      error: err => {
        console.log('----- PROCESSING PIPELINE VERY FATAL ERROR -----');
        opbeat.captureError(err);
        process.kill(process.pid, 'SIGHUP');
      },
      complete: () => {
        console.log(
          '----- PROCESSING PIPELINE COMPLETED. THAT SHOULDN’T HAPPEN.  -----'
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
