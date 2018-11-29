import React from 'react';

import FieldsetComponent from './FieldsetComponent';
import YesNoUnsureComponent from './YesNoUnsureComponent';

interface Props {
  forSelf: boolean | null;
  firstName: string;

  handleChange: (event) => void;
  handleStepBack: () => void;
}

export default function ParentsMarried(props: Props): JSX.Element {
  return (
    <>
      <section>
        <FieldsetComponent handleStepBack={props.handleStepBack}>
          <legend>
            <h2>
              Were {props.forSelf ? 'your' : `${props.firstName}’s`} parents
              married at the time of {props.forSelf ? 'your' : 'their'} birth?
            </h2>
          </legend>

          <YesNoUnsureComponent
            questionName="parentsMarried"
            handleChange={props.handleChange}
          />
        </FieldsetComponent>
      </section>

      <aside>
        <p>
          If {props.forSelf ? 'your' : 'the'} parents weren’t married at the
          time {props.forSelf ? 'you were' : 'the baby was'} born, the birth
          certificate becomes <strong>restricted</strong>. Restricted records
          can only be requested by the person whose birth certificate this is,
          or their attorney, parent, guardian, or conservator, proper judicial
          order, or a person whose official duties, in the opinion of the city
          clerk or the commissioner of public health, as the case may be,
          entitle them to the information contained therein.
        </p>
      </aside>
    </>
  );
}
