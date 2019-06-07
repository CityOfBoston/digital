/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ChangeEvent, ReactChild } from 'react';

import {
  CHARLES_BLUE,
  GRAY_100,
  MEDIA_MEDIUM,
  MEDIA_MEDIUM_MAX,
  SANS,
  VISUALLY_HIDDEN,
} from '@cityofboston/react-fleet';

import { FOCUS_STYLE, THICK_BORDER_STYLE } from './styling';

interface Props {
  questionName: string;
  questionValue: string | undefined;
  itemValue: string;
  labelText: string;

  children: ReactChild;

  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
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
      className={`${
        hasAnswered && itemValue === questionValue ? 'selected' : ''
      } ${hasAnswered && itemValue !== questionValue ? 'inactive' : ''}`}
      css={RADIOITEM_STYLING}
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

const RADIOITEM_STYLING = css({
  display: 'flex',
  alignItems: 'center',

  cursor: 'pointer',

  marginBottom: '2rem',

  color: CHARLES_BLUE,

  [MEDIA_MEDIUM]: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },

  transition: 'opacity 0.2s',

  input: VISUALLY_HIDDEN,

  'input:focus + span': {
    ...FOCUS_STYLE,
  },

  svg: {
    flexBasis: '20%',

    [MEDIA_MEDIUM_MAX]: {
      // height: 100% prevents extra vertical space on mobile, but *causes*
      // extra on larger viewports
      height: '100%',
    },

    [MEDIA_MEDIUM]: {
      flexBasis: 'auto',
    },
  },

  span: {
    marginLeft: '1rem',
    padding: '0.8rem 1.5rem',
    fontFamily: SANS,
    fontWeight: 700,
    textTransform: 'uppercase',
    border: THICK_BORDER_STYLE,

    [MEDIA_MEDIUM]: {
      marginTop: '1.75rem',
      marginLeft: 0,
      flexGrow: 0,
      whiteSpace: 'nowrap',
    },
  },

  '&.selected': {
    span: {
      backgroundColor: GRAY_100,
    },
  },

  '&.inactive': {
    opacity: 0.25,
  },
});
