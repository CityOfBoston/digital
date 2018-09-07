// @flow
/* eslint no-console: 0 */

import dotenv from 'dotenv';
import moment from 'moment';

import decryptEnv from '../lib/decrypt-env';
import loadCases from '../stages/load-cases';
import type { HydratedCaseRecord } from '../stages/types';
import { retryWithFallback } from '../stages/stage-helpers';

import Elasticsearch from '../services/Elasticsearch';
import Open311, { type Case } from '../services/Open311';
import Salesforce from '../services/Salesforce';

import { BehaviorSubject, Observable } from 'rxjs';

dotenv.config();
const opbeat = require('opbeat/start');

const timingStart = moment();
let caseCount = 0;

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

  const salesforce = new Salesforce(
    process.env.SALESFORCE_COMETD_URL,
    process.env.SALESFORCE_PUSH_TOPIC,
    process.env.SALESFORCE_CONSUMER_KEY,
    process.env.SALESFORCE_CONSUMER_SECRET,
    opbeat
  );

  const oauthSessionId = await salesforce.authenticate(
    process.env.SALESFORCE_OAUTH_URL,
    process.env.SALESFORCE_API_USERNAME,
    process.env.SALESFORCE_API_PASSWORD,
    process.env.SALESFORCE_API_SECURITY_TOKEN
  );

  const open311 = new Open311(
    process.env.PROD_311_ENDPOINT,
    process.env.PROD_311_KEY,
    opbeat
  );

  open311.oauthSessionId = oauthSessionId;

  const startDateMoment = moment(process.argv[2], 'YYYYMMDD');
  const endDateMoment = moment(process.argv[3], 'YYYYMMDD').endOf('day');

  // This stream takes an end date, loads and indexes the 50 most recent cases
  // from that date, and then outputs a date one second before the earliest
  // case. We use subscribe at the end to feed that end date back into the start
  // of the stream, so this will loop until it hits one of its takeWhile
  // conditions to complete.
  const endDateObserver = new BehaviorSubject(endDateMoment.toDate());

  endDateObserver
    // completes the stream when we've reached the start date
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
    .do(cases => {
      caseCount += cases.length;
      console.log(` - found ${cases.length} cases`);
    })
    // completes the stream when we make a fetch that has no cases
    .takeWhile(cases => cases.length > 0)
    .mergeMap(
      (cases: Array<Case>) =>
        Observable.from(cases)
          .map(c => ({ id: c.service_request_id, replayId: null }))
          // Reload from the individual endpoint for consistency with the frontend.
          .let(loadCases(10, { opbeat, open311 }))
          .toArray()
          .mergeMap((recordArr: Array<HydratedCaseRecord>) =>
            Observable.defer(() => elasticsearch.createCases(recordArr)).let(
              retryWithFallback(5, 2000, {
                error: err => {
                  console.log(`- error indexing cases`);
                  opbeat.captureError(err);
                },
              })
            )
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
    const duration = moment.duration(moment().diff(timingStart));
    console.log('----- IMPORT COMPLETE -----');
    console.log(
      `Imported ${caseCount} cases in ${duration.asSeconds()}s - ${Math.round(
        caseCount / duration.asHours()
      )} cases/hr`
    );
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
