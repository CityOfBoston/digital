import React from 'react';

import { RADIOITEM_SHARED_STYLING } from './styling';

interface Props {
  questionName: string;
  questionValue: string | undefined;
  itemValue: string;
  labelText: string;
  className?: string;

  children: React.ReactChild;

  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Radio item that is comprised of an icon, and a large text label.
 *
 * Expects a SVG child element.
 *
 * questionName: Name of the question this item is an answer for (all
 * items in a question group will share this prop value)
 *
 * questionValue: Currently-selected value for the question
 *
 * itemValue: The value that will be assigned to the question, if
 * this item is selected
 *
 * labelText: Text that will be displayed to the user
 *
 * If this item is currently selected, other items in the group will be
 * faded out (but still selectable).
 */
export default function RadioItemComponent(props: Props): JSX.Element {
  const { itemValue, questionValue } = props;
  const hasAnswered = !!(questionValue && questionValue.length);

  return (
    <label
      className={`${RADIOITEM_SHARED_STYLING} ${props.className} ${
        hasAnswered && itemValue === questionValue ? 'selected' : ''
      } ${hasAnswered && itemValue !== questionValue ? 'inactive' : ''}`}
    >
      {props.children}

      <input
        type="radio"
        name={props.questionName}
        value={itemValue}
        checked={hasAnswered && itemValue === questionValue}
        onChange={props.handleChange}
      />

      <span>{props.labelText}</span>
    </label>
  );
}
