import { Client as PostmarkClient } from 'postmark';
import Rollbar from 'rollbar';
import { Address } from 'address-rfc2822';

import {
  EmailTemplates,
  ReceiptData,
  RenderedEmail,
} from '../email/EmailTemplates';

export default class Emails {
  private from: string;
  private postmarkClient: PostmarkClient;
  private rollbar: Rollbar;

  private templates: EmailTemplates;

  constructor(
    from: string,
    postmarkClient: PostmarkClient,
    rollbar: Rollbar,
    templates: EmailTemplates
  ) {
    this.from = from;
    this.postmarkClient = postmarkClient;
    this.rollbar = rollbar;

    this.templates = templates;
  }

  private async sendEmail(
    toName: string,
    toEmail: string,
    email: RenderedEmail
  ): Promise<void> {
    try {
      const { subject, html, text } = email;

      await new Promise((resolve, reject) =>
        this.postmarkClient.sendEmail(
          {
            To: formatTo(toName, toEmail),
            From: this.from,
            Subject: subject,
            HtmlBody: html,
            TextBody: text,
          },
          (err, result) => (err ? reject(err) : resolve(result))
        )
      );
    } catch (e) {
      // If we can’t send the email we don’t error out the request.
      this.rollbar.error(e);
    }
  }

  async sendReceiptEmail(
    toName: string,
    toEmail: string,
    data: ReceiptData
  ): Promise<void> {
    await this.sendEmail(toName, toEmail, this.templates.receipt(data));
  }
}

export function formatTo(toName: string, toEmail: string): string {
  return new Address(toName, toEmail).format();
}
