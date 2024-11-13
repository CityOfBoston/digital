/** @jsx jsx */

import { jsx, css } from '@emotion/core';
import { MouseEvent } from 'react';

//--- HTML Struct & Styling ---//
import QuestionComponent from '../components/QuestionComponent';
import AlertComponent from '../components/AlertComponent';
import RowColumns from '../components/RowColumns';
import { PREFERRED_NAME_STYLING } from '../styling/index';

interface Account {
  cobAgency: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface SuccessProps {
  handleQuit: (ev: MouseEvent) => void;
  appTitle: string;
  account: Account;
}

export default function SuccessView(props: SuccessProps) {
  const { handleQuit, account } = props;

  return (
    <div css={PREFERRED_NAME_STYLING}>
      <div className="BorderedAppWrapper">
        <div className="AppInnerContainer">
          <AlertComponent text="Your chosen name and email have been updated" />
          <RowColumns
            chosenName={`${account.firstName} ${account.lastName}`}
            emailAddress={"sadkasdjakldjasklddsdadasdasdsjdlaskjd@boston.gov"}
          />
          <QuestionComponent
            quitBtn={true}
            quitBtnText="Log Out"
            handleQuit={handleQuit}>
            <div className="row" css={BODY_TEXT_STYLING}>
              <div className="bodyText">
                <p css={BODY_PARAGRAPH_STYLING}>
                  <strong>Please Note: </strong>To access the most recent update, please log in to your account after logging out.
                  <p>For more information, see the <a href='https://www.google.com' target="_blank">FAQs</a></p>
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
    padding: '0 20px 10px !important'
  },
});

const BODY_PARAGRAPH_STYLING = css({
  '@media (max-width: 600px)': {
    lineHeight: '1.5rem  !important'
  },
})