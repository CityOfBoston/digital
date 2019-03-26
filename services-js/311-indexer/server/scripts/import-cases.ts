/* eslint no-console: 0 */

import * as Rx from 'rxjs';

import {
  map,
  takeWhile,
  tap,
  toArray,
  concatMap,
  mergeMap,
} from 'rxjs/operators';

import dotenv from 'dotenv';
import moment from 'moment';

import decryptEnv from '@cityofboston/srv-decrypt-env';

import loadCases from '../stages/load-cases';
import { HydratedCaseRecord } from '../stages/types';
import { retryWithBackoff } from '../stages/stage-helpers';
import Elasticsearch from '../services/Elasticsearch';
import Open311 from '../services/Open311';
import Salesforce from '../services/Salesforce';

dotenv.config();

const Rollbar = require('rollbar');
const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    environment: process.env.ROLLBAR_ENVIRONMENT || process.env.NODE_ENV,
  },
});

const timingStart = moment();
let caseCount = 0;

(async function initializeIndex() {
  await decryptEnv();

  const elasticsearch = new Elasticsearch(
    process.env.ELASTICSEARCH_URL,
    process.env.ELASTICSEARCH_INDEX
  );

  try {
    const info = await elasticsearch.info();
    console.log('Elasticsearch connected', info);
  } catch (err) {
    console.error('ERROR GETTING ELASTICSEARCH INFO', err);
  }

  const salesforce = new Salesforce(
    rollbar,
    process.env.SALESFORCE_COMETD_URL,
    process.env.SALESFORCE_PUSH_TOPIC,
    process.env.SALESFORCE_CONSUMER_KEY,
    process.env.SALESFORCE_CONSUMER_SECRET
  );

  const oauthSessionId = await salesforce.authenticate(
    process.env.SALESFORCE_OAUTH_URL,
    process.env.SALESFORCE_API_USERNAME,
    process.env.SALESFORCE_API_PASSWORD,
    process.env.SALESFORCE_API_SECURITY_TOKEN
  );

  const open311 = new Open311(
    process.env.OPEN311_ENDPOINT,
    process.env.OPEN311_KEY
  );

  open311.oauthSessionId = oauthSessionId;

  const startDateMoment = moment(process.argv[2], 'YYYYMMDD');
  const endDateMoment = moment(process.argv[3], 'YYYYMMDD').endOf('day');

  // This stream takes an end date, loads and indexes the 50 most recent cases
  // from that date, and then outputs the date of the earliest case. We use
  // subscribe at the end to feed that end date back into the start of the
  // stream, so this will loop until it hits one of its takeWhile conditions to
  // complete.
  const endDateObserver = new Rx.BehaviorSubject(endDateMoment.toDate());
  endDateObserver
    .pipe(
      // completes the stream when we've reached the start date
      takeWhile(endDate => startDateMoment.isSameOrBefore(endDate)),
      tap(endDate => console.log(`Fetching cases through ${endDate}…`)),
      concatMap(endDate =>
        Rx.of(endDate).pipe(
          mergeMap(async endDate => ({
            endDate,
            cases: await open311.searchCases(startDateMoment.toDate(), endDate),
          })),
          retryWithBackoff(5, 2000, {
            error: err => {
              console.log(`- error loading cases through ${endDate}`);
              rollbar.error(err);
            },
          })
        )
      ),
      tap(({ cases }) => {
        caseCount += cases.length;
        const casesDateString =
          cases.length > 1
            ? ` from ${cases[0].requested_datetime} to ${
                cases[cases.length - 1].requested_datetime
              }`
            : '';
        console.log(` - found ${cases.length} cases${casesDateString}`);
      }),
      // completes the stream when we make a fetch that has no cases
      takeWhile(({ cases }) => cases.length > 0),
      mergeMap(({ endDate, cases }) =>
        // This "from" fans the single array of cases into a stream of them so we
        // can hydrate them in parallel with loadCases. The toArray below then
        // squishes them back into one array so we can index them in bulk.
        Rx.from(cases).pipe(
          map(c => ({ id: c.service_request_id, replayId: null })),
          // Reload from the individual endpoint for consistency with the frontend.
          loadCases(10, { rollbar, open311 }),
          toArray(),
          mergeMap((recordArr: HydratedCaseRecord[]) =>
            Rx.defer(() => elasticsearch.createCases(recordArr)).pipe(
              retryWithBackoff(5, 2000, {
                error: err => {
                  console.log(`- error indexing cases`);
                  rollbar.error(err);
                },
              })
            )
          ),
          map(indexResult => ({ endDate, cases, indexResult }))
        )
      ),
      tap(() => console.log(' - indexing complete')),
      map(({ endDate, cases }) => {
        // We send the last case’s date out so we know what to loop with again.
        // This does mean that we’ll load the same case twice, since the API’s
        // date range is inclusive. We still have to do it, though, because
        // imported 311 cases only have minute granularity on their timestamps.
        //
        // Unless we’re exhaustive about the dates, it would be easy to miss
        // several from the same minute if they happened to be on different API
        // pages.
        const lastCaseDate = moment.utc(
          cases[cases.length - 1].requested_datetime
        );

        // We do check to make sure that we’re not sending the same date out a
        // second time in a row, as that would lead to an infinite loop. This
        // means that we will miss if there are more than 50 cases for the same
        // minute, which we expect (without any evidence) to be rare.
        if (lastCaseDate.isSame(endDate)) {
          return lastCaseDate.subtract(1, 'second').toDate();
        } else {
          return lastCaseDate.toDate();
        }
      })
    )
    .subscribe(endDateObserver);

  return new Promise((resolve, reject) => {
    endDateObserver.subscribe(() => {}, reject, resolve);
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
