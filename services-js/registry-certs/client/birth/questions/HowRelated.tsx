import React from 'react';
import { css } from 'emotion';

import { CHARLES_BLUE } from '@cityofboston/react-fleet';

import FieldsetComponent from './FieldsetComponent';

import { Relation } from '../QuestionsFlow';

import { RADIOGROUP_UNBORDERED_STYLING } from './styling';

interface Props {
  howRelated: Relation;

  handleChange: (event) => void;
  handleStepBack: () => void;
}

export default function HowRelated(props: Props): JSX.Element {
  function question(
    questionValue: Relation,
    questionDisplayText: string
  ): React.ReactNode {
    return (
      <div>
        <input
          type="radio"
          name="relation"
          id={questionValue}
          value={questionValue}
          checked={questionValue === props.howRelated}
          onChange={props.handleChange}
        />
        <label htmlFor={questionValue}>{questionDisplayText}</label>
      </div>
    );
  }

  return (
    <section>
      <FieldsetComponent handleStepBack={props.handleStepBack}>
        <legend>
          <h2>How are you related?</h2>
        </legend>

        <div
          className={`${RADIOGROUP_UNBORDERED_STYLING} ${CONTAINER_STYLING}`}
        >
          {question('parent', 'Parent')}

          {question('grandparent', 'Grandparent')}

          {question('sibling', 'Sibling')}

          {question('spouse', 'Spouse')}

          {question('friend', 'Friend')}

          {question('attorney', 'Attorney')}

          {question('guardian', 'Guardian')}

          {question('other', 'Other')}
        </div>
      </FieldsetComponent>
    </section>
  );
}

const CONTAINER_STYLING = css({
  border: `1px solid ${CHARLES_BLUE}`,
  flexWrap: 'wrap',
  '> div': {
    border: 'inherit',
    flex: '1 0 25%',
  },
});
