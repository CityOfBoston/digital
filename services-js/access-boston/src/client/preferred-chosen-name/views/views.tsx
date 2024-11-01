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
  appTitle: string;
  account: account;
}

export default function WelcomeView(props: WelcomeProps) {
  const { handleProceed, account } = props;

  const handle_proceed = (evt: MouseEvent<Element, globalThis.MouseEvent>) => {
    return handleProceed(evt);
  };

  console.log(`WelcomeView/DefaultView: account: `, account);

  return (
    <div css={PREFERRED_NAME_STYLING}>
      <div className="BorderedAppWrapper">
        <div className={`AppInnerContainer`}>
          <div className="headerBlock">
            <h3>Chosen Name</h3>
          </div>

          <QuestionComponent
            allowProceed={true}
            handleProceed={handle_proceed}
            nextButtonText={'Continue'}
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

interface EnterNameProps {
  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
  appTitle: string;
  account: account;
}

export function EnterNameView(props: EnterNameProps) {
  const { handleProceed, handleStepBack, account } = props;

  const handle_proceed = (evt: MouseEvent<Element, globalThis.MouseEvent>) => {
    return handleProceed(evt);
  };

  const handle_stepBack = (evt: MouseEvent<Element, globalThis.MouseEvent>) => {
    return handleStepBack(evt);
  };

  console.log(`EnterNameView: account: `, account);

  return (
    <div css={PREFERRED_NAME_STYLING}>
      <h2>Chosen Name</h2>

      <div className="BorderedAppWrapper">
        <div className={`AppInnerContainer`}>
          <QuestionComponent
            allowProceed={true}
            handleProceed={handle_proceed}
            handleStepBack={handle_stepBack}
            prevBtnText={`Clear`}
            nextButtonText={'Continue'}
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

interface ApprovalProps {
  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
  appTitle: string;
  account: account;
}

export function ApprovalView(props: ApprovalProps) {
  const { handleProceed, handleStepBack, account } = props;

  const handle_proceed = (evt: MouseEvent<Element, globalThis.MouseEvent>) => {
    return handleProceed(evt);
  };

  const handle_stepBack = (evt: MouseEvent<Element, globalThis.MouseEvent>) => {
    return handleStepBack(evt);
  };

  console.log(`ApprovalView: account: `, account);

  return (
    <div css={PREFERRED_NAME_STYLING}>
      <h2>Chosen Name</h2>

      <div className="BorderedAppWrapper">
        <div className={`AppInnerContainer`}>
          <QuestionComponent
            allowProceed={true}
            handleProceed={handle_proceed}
            handleStepBack={handle_stepBack}
            prevBtnText={`Go Back`}
            nextButtonText={'Continue'}
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
