/** @jsx jsx */

import { jsx, css } from '@emotion/core';

import { Component } from 'react';
import { observer } from 'mobx-react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';

import QuestionComponent from '../../common/question-components/QuestionComponent';
import FieldsetComponent from '../../common/question-components/FieldsetComponent';

import { SECTION_HEADING_STYLING } from '../../common/question-components/styling';

import PostConfirmationEmail from '../helpers/postConfirmationEmail';

interface Props {
  marriageIntentionCertificateRequest: MarriageIntentionCertificateRequest;
}

const REVIEW_WRAPPER_CSS = css({
  padding: '3%',
  fontSize: '1em',
  lineHeight: '1.7em',
});

@observer
export default class Receipt extends Component<Props> {
  componentDidMount() {
    const {
      email,
      partnerA_firstName,
      partnerA_lastName,
    } = this.props.marriageIntentionCertificateRequest.requestInformation;

    PostConfirmationEmail({
      email,
      from: 'marriage@boston.gov',
      subject: 'Marriage Intention Application',
      message: `
Thank you for submitting your marriage intention application.
Have questions? Contact us at 617-635-4175 or marriage@boston.gov
        `,
      fullName: `${partnerA_firstName} ${partnerA_lastName}`,
    });
  }

  public render() {
    return (
      <QuestionComponent>
        <FieldsetComponent
          legendText={<h2 css={SECTION_HEADING_STYLING}>Request Submitted</h2>}
        >
          <div css={REVIEW_WRAPPER_CSS}>
            <p>We have your request!</p>
            <p>
              Thank you for your submission. You should receive a confirmation
              email from the City of Boston in a few minutes. Have questions?
              Contact us at 617-635-4175 or marriage@boston.gov.
            </p>
          </div>
        </FieldsetComponent>
      </QuestionComponent>
    );
  }
}
