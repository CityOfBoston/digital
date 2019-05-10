import React from 'react';

import AnswerIcon from '../icons/AnswerIcon';
import RadioItemComponent from './RadioItemComponent';

import { Question, YesNoUnknownAnswer } from '../../types';

import { ANSWER_ITEM_STYLING, RADIOGROUP_STYLING } from '../styling';

interface Props {
  questionName: Question;
  questionValue: YesNoUnknownAnswer;

  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Utility component; presents user with three options for an answer.
 */
export default function YesNoUnsureComponent(props: Props): JSX.Element {
  function radioItem(
    itemValue: YesNoUnknownAnswer,
    itemText: string
  ): React.ReactChild {
    // map values to the icons to use
    const iconName =
      itemValue === 'yes'
        ? 'checkMark'
        : itemValue === 'no'
        ? 'xSymbol'
        : 'questionMark';

    return (
      <RadioItemComponent
        questionName={props.questionName}
        questionValue={props.questionValue}
        itemValue={itemValue}
        labelText={itemText}
        handleChange={props.handleChange}
        className={ANSWER_ITEM_STYLING}
      >
        <AnswerIcon iconName={iconName} />
      </RadioItemComponent>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby={props.questionName}
      className={RADIOGROUP_STYLING}
    >
      {radioItem('yes', 'Yes')}

      {radioItem('unknown', 'I don’t know')}

      {radioItem('no', 'No')}
    </div>
  );
}
