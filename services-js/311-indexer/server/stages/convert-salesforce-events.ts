import * as Rx from 'rxjs';
import { mergeMap, bufferTime, tap } from 'rxjs/operators';
import { logMessage } from './stage-helpers';
import { DataMessage } from '../services/Salesforce';
import { UpdatedCaseNotificationRecord } from './types';

export interface CaseUpdate {
  Status: string;
  CaseNumber: string;
  Id: string;
  Incap311__Service_Type_Version_Code__c: string;
}

export default function convertSalesforceEvents(): Rx.OperatorFunction<
  DataMessage<CaseUpdate>,
  UpdatedCaseNotificationRecord
> {
  return salesforceEvents$ =>
    salesforceEvents$.pipe(
      tap((msg: DataMessage<CaseUpdate>) =>
        logMessage('batch-salesforce-events', 'Received update event', msg)
      ),

      // 1s buffer so we can uniquify when Salesforce broadcasts several updates
      // for the same case back-to-back.
      bufferTime(1000),
      mergeMap((msgs: DataMessage<CaseUpdate>[]) => {
        const replayIdsByCaseId = {};

        // Only store the latest replayId for each case. This has the desired
        // side-effect of uniquifying the case IDs as well.
        msgs.forEach(msg => {
          replayIdsByCaseId[msg.data.sobject.CaseNumber] = Math.max(
            replayIdsByCaseId[msg.data.sobject.CaseNumber] || 0,
            msg.data.event.replayId
          );
        });

        // de-bulk our buffer with from to push the individual records as their
        // own events.
        return Rx.from(
          Object.keys(replayIdsByCaseId).map(id => ({
            id,
            replayId: replayIdsByCaseId[id],
          }))
        );
      })
    );
}
