// @flow

import Rx from 'rxjs';

import { logMessage } from './stage-helpers';

import type { DataMessage } from '../services/Salesforce';
import type { CaseIdBatch } from './load-cases';

type CaseUpdate = {|
  'Status': string,
  'CaseNumber': string,
  'Id': string,
  'Incap311__Service_Type_Version_Code__c': string,
|};

export default function batchSalesforceEventsOp(): (
  Rx.Observable<DataMessage<CaseUpdate>>
) => Rx.Observable<CaseIdBatch> {
  return salesforceEventStream =>
    salesforceEventStream
      .do((msg: DataMessage<CaseUpdate>) =>
        logMessage('batch-salesforce-events', 'Received update event', msg)
      )
      // We buffer up to 25 updates (but always flushing at least once per second)
      // into a single batch so we can do a bulk fetch to Open311, and also
      // because some Salesforce operations trigger back-to-back events on the
      // same case. The buffer lets us uniquify those so that we only fetch the
      // case once.
      .bufferTime(1000, null, 25)
      // bufferTime can emit an empty array when its time limit expires, so we
      // filter those out.
      .filter(b => b.length > 0)
      .map((msgs: Array<DataMessage<CaseUpdate>>): CaseIdBatch => {
        const replayIdsByCaseId = {};

        // We store a replayId with the case so we can find the latest when we
        // start up. We max over all the replay IDs for a given case id in the
        // update so that we store the latest, even if the case was updated
        // several times.
        //
        // This also has the effect of uniquifying the caseIds since the
        // replayIdsByCaseId map will only have one key per case.
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
      });
}
