import React from 'react';
import { css } from 'emotion';

import {
  CHARLES_BLUE,
  GRAY_300,
  OPTIMISTIC_BLUE,
  SANS,
} from '@cityofboston/react-fleet';

interface Props {
  handleProceed?: () => void;
  handleStepBack?: () => void;
  children: React.ReactNode;
}

/**
 * Container component to provide layout for a single question screen,
 * as well as “back” and “next question” buttons if their related handlers
 * are passed in as props to this component.
 */
export default function FieldsetComponent(props: Props): JSX.Element {
  return (
    <fieldset className={FIELDSET_STYLING}>
      {props.children}

      <div className={BUTTONS_CONTAINER_STYLING}>
        {props.handleStepBack && (
          <button
            type="button"
            onClick={props.handleStepBack}
            className={`btn ${BACK_BUTTON_STYLING}`}
          >
            Back
          </button>
        )}

        {props.handleProceed && (
          <button type="button" onClick={props.handleProceed} className="btn">
            Next question
          </button>
        )}
      </div>
    </fieldset>
  );
}

export const FIELDSET_STYLING = css({
  marginTop: '5rem',
  textAlign: 'center',
  border: `1px solid ${GRAY_300}`,
  padding: '3rem 2rem 2rem',
  legend: {
    paddingLeft: '1rem',
    paddingRight: '1rem',
  },
  h2: {
    fontFamily: SANS,
    fontWeight: 700,
    color: CHARLES_BLUE,
  },
  figure: {
    margin: 0,
  },
});

const BUTTONS_CONTAINER_STYLING = css({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '3rem',
  'button:last-of-type': {
    marginLeft: '2rem',
  },
});

const BACK_BUTTON_STYLING = css({
  backgroundColor: '#fff',
  color: OPTIMISTIC_BLUE,
  border: '3px solid currentColor',
  '&:hover': {
    borderColor: CHARLES_BLUE,
  },
});
