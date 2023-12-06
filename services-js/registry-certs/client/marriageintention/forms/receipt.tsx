/** @jsx jsx */

import { jsx, css } from '@emotion/core';

import { Component } from 'react';
import { observer } from 'mobx-react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';

import SurveyComponent from '../../common/question-components/SurveyComponent';
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
    const surveyLink = _evt => {
      _evt.preventDefault();
      window.open(
        'https://docs.google.com/forms/d/e/1FAIpQLSf7o0gh6gD4v0f243EjJNd-zGBpqC7uK8O0VO5-KjDiDz-Q0Q/viewform'
      );
    };
    return (
      <SurveyComponent>
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

            <p css={HEADER_SURVEY}>We need your feedback!</p>
            <p>
              We want to better understand the experience of our customers when
              scheduling marriage appointments. Please take our quick survey
              today:
            </p>

            <div css={BUTTON_SURVEY} className="ta-r m-b500">
              <button
                type="button"
                className="btn btn--b-sm"
                onClick={surveyLink}
                title={'Take our Survey'}
              >
                Take our Survey
              </button>
            </div>
          </div>
        </FieldsetComponent>
      </SurveyComponent>
    );
  }
}

const HEADER_SURVEY = css({
  margin: '1.5em 0 0.7em',
  fontSize: '1.5em',
  fontWeight: 'bold',
  color: '#091f2f',
});

const BUTTON_SURVEY = css({
  display: 'Flex',
  justifyContent: 'center',
  marginTop: '2em',
});
