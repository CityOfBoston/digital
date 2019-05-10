import { Client as PostmarkClient } from 'postmark';
import Rollbar from 'rollbar';

import EmailContent, {
  TemplateData as ApplicationData,
} from '../email/EmailContent';

// see services-js/registry-certs/server/services/Emails.ts

/**
 * Sends a confirmation email to the applicant, as well as to the policy office.
 */
export default class Email {
  from: string;
  policyOfficeToAddress: string;
  commissionsUri: string;
  postmarkClient: PostmarkClient;
  rollbar: Rollbar;
  emailContent: EmailContent;

  applicantSubject: string = 'We’ve received your application';
  policyOfficeSubject: string =
    'New City Clerk Boards and Commissions Application';

  constructor(
    from: string,
    policyOfficeToAddress: string,
    commissionsUri: string,
    postmarkClient: PostmarkClient,
    rollbar: Rollbar
  ) {
    this.from = from;
    this.policyOfficeToAddress = policyOfficeToAddress;
    this.commissionsUri = commissionsUri;
    this.postmarkClient = postmarkClient;
    this.rollbar = rollbar;

    this.emailContent = new EmailContent(this.commissionsUri);
  }

  public sendConfirmations(validForm, fetchedBoards, applicationId) {
    const applicationData: ApplicationData = {
      commissionNames: namesFromIds(fetchedBoards, validForm.commissionIds),
      firstName: validForm.firstName,
      lastName: validForm.lastName,
      email: validForm.email,
      applicationId,
    };

    const renderedApplicantBodies = this.emailContent.renderApplicantBodies(
      applicationData
    );
    const renderedPolicyOfficeBodies = this.emailContent.renderPolicyOfficeBodies(
      applicationData
    );

    // send to applicant...
    this.sendConfirmationEmail(
      applicationData.email,
      this.applicantSubject,
      renderedApplicantBodies
    ).catch(err => this.rollbar.error(err));

    // send to policy office...
    this.sendConfirmationEmail(
      this.policyOfficeToAddress,
      this.policyOfficeSubject,
      renderedPolicyOfficeBodies
    ).catch(err => this.rollbar.error(err));
  }

  /**
   * Use Postmark to send an email. The user does not need to be notified
   * if there is an error.
   */
  private sendConfirmationEmail(
    emailTo: string,
    subject: string,
    renderedBodies
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.postmarkClient.sendEmail(
        {
          To: emailTo,
          From: this.from,
          Subject: subject,
          HtmlBody: renderedBodies.html,
          TextBody: renderedBodies.text,
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
    });
  }
}

/**
 * Convert array of applied-for commissions into a human-readable list of
 * names, and sort it alphabetically.
 *
 * @param {Commission[]} commissionsList
 * @param {string[]} commissionIds
 */
export function namesFromIds(commissionsList, commissionIds) {
  return commissionIds
    .map(id => {
      const currentId = +id;

      return commissionsList.find(
        commission => commission.BoardID === currentId
      ).BoardName;
    })
    .sort((current, next) => current.localeCompare(next));
}
