// @flow
/* eslint no-console: 0 */

import 'isomorphic-fetch';
import dotenv from 'dotenv';
import Swiftype from 'swiftype';

import Open311 from '../server/services/Open311';
import type { ServiceRequest } from '../server/services/Open311';

dotenv.config();

type SwiftypeField =
  { type: 'string', name: string, value: string } |
  { type: 'text', name: string, value: string } |
  { type: 'enum', name: string, value: string } |
  { type: 'integer', name: string, value: number } |
  { type: 'float', name: string, value: number } |
  { type: 'date', name: string, value: string } |
  { type: 'location', name: string, value: { lat: ?number, lon: ?number } };

type SwiftypeDocument = {
  external_id: string,
  fields: SwiftypeField[],
}

const DOCUMENT_TYPE = 'cases';

function loadRecords(): Promise<ServiceRequest[]> {
  const open311 = new Open311(process.env.LEGACY_311_ENDPOINT);
  return open311.requests();
}

function convertRecordToSwiftypeDocument(record: ServiceRequest): SwiftypeDocument {
  return {
    external_id: record.service_request_id,
    fields: [
      { name: 'status', type: 'enum', value: record.status },
      { name: 'status_notes', type: 'text', value: record.status_notes || '' },
      { name: 'service_name', type: 'string', value: record.service_name || '' },
      { name: 'service_code', type: 'enum', value: record.service_code },
      { name: 'description', type: 'text', value: record.description || '' },
      { name: 'requested_datetime', type: 'date', value: record.requested_datetime },
      { name: 'updated_datetime', type: 'date', value: record.updated_datetime },
      { name: 'address', type: 'text', value: record.address || '' },
      { name: 'location', type: 'location', value: { lat: record.lat, lon: record.long } },
      { name: 'media_url', type: 'enum', value: record.media_url || '' },
    ],
  };
}

function uploadToSwiftype(records: ServiceRequest[]): Promise<boolean[]> {
  const swiftype = new Swiftype({
    apiKey: process.env.SWIFTYPE_API_KEY,
  });

  return new Promise((resolve, reject) => {
    const params = {
      engine: process.env.SWIFTYPE_ENGINE_SLUG,
      documentType: DOCUMENT_TYPE,
      documents: records.map(convertRecordToSwiftypeDocument),
    };

    swiftype.documents.bulkCreate(params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

((async function swiftypeLoad() {
  const records = await loadRecords();

  console.info(`DOWNLOADED ${records.length} CASES`);

  const oks = await uploadToSwiftype(records);

  console.info(`UPLOADED ${oks.filter((b) => b).length} CASES`);
}()).catch((err) => {
  console.error(err);
  process.exit(1);
}));
