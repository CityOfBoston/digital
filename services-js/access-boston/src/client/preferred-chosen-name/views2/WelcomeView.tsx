/** @jsx jsx */
import { jsx } from '@emotion/core';

import { MouseEvent } from 'react';
import QuestionComponent from '../components/QuestionComponent';

import { CommonAttributes } from '../types';
import { PREFERRED_NAME_STYLING, WELCOMEVIEW_STYLING } from '../styling/index';

interface welcomeProps {
  handleProceed: (ev: MouseEvent) => void;
  appTitle: string;
  state: CommonAttributes;
}

export default function WelcomeView2({ handleProceed, state }: welcomeProps) {
  // console.log(`state: `, state);

  return (
    <div css={PREFERRED_NAME_STYLING}>
      <h2 className="headerBlock">Update Chosen Name</h2>
      <div className="BorderedAppWrapper">
        <div className="AppInnerContainer">
          <QuestionComponent
            quitBtn={false}
            nextButtonText="Continue"
            allowProceed={true}
            handleProceed={handleProceed}
          >
            <div css={WELCOMEVIEW_STYLING}>
              <p>
                A chosen name could be a preferred nickname, middle name, a
                shortened version of a legal name, or a name that aligns with
                your gender identity or expression.
              </p>

              <label>What’s Changing:</label>
              <ul>
                <li>
                  <strong>Chosen Name: </strong>
                  You can add a chosen name to your profile. This name will be
                  displayed in internal City of Boston systems.
                </li>
                {!state.altWorkflow && (
                  <li>
                    <strong>Email Address: </strong>
                    You can update your email address to reflect your chosen
                    name—or keep it as is, if you prefer.
                  </li>
                )}
              </ul>

              <label>What’s Not Changing: </label>
              <ul>
                {state.altWorkflow && (
                  <li>
                    <strong>Email Address: </strong>Your email address will
                    remain the same.
                  </li>
                )}
                <li>
                  <strong>Legal Name: </strong>
                  City Employees, your legal name used for tax documents (like
                  W2s), paystubs, or other official legal documents will remain
                  unchanged. To change your legal name, please follow the{' '}
                  <a href="https://www.google.com" target="_blank">
                    legal name link
                  </a>
                  .
                </li>
              </ul>
              <p>
                <strong>Please note: </strong>
                Any changes made to your chosen name or email address will be
                reflected across all relevant systems and communications.
              </p>
            </div>
          </QuestionComponent>
        </div>
      </div>
    </div>
  );
}
