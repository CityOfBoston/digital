/* eslint no-console: 0 */
import path from 'path';
import fs from 'fs';
import { tmpNameSync } from 'tmp';
import level from 'level';
import rimraf from 'rimraf';
import pump from 'pump';

import csv from 'csv-parser';
import { Readable, Transform } from 'stream';
import { LevelUp } from 'levelup';
import { LevelDown } from 'leveldown';
import { promisify } from 'util';
import AWS from 'aws-sdk';
import s3streams from 's3-streams';

const rimrafP = promisify(rimraf);
const pumpP = promisify(pump);

const DB_BATCH_SIZE = 1000;

/**
 * Character that is greater than any other ASCII character in our keys. Used
 * as both a separator in compound keys and a way to generate a max key for
 * ranges.
 */
const ASCII_LATE = '~';

/**
 * Property names taken from original implementation
 */
export type PermitDataElementRow = {
  Address: string;
  BuildingOrFire: 'Building' | 'Fire';
  City: string;
  PermitNumber: string;
  PermitPOCName: string;
  PermitType: string;
  State: string;
  Zip: string;
};

/** The headers for the DataElementExport CSV */
const DATA_ELEMENT_HEADERS: Array<keyof PermitDataElementRow> = [
  'PermitNumber',
  'BuildingOrFire',
  'PermitType',
  'Address',
  'City',
  'State',
  'Zip',
  'PermitPOCName',
];

/**
 * Property names taken from original implementation
 */
export type PermitMilestoneRow = {
  PermitNumber: string;
  MilestoneName: string;
  // format: 2016-10-03 09:17:21.857000
  // in US/Eastern timezone
  MilestoneStartDate: string;
  MilestoneEndDate: string;
  // number in seconds
  AverageDurationOfMilestone: string;
  CityContactName: string | undefined;
};

/** The headers for the MilestoneExport CSV */
export const MILESTONE_NAMES = [
  'Abandon',
  'Inspection',
  'Fees',
  'Ready to Issue',
  'PlanningZoning',
  'Final Review',
  'Work Progress',
  'Review',
  'Issue Cert',
  'Closed',
  'ScheduleInspection',
  'Waiting',
  'BOA Pending',
  'Admin PZ Review',
  'Intake',
  'Denied',
  'Ready To Issue',
  'OccNotOnFile',
  'Issued',
  'Issue',
  'Revoke',
  'Complete',
  'Reviews',
  'Processing',
  'Traffic Management Review',
  'Board of Appeals',
  'Abandoned',
  'Awaiting Refund Request',
  'Satisfy Conditions',
  'Waiting Fee',
  'Close',
  'District Review',
  'Final Inspection',
];

export const MILESTONE_HEADERS: Array<keyof PermitMilestoneRow> = [
  'PermitNumber',
  'MilestoneName',
  'MilestoneStartDate',
  'MilestoneEndDate',
  'AverageDurationOfMilestone',
  'CityContactName',
];

export type PermitReviewRow = {
  PermitNumber: string;
  ReviewType: string;
  ReviewerName: string;
  IsAssignedFlag: 'Y' | 'N';
  IsStartedFlag: 'Y' | 'N';
  IsCompleteFlag: 'Y' | 'N';
  ReviewStatus: string;
};

/** The headers for the ReviewExport CSV */
export const REVIEW_HEADERS: Array<keyof PermitReviewRow> = [
  'PermitNumber',
  'ReviewType',
  'ReviewerName',
  'IsAssignedFlag',
  'IsStartedFlag',
  'IsCompleteFlag',
  'ReviewStatus',
];

export type PermitDbEntry = {
  data: PermitDataElementRow;
  milestones: Array<PermitMilestoneRow>;
  reviews: Array<PermitReviewRow>;
};

type PERMIT_ROW_KIND = 'data' | 'milestone' | 'review';

/**
 * Generates a key from pieces. Pieces are optional so that this can be used to
 * generate ranges.
 *
 * Since the key parts have inconsistent lengths, we use ASCII_LATE as a
 * separator in order to be able to create a key prefix that doesn’t match other
 * permits.
 *
 * E.g. We need the keys for permit U123 to not match U1234. "2~U123~" >
 * "2~U1234~"
 *
 * @param gen DB generation for the key
 * @param id The permit number
 * @param kind Data type, since data, reviews, and milestones are all mixed in
 * to the same DB store.
 * @param i Number used to distinguish multiple of the same id/kind (like
 * multiple reviews for the same permit)
 */
function makeKey(
  gen: number,
  id?: string,
  kind?: PERMIT_ROW_KIND,
  i?: number
): string {
  return [gen, id, kind, i, ''].filter(el => el !== undefined).join(ASCII_LATE);
}

/**
 * Creates a Level range for a key by making an options hash that matches all
 * keys with the given prefix. We assume that prefix already ends with the key
 * separator.
 */
function makeKeyRange(prefix: string) {
  return {
    gte: prefix,
    lt: prefix + ASCII_LATE,
  };
}

