import React from 'react';

import { TextInput } from '@cityofboston/react-fleet';

import FieldsetComponent from './FieldsetComponent';

import { NAME_FIELDS_CONTAINER_STYLING } from './styling';

interface Props {
  handleTextInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleProceed: () => void;
  handleStepBack: () => void;
}

export default function NameOnRecord(props: Props): JSX.Element {
  const handleEnterKeypress = (event): void => {
    const key = event.key || event.keyCode;

    if (key === 'Enter' || key === 13) {
      props.handleProceed();
    }
  };

  return (
    <>
      <section>
        <FieldsetComponent
          handleStepBack={props.handleStepBack}
          handleProceed={props.handleProceed}
        >
          <legend>
            <h2>What is the name on the birth record?</h2>
          </legend>

          <div className={NAME_FIELDS_CONTAINER_STYLING}>
            <TextInput
              label="First Name"
              name="firstName"
              onChange={props.handleTextInput}
            />

            <TextInput
              label="Last Name"
              name="lastName"
              onChange={props.handleTextInput}
              onKeyDown={handleEnterKeypress}
            />
          </div>
        </FieldsetComponent>
      </section>

      <aside>
        <p>
          {/* todo: wording irt asking for name given at birth */}
          Please use the name you were given at birth. If you were adopted,
          please use your post-adoption name.
        </p>

        <p>
          Is there an alternative spelling of the name? Was the first name
          missing from the original birth record? Was there more than one last
          name on the record? Did they enter their married name instead of their
          birth name? Have they had a legal name change? Some birth records were
          registered more than a year after the birth so Registry staff has to
          search our books for the record.
        </p>
      </aside>
    </>
  );
}
