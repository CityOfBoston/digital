import React from 'react';

import { Question, YesNoUnknownAnswer } from '../QuestionsFlow';

import { CLEAR_LIST_STYLING, RADIOGROUP_STYLING } from './styling';

interface Props {
  questionName: Question;

  handleChange: (event) => void;
}

export default function YesNoUnsureComponent(props: Props): JSX.Element {
  function radioItem(value: YesNoUnknownAnswer, text: string): React.ReactNode {
    return (
      <li>
        <input
          type="radio"
          name={props.questionName}
          id={value}
          value={value}
          checked={props.questionName === value}
          onChange={props.handleChange}
        />
        <label htmlFor={value}>{text}</label>
      </li>
    );
  }

  return (
    <ul className={`${RADIOGROUP_STYLING} ${CLEAR_LIST_STYLING}`}>
      {radioItem('yes', 'Yes')}

      {radioItem('no', 'No')}

      {radioItem('unknown', 'I’m not sure')}
    </ul>
  );
}
