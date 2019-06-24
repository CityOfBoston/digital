/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ReactChild, useEffect, useState } from 'react';

import {
  FREEDOM_RED_DARK,
  MEDIA_SMALL,
  OPTIMISTIC_BLUE_DARK,
  WHITE,
} from '@cityofboston/react-fleet';

import { Person } from '../../marriage/questions/PersonOnRecord';

interface Props {
  values?: string;
  person: Person;
  width?: 'short' | 'full';
  handleChange: (string) => void;
}

/**
 * Collect one or more strings, and concatenate the result as a comma-
 * separated string for the parent handler.
 */
export default function AltSpellings(props: Props): JSX.Element {
  const [options, setOptions] = useState<Array<string>>(['']);

  const addOption = (): void => {
    const prevOptions: Array<string> = [...options];

    // Only add new spelling option if the user has provided a previous value.
    if (prevOptions[prevOptions.length - 1].length > 0) {
      prevOptions.push('');
    }

    setOptions(prevOptions);
  };

  // Remove a given spelling option.
  const removeOption = (index: number): void => {
    const newOptions: Array<string> = [...options];

    // There should always be at least one option field visible.
    if (index > 0 || options.length > 1) {
      newOptions.splice(index, 1);

      setOptions(newOptions);
    }
  };

  // Update a spelling option’s value.
  const handleInputChange = (index: number, newValue: string): void => {
    const newOptions: Array<string> = [...options];

    newOptions[index] = newValue;

    setOptions(newOptions);
  };

  // Create a comma-separated string from all options.
  function updateStringForParent(): void {
    const result = options.reduce((acc, option) => {
      if (option.length > 0) {
        return `${acc}${acc.length > 0 ? ',' : ''} ${option}`.trim();
      }

      return acc;
    }, '');

    props.handleChange(result);
  }

  // Create array of alternate spelling options from comma-separated string.
  function updateStateFromParent(): void {
    const valuesArray = props.values ? props.values.split(',') : [''];

    setOptions(valuesArray);
  }

  function spellingOptionElement(index: number): ReactChild {
    const optionNumber = index + 1;

    return (
      <li key={index} style={{ marginBottom: '1em' }}>
        <input
          type="text"
          className="txt-f"
          value={options[index]}
          onChange={event => handleInputChange(index, event.target.value)}
          onBlur={updateStringForParent}
          aria-label={`Spelling option ${optionNumber}`}
        />
        {options.length > 1 && options[index].length > 0 && (
          <button
            type="button"
            onClick={() => removeOption(index)}
            title="remove"
            aria-label={`Remove option ${optionNumber}`}
            css={BUTTON_STYLING}
          >
            <SvgIcon type="remove" />
          </button>
        )}
      </li>
    );
  }

  // Ensure string is updated each time an option is added or removed.
  useEffect(() => {
    updateStringForParent();
  }, [options.length]);

  // On mount or when person updates, if values already exist, transform
  // options into an array.
  useEffect(() => {
    updateStateFromParent();
  }, [props.person]);

  return (
    <>
      <h3 className="txt-l" id="altSpellings">
        Alternate spellings <span style={{ fontSize: '90%' }}>(if any)</span>
      </h3>

      <ul
        css={[
          ALT_SPELLINGS_STYLING,
          props.width === 'short' ? SHORT_STYLING : '',
        ]}
        aria-labelledby="altSpellings"
      >
        {options.map((_option, i) => spellingOptionElement(i))}
      </ul>

      <button
        type="button"
        onClick={addOption}
        css={BUTTON_STYLING}
        disabled={options[0].length === 0}
      >
        <SvgIcon type="add" />

        <span>Add another option</span>
      </button>
    </>
  );
}

function SvgIcon(props: { type: 'add' | 'remove' }) {
  return (
    <svg
      viewBox="0 0 10 10"
      css={props.type === 'add' ? SVG_ADD_STYLING : SVG_REMOVE_STYLING}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="5" cy="5" r="4" stroke="none" />

      <g>
        <line
          fill="none"
          strokeWidth="1"
          strokeLinecap="round"
          x1="5"
          y1="2.5"
          x2="5"
          y2="7.5"
        />

        <line
          fill="none"
          strokeWidth="1"
          strokeLinecap="round"
          x1="2.5"
          y1="5"
          x2="7.5"
          y2="5"
        />
      </g>
    </svg>
  );
}

const SVG_ADD_STYLING = css({
  circle: {
    fill: 'currentColor',
  },

  line: {
    stroke: WHITE,
  },
});

const SVG_REMOVE_STYLING = css({
  g: {
    transform: 'rotate(45deg)',
    transformOrigin: '50% 50%',
  },

  circle: {
    fill: 'none',
  },

  line: {
    stroke: FREEDOM_RED_DARK,
  },
});

const ALT_SPELLINGS_STYLING = css({
  paddingLeft: 0,
  marginTop: 0,
  listStyle: 'none',

  li: {
    position: 'relative',
  },

  svg: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translate(0, -50%)',
  },
});

const BUTTON_STYLING = css({
  border: 'none',
  backgroundColor: 'transparent',
  padding: 0,
  fontFamily: 'inherit',
  fontSize: 'inherit',
  color: OPTIMISTIC_BLUE_DARK,
  cursor: 'pointer',

  display: 'flex',
  alignItems: 'center',

  svg: {
    height: '1.5em',
    width: '1.5em',
    marginRight: '0.5em',
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'default',
  },
});

const SHORT_STYLING = css({
  [MEDIA_SMALL]: {
    width: '50%',
  },
});
