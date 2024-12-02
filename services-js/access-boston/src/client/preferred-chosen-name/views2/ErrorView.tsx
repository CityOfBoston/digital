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
  appTitle: string;
  // state: CommonAttributes;
}

export const ErrorView2 = (_props: ErrorProps) => {
  // const { handleQuit } = _props;

  const errorTag = () => {
    return (
      <>
        An error occurred while processing your request, go the{' '}
        <a
          target="_blank"
          href="https://www.boston.gov/departments/innovation-and-technology/access-boston-portal-help"
        >
          Access Boston Help
        </a>{' '}
        page for more information
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

            {/* <QuestionComponent>
              <a
                href="https://www.boston.gov/departments/innovation-and-technology/access-boston-portal-help"
                target="_blank"
                className={`btn`}
              >
                Help Page
              </a>
            </QuestionComponent> */}

            <QuestionComponent
              quitBtn={true}
              quitBtnText="Close"
              // handleQuit={handleQuit}
            >
              <div className="row" css={BODY_TEXT_STYLING}>
                <div className="bodyText">
                  <button
                    onClick={() =>
                      window.open(
                        'https://www.boston.gov/departments/innovation-and-technology/access-boston-portal-help',
                        '_blank'
                      )
                    }
                    className={`btn`}
                  >
                    Help Page
                  </button>
                </div>
              </div>
            </QuestionComponent>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorView2;

const BODY_TEXT_STYLING = css({
  display: 'flex',
  justifyContent: 'center',

  '.btn': {
    height: '48px',
    padding: '20px',
    paddingBottom: '30px',
  },

  // paddingTop: '10px !important',
  // '@media (max-width: 600px)': {
  //   padding: '0 20px 10px !important',
  // },
});

// const BODY_PARAGRAPH_STYLING = css({
//   '@media (max-width: 600px)': {
//     lineHeight: '1.5rem  !important',
//   },
// });
