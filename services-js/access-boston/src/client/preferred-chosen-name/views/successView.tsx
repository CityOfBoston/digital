/** @jsx jsx */

import { jsx, css } from '@emotion/core';
import { MouseEvent } from 'react';

//--- HTML Struct & Styling ---//
import QuestionComponent from '../components/QuestionComponent';
import AlertComponent from '../components/AlertComponent';
import IndexComponent from '../components/IndexComponent';
import { PREFERRED_NAME_STYLING } from '../styling/index';

interface account {
  cobAgency: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface SuccessProps {
  handleQuit: (ev: MouseEvent) => void;
  appTitle: string;
  account: account;
}

export default function SuccessView(props: SuccessProps) {
  const { handleQuit, account } = props;

  console.log(`SuccessView: account: `, account);

  return (
    <div css={PREFERRED_NAME_STYLING}>
      <AlertComponent text={'Your chosen name and email have been updated'} />
      <div css={GAP_STYLING} />

      <div className="BorderedAppWrapper">
        <div className="AppInnerContainer">
          <IndexComponent
            data={{
              'Chosen Name': 'Camila Donovan',
              'Email Address': 'Juliana.donovangudelo@boston.gov',
            }}
          />
          <QuestionComponent
            quitBtn={true}
            quitBtnText={`Done`}
            handleQuit={handleQuit}
          >
            <div className="row" css={BODY_TEXT_STYLING}>
              <div className="bodyText">
                <p>
                  Changes to your name will be reflected across your City of
                  Boston accounts. Lorem ipsum dolor sit amet. Qui adipisci
                  voluptatem quo fugit
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
  paddingTop: '10px !important'
})

const GAP_STYLING = css({
  marginBottom: '24px',
});
