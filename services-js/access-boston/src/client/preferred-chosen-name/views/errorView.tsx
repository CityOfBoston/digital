/** @jsx jsx */

import { jsx, css } from '@emotion/core';
import { MouseEvent } from 'react';

//--- HTML Struct & Styling ---//
import QuestionComponent from '../components/QuestionComponent';
import AlertComponent from '../components/AlertComponent';
import { PREFERRED_NAME_STYLING } from '../styling/index';

interface ErrorProps {
  handleQuit: (ev: MouseEvent) => void;
  appTitle: string;
}

export const ErrorView = (_props: ErrorProps) => {
  const errorTag = () => {
    return (
      <>
        An error occurred while processing your request, Please submit a ticket
        with the DoIT Service Desk -{' '}
        <a href="mailto:doitservicedesk@boston.gov">
          doitservicedesk@boston.gov
        </a>
      </>
    );
  };

  return (
    <div css={PREFERRED_NAME_STYLING}>
      <div className={'AddBorderTop'}>
        <div className="BorderedAppWrapper">
          <div className="AppInnerContainer">
            <AlertComponent
              type={`Error`}
              text="Something Went Wrong"
              altText={errorTag()}
            />

            <QuestionComponent quitBtn={true} quitBtnText="Close">
              <div className="row" css={BODY_TEXT_STYLING}>
                <div className="bodyText">
                  <a className={`btn`} href="mailto:doitservicedesk@boston.gov">
                    Email DoIT Service Desk
                  </a>
                </div>
              </div>
            </QuestionComponent>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorView;

const BODY_TEXT_STYLING = css({
  display: 'flex',
  justifyContent: 'center',

  '.btn': {
    height: '48px',
    padding: '20px',
    paddingBottom: '32px',
  },
});
