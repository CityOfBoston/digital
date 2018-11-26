import React from 'react';

import FieldsetComponent from './FieldsetComponent';
import YesNoUnsureComponent from './YesNoUnsureComponent';

interface Props {
  forSelf: boolean;
  handleChange: (event) => void;
  handleStepBack: () => void;
}

export default function ParentsLivedInBoston(props: Props): JSX.Element {
  return (
    <section>
      <FieldsetComponent handleStepBack={props.handleStepBack}>
        <legend>
          <h2>
            Did {props.forSelf ? 'your' : 'their'} parents live in Boston when{' '}
            {props.forSelf ? 'you' : 'they'} were born?
          </h2>
        </legend>

        <YesNoUnsureComponent
          questionName="parentsLivedInBoston"
          handleChange={props.handleChange}
        />
      </FieldsetComponent>
    </section>
  );
}
