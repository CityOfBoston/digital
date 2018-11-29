import React from 'react';

import { TextInput } from '@cityofboston/react-fleet';

import FieldsetComponent from './FieldsetComponent';
import { YesNoUnknownAnswer } from '../QuestionsFlow';

import { NAME_FIELDS_CONTAINER_STYLING } from './styling';

interface Props {
  forSelf: boolean | null;
  parentsMarried: YesNoUnknownAnswer;
  firstName: string;

  handleTextInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleProceed: () => void;
  handleStepBack: () => void;
}

export default function ParentsNames(props: Props): JSX.Element {
  const parentsWereMarried: boolean = props.parentsMarried === 'yes';

  return (
    <section>
      <FieldsetComponent
        handleProceed={props.handleProceed}
        handleStepBack={props.handleStepBack}
      >
        {parentsWereMarried ? (
          <legend>
            <h2>
              What are {props.forSelf ? 'your' : `${props.firstName}’s`}{' '}
              parents’ names?
            </h2>
          </legend>
        ) : (
          <legend>
            <h2>
              What’s the name of the parent who gave birth to{' '}
              {props.forSelf ? 'you' : props.firstName}?
            </h2>
          </legend>
        )}

        <figure>
          <figcaption>Parent 1</figcaption>

          <div className={NAME_FIELDS_CONTAINER_STYLING}>
            <TextInput
              label="First Name"
              name="parent1FirstName"
              onChange={props.handleTextInput}
            />

            <TextInput
              label="Last Name"
              name="parent1LastName"
              onChange={props.handleTextInput}
            />
          </div>
        </figure>

        {parentsWereMarried && (
          <figure>
            <figcaption>Parent 2</figcaption>

            <div className={NAME_FIELDS_CONTAINER_STYLING}>
              <TextInput
                label="First Name"
                name="parent2FirstName"
                onChange={props.handleTextInput}
              />

              <TextInput
                label="Last Name"
                name="parent2LastName"
                onChange={props.handleTextInput}
              />
            </div>
          </figure>
        )}
      </FieldsetComponent>
    </section>
  );
}
