import React from 'react';

import { css } from 'emotion';

import { CHARLES_BLUE, SANS } from '@cityofboston/react-fleet';

interface Props {
  legendText: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Container component to provide layout for a single fieldset.
 * Some questions will contain multiple fieldsets.
 */
export default function FieldsetComponent(props: Props): JSX.Element {
  return (
    <fieldset className={`${FIELDSET_STYLING} ${props.className || ''}`}>
      <legend>{props.legendText}</legend>

      {props.children}
    </fieldset>
  );
}

export const FIELDSET_STYLING = css({
  margin: 0,
  padding: 0,
  border: 'none',

  legend: {
    paddingLeft: 0,
    paddingRight: 0,
    width: '100%',
  },

  h2: {
    marginBottom: 0,
    fontFamily: SANS,
    fontWeight: 700,
    color: CHARLES_BLUE,
  },
});
