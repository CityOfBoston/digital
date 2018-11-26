import React from 'react';

import FieldsetComponent from './FieldsetComponent';
import YesNoUnsureComponent from './YesNoUnsureComponent';

interface Props {
  forSelf: boolean;
  handleChange: (event) => void;
  handleStepBack: () => void;
}

export default function BornInBoston(props: Props): JSX.Element {
  return (
    <section>
      <FieldsetComponent handleStepBack={props.handleStepBack}>
        <legend>
          <h2>
            Were {props.forSelf ? 'you' : 'they'} born in the City of Boston?
          </h2>
        </legend>

        <YesNoUnsureComponent
          questionName="bornInBoston"
          handleChange={props.handleChange}
        />
      </FieldsetComponent>
    </section>
  );
}
