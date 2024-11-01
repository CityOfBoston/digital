/** @jsx jsx */

import { jsx } from '@emotion/core';
import { MouseEvent } from 'react';

//--- HTML Struct & Styling ---//
// import TextInput from '../../common/TextInput';
import QuestionComponent from '../components/QuestionComponent';
import { PREFERRED_NAME_STYLING } from '../styling/index';

interface account {
  cobAgency: string;
  firstName: string;
  lastName: string;
  email: string;
}

// interface DefaultProps {
//   handleProceed: any;
//   handleStepBack: any;
//   resetState: () => void;
//   appTitle: string;
//   handleQuit: any;
//   account: account;
// }

interface WelcomeProps {
  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
  appTitle: string;
  account: account;
}

export default function WelcomeView(props: WelcomeProps) {
  const { handleProceed, handleStepBack, account } = props;

  const handle_proceed = (evt: MouseEvent<Element, globalThis.MouseEvent>) => {
    return handleProceed(evt);
  };

  const handle_stepBack = (evt: MouseEvent<Element, globalThis.MouseEvent>) => {
    return handleStepBack(evt);
  };

  console.log(`DefaultView: account: `, account);

  return (
    <div css={PREFERRED_NAME_STYLING}>
      <h2>Chosen Name</h2>

      <div className="BorderedAppWrapper">
        <div className={`AppInnerContainer`}>
          <div className="headerBlock">
            <h3>Chosen Name</h3>
          </div>

          <QuestionComponent
            allowProceed={true}
            handleProceed={handle_proceed}
            handleStepBack={handle_stepBack}
            nextButtonText={'Continue'}
            quitBtn={true}
          >
            <div className={`row`}>
              <div className={`bodyText`}>
                <p>
                  Lorem ipsum dolor sit amet. Qui adipisci voluptatem quo fugit
                  nesciunt qui galisum quam est numquam tenetur vel cumque
                  repellendus. Sed voluptatum voluptas aut accusantium
                  asperiores 33 ipsum eveniet qui possimus possimus qui quaerat
                  ratione. <a href="#">Link</a>
                </p>

                <p>
                  Lorem ipsum dolor sit amet. Qui adipisci voluptatem quo fugit
                  nesciunt qui galisum quam est numquam tenetur vel cumque
                  repellendus. <a href="#">Link</a>
                </p>
              </div>
            </div>
          </QuestionComponent>
        </div>
      </div>
    </div>
  );
}
