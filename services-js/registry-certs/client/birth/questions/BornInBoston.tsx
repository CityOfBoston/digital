import React from 'react';

import FieldsetComponent from './FieldsetComponent';
import YesNoUnsureComponent from './YesNoUnsureComponent';

import { YesNoUnknownAnswer } from '../QuestionsFlow';

interface Props {
  forSelf: boolean | null;
  currentValue: YesNoUnknownAnswer;

  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
          questionValue={props.currentValue}
          handleChange={props.handleChange}
        />
      </FieldsetComponent>
    </section>
  );
}
