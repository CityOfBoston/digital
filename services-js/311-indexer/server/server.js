// @flow
/* eslint no-console: 0 */

import cleanup from 'node-cleanup';
import Elasticsearch from './services/Elasticsearch';

type Opbeat = $Exports<'opbeat'>;

type ServerArgs = {
  opbeat: Opbeat,
};

export default async function startServer(args: ServerArgs) {
  Elasticsearch.configureAws(process.env.AWS_REGION);

  const elasticsearch = new Elasticsearch(
    process.env.ELASTICSEARCH_URL,
    process.env.ELASTICSEARCH_INDEX,
    args.opbeat
  );

  const info = await elasticsearch.info();
  console.log('Cluster info', info);

  const shutdown = () => Promise.resolve();

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
