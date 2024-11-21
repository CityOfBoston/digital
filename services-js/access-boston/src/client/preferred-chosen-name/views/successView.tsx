/** @jsx jsx */

import { jsx, css } from '@emotion/core';
import { MouseEvent } from 'react';

import { CommonAttributes } from '../types';

//--- HTML Struct & Styling ---//
import QuestionComponent from '../components/QuestionComponent';
import AlertComponent from '../components/AlertComponent';
import RowColumns from '../components/RowColumns';
import { PREFERRED_NAME_STYLING } from '../styling/index';

interface SuccessProps {
  handleQuit: (ev: MouseEvent) => void;
  appTitle: string;
  state: CommonAttributes;
}

export default function SuccessView(props: SuccessProps) {
  const { handleQuit, state } = props;
  const alertStr = state.altWorkflow
    ? 'Your chosen name has been updated'
    : 'Your chosen name and email have been updated';
  const finalEmail =
    !state.altWorkflow &&
    state.newEmail &&
    typeof state.newEmail === 'string' &&
    state.newEmail.length > 0
      ? state.newEmail
      : state.email;

  console.log(`SuccessView (altWorkflow): `, state.altWorkflow);

  return (
    <div css={PREFERRED_NAME_STYLING}>
      <div className="BorderedAppWrapper">
        <div className="AppInnerContainer">
          <AlertComponent text={alertStr} />
          <RowColumns
            chosenName={`${state.chosenFirstName} ${state.chosenLastName}`}
            emailAddress={finalEmail}
            altWorkflow={state.altWorkflow ? state.altWorkflow : false}
          />
          <QuestionComponent
            quitBtn={true}
            quitBtnText="Log Out"
            handleQuit={handleQuit}
            useRedirectForm={true}
          >
            <div className="row" css={BODY_TEXT_STYLING}>
              <div className="bodyText">
                <p css={BODY_PARAGRAPH_STYLING}>
                  <strong>Please Note: </strong>To access the most recent
                  update, please log in to your account after logging out.
                  <p>
                    For more information, see the{' '}
                    <a href="https://www.google.com" target="_blank">
                      FAQs
                    </a>
                  </p>
                </p>
              </div>
            </div>
          </QuestionComponent>
        </div>
      </div>
    </div>
  );
}

const BODY_TEXT_STYLING = css({
  paddingTop: '10px !important',
  '@media (max-width: 600px)': {
    padding: '0 20px 10px !important',
  },
});

const BODY_PARAGRAPH_STYLING = css({
  '@media (max-width: 600px)': {
    lineHeight: '1.5rem  !important',
  },
});
