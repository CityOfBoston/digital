import { action, runInAction } from 'mobx';
import { FetchGraphql } from '@cityofboston/next-client-common';

import MarriageIntentionCertificateRequest from '../store/MarriageIntentionCertificateRequest';

import submitMarriageIntentionCertificateOrder from '../queries/submit-marriage-intention-certificate-order';

import { OrderErrorCause } from '../queries/graphql-types';
import { MarriageIntentionCertificateOrderResult } from '../types';

export class SubmissionError extends Error {
  public readonly cause: OrderErrorCause;

  constructor(message: string, cause: OrderErrorCause) {
    super(message);
    this.cause = cause;
  }
}

export default class MarriageIntentionDao {
  fetchGraphql: FetchGraphql;

  constructor(fetchGraphql: FetchGraphql) {
    this.fetchGraphql = fetchGraphql;
  }

  /**
   * Submits a marriage intention request.
   *
   * @returns The order ID on success.
   * @throws Error or SubmissionError objects. Reports errors to Rollbar.
   */
  submitMarriageIntentionCertificateRequest(
    marriageIntentionCertificateRequest: MarriageIntentionCertificateRequest
  ): Promise<string> {
    // eslint-disable-next-line no-console
    // console.log(
    //   'DAO > submitMarriageIntentionCertificateRequest',
    //   marriageIntentionCertificateRequest
    // );

    const orderPromise = submitMarriageIntentionCertificateOrder(
      this.fetchGraphql,
      marriageIntentionCertificateRequest
    );

    // eslint-disable-next-line no-console
    // console.log('DAO > submit > orderPromise: ', orderPromise);
    return this.handleOrder(orderPromise);
  }

  @action
  private async handleOrder(
    orderPromise: Promise<MarriageIntentionCertificateOrderResult>
  ): Promise<string> {
    let processing = true;

    try {
      let orderResult: MarriageIntentionCertificateOrderResult;

      // try {
      //   orderResult = await orderPromise;
      //   // eslint-disable-next-line no-console
      //   console.log('DAO > handleOrder > orderResult: ', orderResult);
      // } catch (err) {
      //   // These errors will be network sorts of errors.
      //   if ((window as any).Rollbar && !err._reportedException) {
      //     (window as any).Rollbar.error(err);
      //     err._reportedException = true;
      //   }
      //   // eslint-disable-next-line no-console
      //   console.log('DAO > handleOrder > !orderResult: ', err);

      //   throw err;
      // }

      orderResult = await orderPromise;

      if (orderResult.order) {
        return orderResult.order.id;
      } else if (orderResult.error) {
        // We don't need this to be reported to Rollbar. If it’s an internal
        // error, the server would have reported it, and if it’s a user error
        // (card information) we don’t care.

        // eslint-disable-next-line no-console
        // console.log('DAO > handleOrder > submissionError: ', orderResult);
        throw new SubmissionError(
          orderResult.error.message,
          orderResult.error.cause
        );
      } else {
        // This won’t happen
        throw new Error('Result did not have an order or error');
      }
    } finally {
      runInAction(() => {
        processing = false;
        // eslint-disable-next-line no-console
        console.log('processing: ', processing);
      });
    }
  }
}
