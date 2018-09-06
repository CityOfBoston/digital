// @flow
/* eslint no-console: 0 */

import os from 'os';
import Rx from 'rxjs';
import cleanup from 'node-cleanup';
import fetch from 'node-fetch';

import Elasticsearch from './services/Elasticsearch';
import Salesforce from './services/Salesforce';
import Open311 from './services/Open311';
import type { DataMessage } from './services/Salesforce';

import decryptEnv from './lib/decrypt-env';
import loadCases from './stages/load-cases';
import type { Input as LoadCasesInput } from './stages/load-cases';

import indexCases from './stages/index-cases';

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
  let pipelineSubscription: ?Rx.Subscription;

  await decryptEnv();

  const shutdown = async () => {
    if (pipelineSubscription) {
      pipelineSubscription.unsubscribe();
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

  pipelineSubscription = Rx.Observable
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
    .map((msgs: Array<DataMessage<CaseUpdate>>): LoadCasesInput => {
      const replayIdsByCaseId = {};

      // We store a replayId with the case so we can find the latest when we
      // start up. We max over all the replay IDs for a given case id in the
      // update so that we store the latest, even if the case was updated
      // several times.
      msgs.forEach(msg => {
        replayIdsByCaseId[msg.data.sobject.CaseNumber] = Math.max(
          replayIdsByCaseId[msg.data.sobject.CaseNumber] || 0,
          msg.data.event.replayId
        );
      });

      return Object.keys(replayIdsByCaseId).map(id => ({
        id,
        replayId: replayIdsByCaseId[id],
      }));
    })
    .let(loadCases({ opbeat, open311 }))
    .let(indexCases({ opbeat, elasticsearch }))
    .subscribe();

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
    process.env.SALESFORCE_API_SECURITY_TOKEN,
    lastReplayId
  );
}
