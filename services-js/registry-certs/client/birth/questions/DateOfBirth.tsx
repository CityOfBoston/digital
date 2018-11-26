import React from 'react';
import { css } from 'emotion';

import { TextInput } from '@cityofboston/react-fleet';

import FieldsetComponent from './FieldsetComponent';

interface Props {
  forSelf: boolean;
  firstName: string;
  handleTextInput: (event) => void;
  handleProceed: () => void;
  handleStepBack: () => void;
}

export default function DateOfBirth(props: Props): JSX.Element {
  const handleEnterKeypress = (event): void => {
    const key = event.key || event.keyCode;

    if (key === 'Enter' || key === 13) props.handleProceed();
  };

  return (
    <>
      <section>
        <FieldsetComponent
          handleStepBack={props.handleStepBack}
          handleProceed={props.handleProceed}
        >
          <legend>
            <h2>
              When {props.forSelf ? 'were you' : `was ${props.firstName}`} born?
            </h2>
          </legend>

          <TextInput
            label="Date of Birth"
            name="dateOfBirth"
            onChange={props.handleTextInput}
            onKeyDown={handleEnterKeypress}
            className={TEXT_FIELD_STYLING}
          />
        </FieldsetComponent>
      </section>

      <aside>
        <p>
          Are you searching for a newborn’s record? You won’t be able to request
          a newborn’s birth certificate right away. It will be ready within 3
          weeks after the parent(s) signed paperwork at the hospital.
        </p>
      </aside>
    </>
  );
}

const TEXT_FIELD_STYLING = css({
  label: {
    textAlign: 'left',
  },
});
