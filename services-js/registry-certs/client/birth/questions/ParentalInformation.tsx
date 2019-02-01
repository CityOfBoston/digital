import React from 'react';
import { observer } from 'mobx-react';

import { TextInput } from '@cityofboston/react-fleet';

import BirthCertificateRequest from '../../store/BirthCertificateRequest';

import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';
import YesNoUnsureComponent from './YesNoUnsureComponent';

import {
  NAME_FIELDS_CONTAINER_STYLING,
  SUPPORTING_TEXT_STYLING,
  SECTION_HEADING_STYLING,
  FIELDSET_STYLING,
  NOTE_BOX_CLASSNAME,
} from '../styling';

interface Props {
  birthCertificateRequest: BirthCertificateRequest;

  handleProceed: () => void;
  handleStepBack: () => void;
}

/**
 * Parent 1’s first name is the only required name field.
 *
 * If the user selects NO for “parents married?”, we’ll know that the record is
 * (probably) restricted.
 *
 * https://malegislature.gov/Laws/GeneralLaws/PartI/TitleVII/Chapter46/Section2A
 */
@observer
export default class ParentalInformation extends React.Component<Props> {
  public static isComplete(
    birthCertificateRequest: BirthCertificateRequest
  ): boolean {
    const {
      parent1FirstName,
      parentsMarried,
    } = birthCertificateRequest.requestInformation;

    return !!(parent1FirstName && parentsMarried);
  }

  private handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;

    this.props.birthCertificateRequest.answerQuestion({
      [name]: value,
    });
  };

  public render() {
    const {
      birthCertificateRequest,
      handleProceed,
      handleStepBack,
    } = this.props;

    const needsVerification = birthCertificateRequest.mayBeRestricted;

    return (
      <QuestionComponent
        handleProceed={handleProceed}
        handleStepBack={handleStepBack}
        allowProceed={ParentalInformation.isComplete(birthCertificateRequest)}
        nextButtonText={needsVerification ? 'Next' : 'Review request'}
      >
        {this.renderQuestions()}
      </QuestionComponent>
    );
  }

  private renderQuestions(): React.ReactChild {
    const { birthCertificateRequest } = this.props;

    // We assume that firstName has been filled in at this point, since
    // ParentalInformation comes after PersonalInformation.
    const {
      forSelf,
      firstName,
      parent1FirstName,
      parent1LastName,
      parent2FirstName,
      parent2LastName,
      parentsMarried,
    } = birthCertificateRequest.requestInformation;

    return (
      <>
        <FieldsetComponent
          legendText={
            <h2 className={SECTION_HEADING_STYLING}>
              What were the names of {forSelf ? 'your' : `${firstName}’s`}{' '}
              parents at the time of {forSelf ? 'your' : 'their'} birth?
            </h2>
          }
        >
          <p className={SUPPORTING_TEXT_STYLING}>
            Please use the names {forSelf ? 'your' : 'their'} parents were given
            at the time of their birth. If only one parent is listed on{' '}
            {forSelf ? 'your' : 'the'} record, you only need to include that
            name.
          </p>

          <fieldset className={FIELDSET_STYLING}>
            <legend>
              <h3 className={`${SECTION_HEADING_STYLING} secondary`}>
                Parent 1 <em>(for example: Mother)</em>
              </h3>
            </legend>

            <div className={NAME_FIELDS_CONTAINER_STYLING}>
              <TextInput
                label="First Name"
                name="parent1FirstName"
                value={parent1FirstName}
                onChange={this.handleChange}
              />

              <TextInput
                label="Last Name"
                name="parent1LastName"
                value={parent1LastName}
                onChange={this.handleChange}
              />
            </div>
          </fieldset>

          <fieldset className={FIELDSET_STYLING}>
            <legend>
              <h3 className={`${SECTION_HEADING_STYLING} secondary`}>
                Parent 2
              </h3>
            </legend>

            <div className={NAME_FIELDS_CONTAINER_STYLING}>
              <TextInput
                label="First Name"
                name="parent2FirstName"
                value={parent2FirstName}
                onChange={this.handleChange}
              />

              <TextInput
                label="Last Name"
                name="parent2LastName"
                value={parent2LastName}
                onChange={this.handleChange}
              />
            </div>
          </fieldset>
        </FieldsetComponent>

        <FieldsetComponent
          legendText={
            <h2 className={SECTION_HEADING_STYLING}>
              Were {forSelf ? 'your' : `${firstName}’s`} parents married at the
              time of {forSelf ? 'your' : 'their'} birth?
            </h2>
          }
        >
          <YesNoUnsureComponent
            questionName="parentsMarried"
            questionValue={parentsMarried}
            handleChange={this.handleChange}
          />
        </FieldsetComponent>

        {birthCertificateRequest.mayBeRestricted && this.renderRestrictedText()}
      </>
    );
  }

  private renderRestrictedText(): React.ReactChild {
    const { forSelf } = this.props.birthCertificateRequest.requestInformation;

    return (
      <div className={NOTE_BOX_CLASSNAME} style={{ paddingBottom: 0 }}>
        <h2 className="h3 tt-u">Record may have an access restriction</h2>

        {/* todo: link to mass. law to explain? */}
        {forSelf ? (
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