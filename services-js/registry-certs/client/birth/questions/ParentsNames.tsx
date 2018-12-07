import React from 'react';

import { TextInput } from '@cityofboston/react-fleet';

import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';
import { YesNoUnknownAnswer } from '../QuestionsFlow';

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

  private legendText(): React.ReactNode {
    const { forSelf, firstName } = this.props;
    if (this.props.parentsMarried === 'yes') {
      return (
        <h2>What are {forSelf ? 'your' : `${firstName}’s`} parents’ names?</h2>
      );
    } else {
      return (
        <h2>
          What’s the name of the parent who gave birth to{' '}
          {forSelf ? 'you' : firstName}?
        </h2>
      );
    }
  }

  public render() {
    return (
      <QuestionComponent
        handleProceed={() => this.props.handleProceed(this.state)}
        handleStepBack={this.props.handleStepBack}
        allowProceed={this.state.parent1FirstName.length > 0}
      >
        <FieldsetComponent legendText={this.legendText()}>
          <figure>
            <figcaption>Parent 1</figcaption>

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

          {this.props.parentsMarried === 'yes' && (
            <figure>
              <figcaption>Parent 2</figcaption>

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
          )}
        </FieldsetComponent>
      </QuestionComponent>
    );
  }
}
