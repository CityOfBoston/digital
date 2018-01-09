// @flow

import type { Client as PostmarkClient } from 'postmark';

import ReceiptEmail, {
  type TemplateData as ReceiptTemplateData,
} from '../email/ReceiptEmail';

type Opbeat = $Exports<'opbeat'>;

export default class Emails {
  from: string;
  postmarkClient: PostmarkClient;
  opbeat: Opbeat;

  receiptEmail: ReceiptEmail;

  constructor(from: string, postmarkClient: PostmarkClient, opbeat: Opbeat) {
    this.from = from;
    this.postmarkClient = postmarkClient;
    this.opbeat = opbeat;

    this.receiptEmail = new ReceiptEmail();
  }

  async sendReceiptEmail(to: string, data: ReceiptTemplateData): Promise<void> {
    try {
      await new Promise((resolve, reject) =>
        this.postmarkClient.sendEmail(
          {
            To: to,
            From: this.from,
            Subject: `City of Boston Death Certificates Order #${data.orderId}`,
            HtmlBody: this.receiptEmail.renderHtmlBody(data),
            TextBody: this.receiptEmail.renderTextBody(data),
          },
          (err, result) => (err ? reject(err) : resolve(result))
        )
      );
    } catch (e) {
      this.opbeat.captureError(e);
    }
  }
}
