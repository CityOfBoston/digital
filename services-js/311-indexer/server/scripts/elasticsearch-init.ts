/* eslint no-console: 0 */
import dotenv from 'dotenv';
import Elasticsearch from '../services/Elasticsearch';

dotenv.config();

(async function initializeIndex() {
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

  await elasticsearch.initIndex();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
