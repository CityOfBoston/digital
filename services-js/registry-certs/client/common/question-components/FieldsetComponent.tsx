/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ReactNode } from 'react';

import {
  CHARLES_BLUE,
  SANS,
  SERIF,
  DEFAULT_TEXT,
} from '@cityofboston/react-fleet';

interface Props {
  legendText: ReactNode;
  children: ReactNode;
  className?: string;
  description?: string | null;
}

/**
 * Container component to provide layout for a single fieldset.
 * Some questions will contain multiple fieldsets.
 */
export default function FieldsetComponent(props: Props): JSX.Element {
  const { legendText, className, description } = props;
  console.log('desc: ', description);
  return (
    <fieldset className={className || ''} css={FIELDSET_STYLING}>
      <legend>{legendText}</legend>

      {description && description.length > 0 && (
        <div className="desc">{description}</div>
      )}

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

  '.desc': {
    margin: '0.5rem 0 0.75rem',
    fontFamily: SERIF,
    fontSize: '0.9375em',
    fontWeight: 100,
    color: DEFAULT_TEXT,
    lineHeight: '1.2em',
  },
});
