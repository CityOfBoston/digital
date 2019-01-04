import React from 'react';

import { TextInput } from '@cityofboston/react-fleet';

import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';

import { YesNoUnknownAnswer } from '../../types';

import { NAME_FIELDS_CONTAINER_STYLING } from './styling';

interface Props {
  forSelf: boolean | null;
  parentsMarried: YesNoUnknownAnswer;
  firstName: string;

  parent1FirstName?: string;
  parent1LastName?: string;
  parent2FirstName?: string;
  parent2LastName?: string;

  handleProceed: (answers: State) => void;
  handleStepBack: () => void;
}

interface State {
  parent1FirstName: string;
  parent1LastName: string;
  parent2FirstName: string;
  parent2LastName: string;
}

/**
 * Parent 1’s first name is the only required field in this set.
 */
export default class ParentsNames extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      parent1FirstName: props.parent1FirstName || '',
      parent1LastName: props.parent1LastName || '',
      parent2FirstName: props.parent2FirstName || '',
      parent2LastName: props.parent2LastName || '',
    };
  }

  private handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      [event.target.name]: event.target.value,
    } as any);
  };

  public render() {
    const { forSelf, firstName } = this.props;

    return (
      <>
        <QuestionComponent
          handleProceed={() => this.props.handleProceed(this.state)}
          handleStepBack={this.props.handleStepBack}
          allowProceed={this.state.parent1FirstName.length > 0}
          nextButtonText="Review request"
        >
          <FieldsetComponent
            legendText={
              <h2>
                What were the names of {forSelf ? 'your' : `${firstName}’s`}{' '}
                parents at the time of {forSelf ? 'your' : 'their'} birth?
              </h2>
            }
          >
            <figure className="m-t400">
              <figcaption>
                Parent 1 <em>(for example: Mother)</em>
              </figcaption>

              <div className={NAME_FIELDS_CONTAINER_STYLING}>
                <TextInput
                  label="First Name"
                  name="parent1FirstName"
                  defaultValue={this.state.parent1FirstName}
                  onChange={this.handleChange}
                />

                <TextInput
                  label="Last Name"
                  name="parent1LastName"
                  defaultValue={this.state.parent1LastName}
                  onChange={this.handleChange}
                />
              </div>
            </figure>

            <figure className="m-t400">
              <figcaption>
                Parent 2 <em>(for example: Father)</em>
              </figcaption>

              <div className={NAME_FIELDS_CONTAINER_STYLING}>
                <TextInput
                  label="First Name"
                  name="parent2FirstName"
                  defaultValue={this.state.parent2FirstName}
                  onChange={this.handleChange}
                />

                <TextInput
                  label="Last Name"
                  name="parent2LastName"
                  defaultValue={this.state.parent2LastName}
                  onChange={this.handleChange}
                />
              </div>
            </figure>
          </FieldsetComponent>
        </QuestionComponent>

        <aside className="m-t500">
          <p>
            Please use the names {forSelf ? 'your' : 'their'} parents were given
            at the time of their birth. If only one parent is listed on{' '}
            {forSelf ? 'your' : 'the'} record, you only need to include that
            name.
          </p>
        </aside>
      </>
    );
  }
}
