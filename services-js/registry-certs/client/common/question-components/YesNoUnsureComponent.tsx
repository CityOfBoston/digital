/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ChangeEvent, ReactChild } from 'react';

import RadioItemComponent from './RadioItemComponent';
import AnswerIcon from './AnswerIcon';

import { Question, YesNoUnknownAnswer } from '../../types';

import { RADIOGROUP_STYLING } from './styling';
import { MEDIA_SMALL } from '@cityofboston/react-fleet';

interface Props {
  questionName: Question;
  questionValue: YesNoUnknownAnswer;

  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Utility component; presents user with three options for an answer.
 */
export default function YesNoUnsureComponent(props: Props): JSX.Element {
  function radioItem(
    itemValue: YesNoUnknownAnswer,
    itemText: string
  ): ReactChild {
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
      >
        <AnswerIcon iconName={iconName} />
      </RadioItemComponent>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby={props.questionName}
      css={[RADIOGROUP_STYLING, RADIOITEM_STYLING]}
    >
      {radioItem('yes', 'Yes')}

      {radioItem('unknown', 'I don’t know')}

      {radioItem('no', 'No')}
    </div>
  );
}

const RADIOITEM_STYLING = css({
  label: {
    [MEDIA_SMALL]: {
      paddingLeft: '1rem',
      paddingRight: '1rem',
    },
  },
});