/**
 * Object that manages a local database cache of permit information.
 *
 * Uses a Level database to store the permit information, which is bigger than
 * we’d like to keep in memory, but we don’t want to just scan flat files either
 * because that’s slow.
 *
 * Level is flat (there’s only one keyspace) so to hold the 3 types of data
 * (DataElement, Milestone, Review) we use a "data type" marker in the key.
 *
 * All keys for a given permit are given the same prefix so that they’re easy to
 * iterate over.
 *
 * <generation>.<permit number>.<type>.<n>
 *
 * For example:
 *
 * <pre>
 * 1~X49106288~data~
 * 1~X49106288~milestone~0~
 * 1~X49106288~review~0~
 * 1~X49106288~review~1~
 * </pre>
 *
 * We don’t try to do anything fancy when new data is available. We load in the
 * entirety of the files in a new "generation" and then delete the old one.
 */
export default class PermitFiles {
  private db: LevelUp;
  private dbPath: string;

  /**
   * Prefix for all keys. We increment this when loading in new data and delete
   * the old generation when we’re done. Lets us easily and atomically replace
   * all the data in the database.
   */
  private dbGeneration: number = 0;

  private loadingDb: boolean = false;

  /**
   * Timestamp for when we last got fresh data from S3. This is compared with
   * the "LastModified" properties of the S3 objects, so that we only download
   * from S3 after things have changed.
   */
  private lastS3TimeMs: number = 0;

  constructor() {
    this.dbPath = tmpNameSync();

    console.info('Creating database at: ', this.dbPath);

    this.db = level(this.dbPath, {
      keyEncoding: 'ascii',
      valueEncoding: 'json',
    });
  }

  /**
   * We unwrap the deferred-leveldown and another layer from our levelup
   * database. We need this in order to get at LevelDown’s getProperty and
   * compactRange methods.
   */
  private get leveldownDb(): LevelDown {
    return (this.db as any).db.db;
  }

  /**
   * Loads data from disk, such as fixtures.`
   */
  async loadFromDir(dir: string) {
    // guard out here before we open any streams
    if (this.loadingDb) {
      return;
    }

    console.info(`Loading data from disk: ${dir}`);

    const dataElementStream = fs.createReadStream(
      path.join(dir, 'DataElementExport.csv')
    );

    const milestoneStream = fs.createReadStream(
      path.join(dir, 'MilestoneExport.csv')
    );

    const reviewStream = fs.createReadStream(
      path.join(dir, 'ReviewExport.csv')
    );

    await this.updateDb(dataElementStream, milestoneStream, reviewStream);
  }

  /**
   * Downloads our data from S3 and repopulates the database.
   *
   * Short-circuits out if the data hasn’t changed since this method was last
   * called.
   */
  async loadFromS3(s3: AWS.S3, bucket: string) {
    // guard out here before we open any streams
    if (this.loadingDb) {
      return;
    }

    const objects = (await s3
      .listObjects({ Bucket: bucket, Prefix: 'permit-finder/' })
      .promise()).Contents;

    if (objects && objects.length > 0) {
      // Get a list of s3 objects whose last modified times are after the last
      // time we checked. If there are any then we need to reload the whole data
      // set. While it’s not :100: to compare server-generated timestamps with a
      // locally-generated time, we can assume that the clocks are all pretty
      // much in sync for the minutes-resolution that we’re concerned with.
      const updatedObjects = objects.filter(
        ({ LastModified }) =>
          !LastModified || LastModified.getTime() > this.lastS3TimeMs
      );

      if (updatedObjects.length === 0) {
        console.log(
          `No files have changed on S3 since ${new Date(this.lastS3TimeMs)}`
        );

        return;
      } else {
        console.log('Changed files', updatedObjects.map(({ Key }) => Key));
      }
    }

    console.info(`Loading data from S3: ${bucket}`);

    const dataElementStream = s3streams.ReadStream(s3, {
      Bucket: bucket,
      Key: 'permit-finder/DataElementExport.csv',
    });

    const milestoneStream = s3streams.ReadStream(s3, {
      Bucket: bucket,
      Key: 'permit-finder/MilestoneExport.csv',
    });

    const reviewStream = s3streams.ReadStream(s3, {
      Bucket: bucket,
      Key: 'permit-finder/ReviewExport.csv',
    });

    await this.updateDb(dataElementStream, milestoneStream, reviewStream);

    this.lastS3TimeMs = Date.now();
  }

  async destroy() {
    await this.db.close();
    await rimrafP(this.dbPath);
  }

