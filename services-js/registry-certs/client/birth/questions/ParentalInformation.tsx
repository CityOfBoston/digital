import React from 'react';

import { TextInput } from '@cityofboston/react-fleet';

import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';
import YesNoUnsureComponent from './YesNoUnsureComponent';

import { YesNoUnknownAnswer } from '../../types';

import {
  NAME_FIELDS_CONTAINER_STYLING,
  PARENT_FIELDSET_STYLING,
  QUESTION_SUPPORTING_TEXT_STYLING,
  QUESTION_TEXT_STYLING,
} from './styling';

interface Props {
  forSelf: boolean | null;
  firstName: string;

  parent1FirstName?: string;
  parent1LastName?: string;
  parent2FirstName?: string;
  parent2LastName?: string;
  parentsMarried?: YesNoUnknownAnswer;

  handleStepCompletion: (isStepComplete: boolean) => void;
  handleProceed: (answers: State) => void;
  handleStepBack: () => void;
}

interface State {
  parent1FirstName: string;
  parent1LastName: string;
  parent2FirstName: string;
  parent2LastName: string;
  parentsMarried: YesNoUnknownAnswer;
}

/**
 * Parent 1’s first name is the only required field in this set.
 *
 * If the user selects NO for “parents married?”, we’ll know that the record is
 * (probably) restricted.
 *
 * https://malegislature.gov/Laws/GeneralLaws/PartI/TitleVII/Chapter46/Section2A
 */
export default class ParentalInformation extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      parent1FirstName: props.parent1FirstName || '',
      parent1LastName: props.parent1LastName || '',
      parent2FirstName: props.parent2FirstName || '',
      parent2LastName: props.parent2LastName || '',
      parentsMarried: props.parentsMarried || '',
    };

    props.handleStepCompletion(
      !!(
        props.parent1FirstName &&
        props.parent1FirstName.length > 0 &&
        props.parentsMarried &&
        props.parentsMarried.length > 0
      )
    );
  }

  // Unless user has specified that the parents were married at the time of
  // birth, we must inform the user that the record may be restricted.
  private parentsMarried(): boolean {
    return !this.state.parentsMarried || this.state.parentsMarried === 'yes';
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
    return (
      this.state.parent1FirstName.length > 0 &&
      this.state.parentsMarried.length > 0
    );
  }

  // Returns a function to provide appropriate behavior for “back” button.
  private handleStepBack(): () => void {
    if (this.parentsMarried()) {
      return this.props.handleStepBack;
    } else {
      return () => this.setState({ parentsMarried: '' });
    }
  }

  public render() {
    return (
      <QuestionComponent
        handleProceed={() => this.props.handleProceed(this.state)}
        handleStepBack={this.handleStepBack()}
        allowProceed={this.allowProceed()}
        nextButtonText="Review request"
      >
        {this.parentsMarried()
          ? this.renderQuestions()
          : this.renderRestrictedText()}
      </QuestionComponent>
    );
  }

  renderQuestions(): React.ReactChild {
    const { forSelf, firstName } = this.props;

    return (
      <>
        <FieldsetComponent
          legendText={
            <h2 className={QUESTION_TEXT_STYLING}>
              What were the names of {forSelf ? 'your' : `${firstName}’s`}{' '}
              parents at the time of {forSelf ? 'your' : 'their'} birth?
            </h2>
          }
        >
          <p className={QUESTION_SUPPORTING_TEXT_STYLING}>
            Please use the names {forSelf ? 'your' : 'their'} parents were given
            at the time of their birth. If only one parent is listed on{' '}
            {forSelf ? 'your' : 'the'} record, you only need to include that
            name.
          </p>

          <fieldset className={`m-t400 ${PARENT_FIELDSET_STYLING}`}>
            <legend>
              <h3 className={`${QUESTION_TEXT_STYLING} secondary`}>
                Parent 1 <em>(for example: Mother)</em>
              </h3>
            </legend>

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
          </fieldset>

          <fieldset className={`m-t400 ${PARENT_FIELDSET_STYLING}`}>
            <legend>
              <h3 className={`${QUESTION_TEXT_STYLING} secondary`}>Parent 2</h3>
            </legend>

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
          </fieldset>
        </FieldsetComponent>

        <FieldsetComponent
          legendText={
            <h2 className={QUESTION_TEXT_STYLING}>
              Were {forSelf ? 'your' : `${firstName}’s`} parents married at the
              time of {forSelf ? 'your' : 'their'} birth?
            </h2>
          }
        >
          <YesNoUnsureComponent
            questionName="parentsMarried"
            questionValue={this.state.parentsMarried}
            handleChange={this.handleChange}
          />
        </FieldsetComponent>
      </>
    );
  }

  renderRestrictedText(): React.ReactChild {
    return (
      <div className="m-t500">
        <h2 className="sh-title">Record may have an access restriction</h2>

        {/* todo: link to mass. law to explain? */}
        {this.props.forSelf ? (
          <>
            <p>
              If your parents weren’t married at the time of your birth, your
              record may have an access restriction.
            </p>
            <p>
              <strong>
                You will need to provide a valid form of identification (i.e.
                driver’s license, state ID, military ID, or passport) later in
                this process.
              </strong>
            </p>
          </>
        ) : (
          <>
            <p>
              If their parents weren’t married at the time of the birth, the
              record is restricted and can only be requested by the people
              listed on the record.
            </p>
            <p>
              <strong>
                If you are listed on the record, you will need to provide a
                valid form of identification (i.e. driver’s license, state ID,
                military ID, or passport) to get a copy.
              </strong>{' '}
              If you are not listed on the record, you will not be able to get a
              copy. Your request will be canceled and your card will not be
              charged.
            </p>
          </>
        )}
      </div>
    );
  }
}
