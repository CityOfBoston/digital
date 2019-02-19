import { Client as PostmarkClient } from 'postmark';
import Rollbar from 'rollbar';
import { Address } from 'address-rfc2822';

import {
  EmailTemplates,
  ReceiptData,
  RenderedEmail,
} from '../email/EmailTemplates';

const REGISTRY_EMAIL = 'registry@boston.gov';
const BIRTH_EMAIL = 'birth@boston.gov';

export default class Emails {
  private postmarkClient: PostmarkClient;
  private rollbar: Rollbar;

  private templates: EmailTemplates;

  constructor(
    postmarkClient: PostmarkClient,
    rollbar: Rollbar,
    templates: EmailTemplates
  ) {
    this.postmarkClient = postmarkClient;
    this.rollbar = rollbar;

    this.templates = templates;
  }

  private async sendEmail(
    toName: string,
    toEmail: string,
    fromEmail: string,
    email: RenderedEmail
  ): Promise<void> {
    try {
      const { subject, html, text } = email;

      await new Promise((resolve, reject) =>
        this.postmarkClient.sendEmail(
          {
            To: formatTo(toName, toEmail),
            From: fromEmail,
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

  async sendDeathReceiptEmail(
    toName: string,
    toEmail: string,
    data: ReceiptData
  ): Promise<void> {
    await this.sendEmail(
      toName,
      toEmail,
      REGISTRY_EMAIL,
      this.templates.deathReceipt(data)
    );
  }

  async sendBirthReceiptEmail(
    toName: string,
    toEmail: string,
    data: ReceiptData
  ): Promise<void> {
    await this.sendEmail(
      toName,
      toEmail,
      BIRTH_EMAIL,
      this.templates.birthReceipt(data)
    );
  }

  async sendBirthShippedEmail(
    toName: string,
    toEmail: string,
    data: ReceiptData
  ): Promise<void> {
    await this.sendEmail(
      toName,
      toEmail,
      BIRTH_EMAIL,
      this.templates.birthShipped(data)
    );
  }

  async sendBirthExpiredEmail(
    toName: string,
    toEmail: string,
    orderId: string,
    orderDate: Date
  ): Promise<void> {
    await this.sendEmail(
      toName,
      toEmail,
      BIRTH_EMAIL,
      this.templates.birthExpired(orderId, orderDate)
    );
  }
}

export function formatTo(toName: string, toEmail: string): string {
  return new Address(toName, toEmail).format();
}
