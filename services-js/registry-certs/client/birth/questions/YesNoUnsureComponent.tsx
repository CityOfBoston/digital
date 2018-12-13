import React from 'react';

import { Question, YesNoUnknownAnswer } from '../types';

import { CLEAR_LIST_STYLING, RADIOGROUP_STYLING } from './styling';

interface Props {
  questionName: Question;
  questionValue: YesNoUnknownAnswer;

  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function YesNoUnsureComponent(props: Props): JSX.Element {
  function radioItem(value: YesNoUnknownAnswer, text: string): React.ReactNode {
    return (
      <li>
        <input
          type="radio"
          name={props.questionName}
          id={props.questionName + value}
          value={value}
          checked={props.questionValue === value}
          onChange={props.handleChange}
        />
        <label htmlFor={props.questionName + value}>{text}</label>
      </li>
    );
  }

  return (
    <ul
      role="radiogroup"
      aria-labelledby={props.questionName}
      className={`${RADIOGROUP_STYLING} ${CLEAR_LIST_STYLING}`}
    >
      {radioItem('yes', 'Yes')}

      {radioItem('no', 'No')}

      {radioItem('unknown', 'Don’t know')}
    </ul>
  );
}
