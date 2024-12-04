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

export const WelcomeView2 = ({ handleProceed, state }: welcomeProps) => {
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
                    remain the same. To update your email, please contact your
                    IT Department.
                  </li>
                )}
                <li>
                  <strong>Legal Name: </strong>
                  City Employees, your legal name used for tax documents (like
                  W2s), paystubs, or other official legal documents will remain
                  unchanged. This will not update HCM or ESS. To change your
                  legal name, please follow the{' '}
                  <a
                    href="https://sso-test.boston.gov/as/authorization.oauth2?response_type=code&client_id=pa_wam&redirect_uri=https%3A%2F%2Fess-awsuat.boston.gov%2Fpa%2Foidc%2Fcb&state=eyJ6aXAiOiJERUYiLCJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2Iiwia2lkIjoiQk9MZmJmTm1YZFBRdHhsTkY4aEdUT0hQa1NnIiwic3VmZml4IjoiMVhyR2tVLjE3MzI4OTA5MzMifQ..HK2KIBY6u5vJFcsaXyv9NA.RDqP6cAoD_aRK_dOL6t4w46vt8L-YaLpo5LGPkI1C6_nUIE7cAAnd-AF_N2KATyqOyx1hr6nhUgVuX3TfjX1xM6bc7_4_0c2XUnxPCN9700.IxU5tLkqs_LjSdGlQx_GaA&nonce=nZdehsu67Ivv9NoymGf8FQiQlxfsCmbNdBpyDOqeSZQ&scope=openid%20profile%20email&vnd_pi_requested_resource=https%3A%2F%2Fess-awsuat.boston.gov%2F&vnd_pi_application_name=ESS+UAT+AWS+Cloud+application+"
                    target="_blank"
                  >
                    legal name change
                  </a>
                  .
                </li>
              </ul>
              <p>
                <strong>Please note: </strong>
                Any changes made to your chosen name or email address will be
                reflected across all relevant systems.
              </p>
            </div>
          </QuestionComponent>
        </div>
      </div>
    </div>
  );
};

export default WelcomeView2;
