/** @jsx jsx */

import { jsx } from '@emotion/core';
import { MouseEvent } from 'react';

//--- HTML Struct & Styling ---//
import QuestionComponent from '../components/QuestionComponent';
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
      <h2>Chosen Name</h2>

      <div className="BorderedAppWrapper">
        <div className={`AppInnerContainer`}>
          <QuestionComponent
            quitBtn={true}
            quitBtnText={`Done`}
            handleQuit={handleQuit}
          >
            <div className={`row`}>
              <div className={`bodyText`}>
                <p>
                  Changes to your name will be reflected across your City of
                  Boston accounts.Lorem ipsum dolor sit amet. Qui adipisci
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
