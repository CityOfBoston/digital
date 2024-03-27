/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';

import QuestionComponent from '../../common/question-components/QuestionComponent';

import { MARRIAGEINTENTION } from '../../common/question-components/styling';

interface Props {
  marriageIntentionCertificateRequest: MarriageIntentionCertificateRequest;
  handleProceed: (ev: MouseEvent) => void;
  handleUserReset: (ev: MouseEvent) => void;
}

@observer
export default class Instructions extends Component<Props> {
  private $instructionsV2 = () => {
    return (
      <div css={MARRIAGEINTENTION}>
        <h1>Before You Get Started</h1>
        <div className={`getting-started`}>
          <p>
            <span className={`emphasis`}>
              The information you provide in this application will help us
              complete the marriage intention form, which is a legal document
              that is important for the marriage license.
            </span>{' '}
            During your appointment, we will review and finalize the information
            you share here and make sure everything's set before it is printed
            onto your marriage intention form.
          </p>
          <p>
            It should take about <span className={`emphasis`}>15 minutes</span>{' '}
            to finish this application if you have all the information below. We
            recommend that you and your partner fill this out together.
          </p>
        </div>

        <h2>What We Need From You and Your Partner</h2>
        <div className={`getting-started`}>
          <ul>
            <li>Legal names and last names you'll use after marriage</li>
            <li>Birthdates and birthplaces</li>
            <li>Residential addresses</li>
            <li>
              If you've been married before, how many times and the status of
              your last marriage
            </li>
            <li>
              If you've been in a civil union or domestic partnership before,
              its location and status
            </li>
            <li>
              Parents' names (including their family names) and whether they
              were married when you were born
            </li>
          </ul>
        </div>

        <h2>Documents That Might Be Helpful</h2>
        <div className={`getting-started`}>
          <ul>
            <li>A government-issued ID</li>
            <li>A birth certificate</li>
          </ul>
        </div>
      </div>
    );
  };

  public static isComplete(): boolean {
    return true;
  }

  public render() {
    return (
      <QuestionComponent
        handleProceed={this.props.handleProceed}
        handleReset={this.props.handleUserReset}
        allowProceed={Instructions.isComplete()}
        nextButtonText={'START'}
      >
        {this.$instructionsV2()}
      </QuestionComponent>
    );
  }
}
