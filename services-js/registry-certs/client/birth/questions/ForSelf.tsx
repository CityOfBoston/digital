import React from 'react';

import FieldsetComponent from './FieldsetComponent';

import { RADIOGROUP_STYLING } from './styling';

interface Props {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ForSelf(props: Props): JSX.Element {
  return (
    <section>
      <FieldsetComponent>
        <legend>
          <h2>Who is this for?</h2>
        </legend>

        <div className={RADIOGROUP_STYLING}>
          <div>
            <input
              type="radio"
              name="forSelf"
              id="forSelf-1"
              value="true"
              onChange={props.handleChange}
            />
            <label htmlFor="forSelf-1">Myself</label>
          </div>

          <div>
            <input
              type="radio"
              name="forSelf"
              id="forSelf-2"
              value="false"
              onChange={props.handleChange}
            />
            <label htmlFor="forSelf-2">Someone else</label>
          </div>
        </div>
      </FieldsetComponent>
    </section>
  );
}
