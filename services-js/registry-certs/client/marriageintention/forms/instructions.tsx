/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';

import QuestionComponent from '../../common/question-components/QuestionComponent';

import PostConfirmationEmail from '../helpers/postConfirmationEmail';

import {
  SECTION_HEADING_STYLING,
  MARRIAGE_INTENTION_INTRO_BODY_STYLING,
} from '../../common/question-components/styling';

interface Props {
  marriageIntentionCertificateRequest: MarriageIntentionCertificateRequest;
  handleProceed: (ev: MouseEvent) => void;
  handleUserReset: (ev: MouseEvent) => void;
}

@observer
export default class Instructions extends Component<Props> {
  public static isComplete(): boolean {
    return true;
  }

  public render() {
    PostConfirmationEmail({
      email: 'phillip.kelly@boston.gov',
      from: 'marriage@boston.gov',
      subject: 'Marriage Intention Application',
      message: `Thank you for submitting your marriage intention application.
        Have questions? Contact us at 617-635-4175 or marriage@boston.gov`,
      fullName: `Testing PostConfirmEmail - FullName`,
    });
    console.log('PostConfirmationEmail: SENDT');

    return (
      <QuestionComponent
        handleProceed={this.props.handleProceed}
        handleReset={this.props.handleUserReset}
        allowProceed={Instructions.isComplete()}
        nextButtonText={'START'}
      >
        <h1 css={SECTION_HEADING_STYLING}>How to get started</h1>
        <div css={MARRIAGE_INTENTION_INTRO_BODY_STYLING}>
          <p>
            After completing this form, you’ll review and finalize your
            paperwork with the Registry Department at your appointment. Both you
            and your partner must come to this appointment. You will need to
            provide us:
          </p>
          <ul>
            <li>your social security numbers (if you have them)</li>
            <li>your IDs, and</li>
            <li>payment for a $50 application fee.</li>
          </ul>
          <p>
            We accept cash, credit, or a money order made payable to the "City
            of Boston".{' '}
            <a href="https://www.boston.gov/departments/registry/how-get-married-boston">
              Visit our website
            </a>{' '}
            for more information about marriage requirements.
          </p>
          <p>
            After you finalize your paperwork at your appointment, we will issue
            your marriage license and put in the mail three days later. It will
            be sent to the address listed under Person A. Your license will
            expire 60 days from the date of your appointment.
          </p>

          <p>Please Note:</p>
          <ul>
            <li>Both persons must be over age 18 and be free to marry.</li>
            <li>
              You must have a valid marriage license and be married in
              Massachusetts by a person eligible to perform weddings in
              Massachusetts.
            </li>
          </ul>
        </div>
      </QuestionComponent>
    );
  }
}
