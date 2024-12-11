/** @jsx jsx */

import { jsx, css } from '@emotion/core';
import { MouseEvent } from 'react';

// import { CommonAttributes } from '../types';

//--- HTML Struct & Styling ---//
import QuestionComponent from '../components/QuestionComponent';
import AlertComponent from '../components/AlertComponent';
import { PREFERRED_NAME_STYLING } from '../styling/index';

interface ErrorProps {
  handleQuit: (ev: MouseEvent) => void;
}

export default function ErrorView(props: ErrorProps) {
  const { handleQuit } = props;

  return (
    <div css={PREFERRED_NAME_STYLING}>
      <div className="BorderedAppWrapper">
        <div className="AppInnerContainer">
          <AlertComponent type={`Error`} text="Error Status" />
          <QuestionComponent
            quitBtn={true}
            quitBtnText="Close"
            handleQuit={handleQuit}
          >
            <div className="row" css={BODY_TEXT_STYLING}>
              <div className="bodyText">
                <p css={BODY_PARAGRAPH_STYLING}>
                  There was an error with this request, please try again later.
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
