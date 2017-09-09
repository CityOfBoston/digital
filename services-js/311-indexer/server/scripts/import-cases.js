// @flow
/* eslint no-console: 0 */

import dotenv from 'dotenv';
import moment from 'moment';

import decryptEnv from '../lib/decrypt-env';
import { retryWithFallback } from '../stages/stage-helpers';

import Elasticsearch from '../services/Elasticsearch';
import Open311 from '../services/Open311';

import { BehaviorSubject, Observable } from 'rxjs';

dotenv.config();
const opbeat = require('opbeat/start');

(async function initializeIndex() {
  await decryptEnv();

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

  const startDateMoment = moment(process.argv[2], 'YYYYMMDD');
  const endDateMoment = moment(process.argv[3], 'YYYYMMDD').endOf('day');

  // This stream takes an end date, loads and indexes the 50 most recent cases
  // from that date, and then outputs a date one second before the earliest
  // case. We use subscribe at the end to feed that end date back into the start
  // of the stream, so this will loop until it hits one of its takeWhile
  // conditions to complete.
  const endDateObserver = new BehaviorSubject(endDateMoment.toDate());

  endDateObserver
    .takeWhile(endDate => startDateMoment.isSameOrBefore(endDate))
    .do(endDate => console.log(`Fetching cases through ${endDate}…`))
    .concatMap(endDate =>
      Observable.of(endDate)
        .mergeMap(endDate =>
          open311.searchCases(startDateMoment.toDate(), endDate)
        )
        .let(
          retryWithFallback(5, 2000, {
            error: err => {
              console.log(`- error loading cases through ${endDate}`);
              opbeat.captureError(err);
            },
          })
        )
    )
    .do(cases => console.log(` - found ${cases.length} cases`))
    .takeWhile(cases => cases.length > 0)
    .concatMap(
      cases =>
        Observable.of(cases)
          .map(cases => cases.map(c => ({ case: c, replayId: null })))
          .mergeMap(caseList => elasticsearch.createCases(caseList))
          .let(
            retryWithFallback(5, 2000, {
              error: err => {
                console.log(`- error indexing cases`);
                opbeat.captureError(err);
              },
            })
          ),
      // We ignore the output of the indexing and push the original case list
      // through the rest of the stream.
      cases => cases
    )
    .do(() => console.log(' - indexing complete'))
    .map(cases =>
      moment
        // The endpoint does not treat endDate as exclusive, so we subtract 1
        // second to simulate that. Otherwise we can get trapped in a loop
        // loading the same case over and over.
        .utc(cases[cases.length - 1].requested_datetime)
        .subtract(1, 'second')
        .toDate()
    )
    .subscribe(endDateObserver);

  return new Promise((resolve, reject) => {
    endDateObserver.subscribe(null, reject, resolve);
  });
})()
  .then(() => {
    console.log('----- IMPORT COMPLETE -----');
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
