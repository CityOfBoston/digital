import React from 'react';

import { FIELDSET_STYLING } from './styling';

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
