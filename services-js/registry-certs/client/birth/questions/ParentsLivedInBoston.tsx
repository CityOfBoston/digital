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
          questionValue={props.currentValue}
          handleChange={props.handleChange}
        />
      </FieldsetComponent>
    </section>
  );
}