  /**
   * Updates our local database with the contents of the given CSV file streams.
   * Increments the generation and deletes the old generation.
   */
  private async updateDb(
    dataElementStream: Readable,
    milestoneStream: Readable,
    reviewStream: Readable
  ) {
    try {
      this.loadingDb = true;

      const nextGeneration = this.dbGeneration + 1;

      console.time('data elements');
      console.time('milestones');
      console.time('reviews');

      await Promise.all([
        this.importCsvStream<PermitDataElementRow>(
          dataElementStream,
          DATA_ELEMENT_HEADERS,
          ({ PermitNumber }) => makeKey(nextGeneration, PermitNumber, 'data')
        ).then(() => console.timeEnd('data elements')),

        this.importCsvStream<PermitMilestoneRow>(
          milestoneStream,
          MILESTONE_HEADERS,
          ({ PermitNumber }, i) =>
            makeKey(nextGeneration, PermitNumber, 'milestone', i)
        ).then(() => console.timeEnd('milestones')),

        this.importCsvStream<PermitReviewRow>(
          reviewStream,
          REVIEW_HEADERS,
          ({ PermitNumber }, i) =>
            makeKey(nextGeneration, PermitNumber, 'review', i)
        ).then(() => console.timeEnd('reviews')),
      ]);

      const oldGeneration = this.dbGeneration;
      this.dbGeneration = nextGeneration;

      console.time('clear');
      const count = await this.clearGeneration(oldGeneration);
      console.log(`Deleted ${count} rows from the last generation`);
      console.timeEnd('clear');

      console.info(this.leveldownDb.getProperty('leveldb.stats'));
    } finally {
      this.loadingDb = false;
    }
  }

  /**
   * Takes a stream and parses it as CSV and adds it to our database.
   *
   * This is all done with stream operations because we get better performance
   * and built-in backpressure than if we were to try and integrate promises.
   *
   * @param csvHeaders Array of keys to associate with each CSV column, since
   * our CSV files don’t have them declared at the top.
   * @param makeKey is a function from the row type and the record number to the
   * key. Keys should start with the generation number and are a series of
   * fields, separated by a `~` character. .
   */
  private importCsvStream<T>(
    stream: Readable,
    csvHeaders: Array<Extract<keyof T, string>>,
    makeKey: (row: T, i: number) => string
  ): Promise<void> {
    // We keep a Level batch going and add our operations to it. Every so often
    // we write the batch. This is faster than going to disk on each new row.
    let batch = this.db.batch();
    let i = 0;

    return pumpP(
      stream,
      csv(csvHeaders),
      new Transform({
        objectMode: true,
        transform: ((row: T, _encoding, done) => {
          const key = makeKey(row, i);
          batch.put(key, row);

          i++;

          if (i % DB_BATCH_SIZE === 0) {
            batch.write(done);
            batch = this.db.batch();
          } else {
            done();
          }
        }) as any,
        flush: done => {
          // Flush is called right before closing. We need to get anything still
          // on the batch written.
          batch.write(done as any);
        },
      })
    );
  }

  /**
   * Iterates over the keys in the database and deletes ones from the given
   * generation.
   *
   * Used after a new generation is loaded in to delete the old one.
   */
  private async clearGeneration(generation: number): Promise<number> {
    let batch = this.db.batch();
    let i = 0;

    const range = makeKeyRange(makeKey(generation));

    await pumpP(
      this.db.createKeyStream(range),
      new Transform({
        objectMode: true,
        transform: ((key: string, _encoding, done) => {
          batch.del(key);
          i++;

          if (i % DB_BATCH_SIZE === 0) {
            batch.write(done);
            batch = this.db.batch();
          } else {
            done();
          }
        }) as any,
        flush: done => {
          batch.write(done as any);
        },
      })
    );

    await new Promise((resolve, reject) => {
      // Now we compact the range that we just deleted in order to purge files
      // and keep our disk usage from growing over time. (Level will eventually
      // compact on its own but this is a simple enough way to put bounds on
      // it.)
      //
      // Has to be run on the underlying leveldownDb because this low-level
      // method is not exposed in the wrappers.
      this.leveldownDb.compactRange(range.gte, range.lt, err =>
        err ? reject(err) : resolve()
      );
    });

    return i;
  }

  /**
   * Loads all the relevant data for the given permit. We do this in a single
   * read stream because Level gives us the guarantee that a stream will see a
   * consistent view of the data, so we don’t need to worry about keys getting
   * deleted.
   */
  async lookupPermit(permitNumber: string): Promise<PermitDbEntry | null> {
    let data: PermitDataElementRow | null = null;
    const milestones: PermitMilestoneRow[] = [];
    const reviews: PermitReviewRow[] = [];

    console.time(`permit ${permitNumber}`);

    await pumpP(
      // This stream gives us all values that match the permitNumber (in this
      // generation). Level guarantees that the iterator will have a consistent
      // view of the data, so we don’t need to worry about this colliding with a
      // generation cleanup or anything like that.
      this.db.createReadStream(
        makeKeyRange(makeKey(this.dbGeneration, permitNumber))
      ),
      new Transform({
        objectMode: true,
        transform: (({ key, value }, _encoding, done) => {
          // The key range we asked for gives us everything about the permit, so
          // we have to find out what type of data is in our particular row.
          const keyBits = key.split(ASCII_LATE);
          switch (keyBits[2]) {
            case 'data':
              data = value;
              break;
            case 'milestone':
              milestones.push(value);
              break;
            case 'review':
              reviews.push(value);
              break;
            default:
              done(new Error('Unknown key: ' + key));
              return;
          }

          done();
        }) as any,
      })
    );

    console.timeEnd(`permit ${permitNumber}`);

    if (data) {
      return {
        data,
        milestones,
        reviews,
      };
    } else {
      return null;
    }
  }
}
