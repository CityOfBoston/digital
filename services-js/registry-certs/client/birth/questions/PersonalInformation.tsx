import React from 'react';

import { TextInput } from '@cityofboston/react-fleet';

import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';

import {
  NAME_FIELDS_CONTAINER_STYLING,
  QUESTION_SUPPORTING_TEXT_STYLING,
  QUESTION_TEXT_STYLING,
} from './styling';

interface Props {
  firstName?: string;
  lastName?: string;
  altSpelling?: string;
  birthDate?: string;
  forSelf: boolean | null;

  handleStepCompletion: (isStepComplete: boolean) => void;
  handleProceed: (answers: State) => void;
  handleStepBack: () => void;
}

interface State {
  firstName: string;
  lastName: string;
  altSpelling: string;
  birthDate: string;
}

export default class PersonalInformation extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      firstName: props.firstName || '',
      lastName: props.lastName || '',
      altSpelling: props.altSpelling || '',
      birthDate: props.birthDate || '',
    };

    this.props.handleStepCompletion(
      !!(
        props.firstName &&
        props.firstName.length &&
        props.lastName &&
        props.lastName.length &&
        props.birthDate &&
        props.birthDate.length
      )
    );
  }

  private handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState(
      {
        [event.target.name]: event.target.value,
      } as any,
      () => {
        this.props.handleStepCompletion(this.allowProceed());
      }
    );
  };

  // Activates the “next” button, and shows progress for this step.
  private allowProceed(): boolean {
    return !!(
      this.state.firstName.length &&
      this.state.lastName.length &&
      this.state.birthDate.length
    );
  }

  public render() {
    const { forSelf } = this.props;

    return (
      <QuestionComponent
        handleProceed={() => this.props.handleProceed(this.state)}
        handleStepBack={this.props.handleStepBack}
        allowProceed={this.allowProceed()}
      >
        <FieldsetComponent
          legendText={
            <h2 className={QUESTION_TEXT_STYLING}>
              What was {forSelf ? 'your' : 'their'} name at birth?
            </h2>
          }
        >
          <p className={QUESTION_SUPPORTING_TEXT_STYLING}>
            If {forSelf ? 'you' : 'they'} changed {forSelf ? 'your' : 'their'}{' '}
            name at some point, please use the name {forSelf ? 'you' : 'they'}{' '}
            were given at birth.<br />If {forSelf ? 'you' : 'they'} were
            adopted, use {forSelf ? 'your' : 'their'} post-adoption name.
          </p>

          <div className={NAME_FIELDS_CONTAINER_STYLING}>
            <TextInput
              label="First Name"
              name="firstName"
              defaultValue={this.state.firstName}
              onChange={this.handleChange}
            />

            <TextInput
              label="Last Name"
              name="lastName"
              defaultValue={this.state.lastName}
              onChange={this.handleChange}
            />
          </div>

          <div className="m-t700">
            {/*<h3 className={`${QUESTION_TEXT_STYLING} secondary`}>*/}
            {/*Is there an alternative spelling?*/}
            {/*</h3>*/}

            <TextInput
              // hideLabel={true}
              label="Alternative spelling"
              name="altSpelling"
              defaultValue={this.state.lastName}
              onChange={this.handleChange}
            />
          </div>
        </FieldsetComponent>

        <FieldsetComponent
          legendText={
            <h2 className={QUESTION_TEXT_STYLING}>
              When were {forSelf ? 'you' : 'they'} born?
            </h2>
          }
        >
          {/* todo */}
          <TextInput
            label="Date of Birth"
            name="birthDate"
            onChange={this.handleChange}
            value={this.state.birthDate}
          />
        </FieldsetComponent>
      </QuestionComponent>
    );
  }
}
