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
  Elasticsearch.configureAws(process.env.AWS_REGION);

  const elasticsearch = new Elasticsearch(
    process.env.ELASTICSEARCH_URL,
    process.env.ELASTICSEARCH_INDEX,
    args.opbeat
  );

  const info = await elasticsearch.info();
  console.log('Elasticsearch connected', info);

  const salesforce: Salesforce<Invoice> = new Salesforce(
    process.env.SALESFORCE_COMETD_URL,
    process.env.SALESFORCE_PUSH_TOPIC,
    process.env.SALESFORCE_CONSUMER_KEY,
    process.env.SALESFORCE_CONSUMER_SECRET,
    args.opbeat
  );

  salesforce.on('meta', (msg: Object) => {
    console.info(JSON.stringify(msg));
  });

  salesforce.on('error', (err: Error) => {
    // This may happen if your session expires. Rather than try to re-auth, just exit
    // and let the container agent restart us.
    console.error('Error in Salesforce connection. Exiting.', err);
    process.exit(1);
  });

  await salesforce.connect(
    process.env.SALESFORCE_OAUTH_URL,
    process.env.SALESFORCE_API_USERNAME,
    process.env.SALESFORCE_API_PASSWORD
  );

  const shutdown = async () => {
    await salesforce.disconnect();
  };

  cleanup(exitCode => {
    shutdown().then(
      () => {
        process.exit(exitCode || 0);
      },
      err => {
        console.log('CLEAN EXIT FAILED', err);
        process.exit(-1);
      }
    );

    cleanup.uninstall();
    return false;
  });
}
