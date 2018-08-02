import { Client as PostmarkClient } from 'postmark';
import Rollbar from 'rollbar';
import { Address } from 'address-rfc2822';

import ReceiptEmail, {
  TemplateData as ReceiptTemplateData,
} from '../email/ReceiptEmail';

export default class Emails {
  from: string;
  postmarkClient: PostmarkClient;
  rollbar: Rollbar;

  receiptEmail: ReceiptEmail;

  constructor(from: string, postmarkClient: PostmarkClient, rollbar: Rollbar) {
    this.from = from;
    this.postmarkClient = postmarkClient;
    this.rollbar = rollbar;

    this.receiptEmail = new ReceiptEmail();
  }

  formatTo(toName: string, toEmail: string): string {
    return new Address(toName, toEmail).format();
  }

  async sendReceiptEmail(
    toName: string,
    toEmail: string,
    data: ReceiptTemplateData
  ): Promise<void> {
    try {
      await new Promise((resolve, reject) =>
        this.postmarkClient.sendEmail(
          {
            To: this.formatTo(toName, toEmail),
            From: this.from,
            Subject: `City of Boston Death Certificates Order #${data.orderId}`,
            HtmlBody: this.receiptEmail.renderHtmlBody(data),
            TextBody: this.receiptEmail.renderTextBody(data),
          },
          (err, result) => (err ? reject(err) : resolve(result))
        )
      );
    } catch (e) {
      // If we can’t send the email we don’t error out the request.
      this.rollbar.error(e);
    }
  }
}
