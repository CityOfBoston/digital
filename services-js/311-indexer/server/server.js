// @flow
/* eslint no-console: 0 */

import cleanup from 'node-cleanup';
import Elasticsearch from './services/Elasticsearch';
import Salesforce from './services/Salesforce';

type Opbeat = $Exports<'opbeat'>;

type ServerArgs = {
  opbeat: Opbeat,
};

type Invoice = {|
  Description__c: string,
  Id: string,
  Status__c: string,
  Name: string,
|};

export default async function startServer(args: ServerArgs) {
  let salesforce: ?Salesforce<Invoice>;

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
    args.opbeat
  );

  try {
    const info = await elasticsearch.info();
    console.log('Elasticsearch connected', info);
  } catch (err) {
    console.error('ERROR GETTING ELASTICSEARCH INFO', err);
  }

  salesforce = new Salesforce(
    process.env.SALESFORCE_COMETD_URL,
    process.env.SALESFORCE_PUSH_TOPIC,
    process.env.SALESFORCE_CONSUMER_KEY,
    process.env.SALESFORCE_CONSUMER_SECRET,
    args.opbeat
  );

  salesforce.on('meta', (msg: Object) => {
    console.info(JSON.stringify(msg));
  });

  salesforce.on('event', (msg: Object) => {
    console.info(JSON.stringify(msg));
  });

  salesforce.on('error', (err: Error) => {
    // This may happen if your session expires. Rather than try to re-auth, just exit
    // and let the container agent restart us.
    console.log('----- SALESFORCE CONNECTION ERROR -----');
    console.error(err);

    process.kill(process.pid, 'SIGHUP');
  });

  await salesforce.connect(
    process.env.SALESFORCE_OAUTH_URL,
    process.env.SALESFORCE_API_USERNAME,
    process.env.SALESFORCE_API_PASSWORD,
    process.env.SALESFORCE_API_SECURITY_TOKEN
  );
}
