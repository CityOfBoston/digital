import React from 'react';
import { css } from 'emotion';

import {
  CHARLES_BLUE,
  GRAY_300,
  MEDIA_SMALL,
  SANS,
} from '@cityofboston/react-fleet';

interface Props {
  legendText: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Container component to provide layout for a single fieldset.
 * Some questions will contain multiple fieldsets.
 */
export default function FieldsetComponent(props: Props): JSX.Element {
  return (
    <fieldset className={FIELDSET_STYLING}>
      <legend>{props.legendText}</legend>

      {props.children}
    </fieldset>
  );
}

export const FIELDSET_STYLING = css({
  marginTop: '2rem',
  textAlign: 'center',
  border: 'none',
  padding: '1rem 0 0',
  [MEDIA_SMALL]: {
    marginTop: '5rem',
    padding: '3rem 2rem 2rem',
    border: `1px solid ${GRAY_300}`,
  },
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
