/** @jsx jsx */

import { jsx } from '@emotion/core';

import { ChangeEvent, Component, MouseEvent, ReactChild } from 'react';
import { observer } from 'mobx-react';

import { TextInput } from '@cityofboston/react-fleet';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';

import QuestionComponent from '../../common/question-components/QuestionComponent';
import FieldsetComponent, {
  FIELDSET_STYLING,
} from '../../common/question-components/FieldsetComponent';
import YesNoUnsureComponent from '../../common/question-components/YesNoUnsureComponent';

import {
  NAME_FIELDS_CONTAINER_STYLING,
  SUPPORTING_TEXT_CLASSNAME,
  SECTION_HEADING_STYLING,
  NOTE_BOX_CLASSNAME,
} from '../../common/question-components/styling';

interface Props {
  marriageIntentionCertificateRequest: MarriageIntentionCertificateRequest;

  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
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
export default class ParentalInformation extends Component<Props> {
  public static isComplete(
    marriageIntentionCertificateRequest: MarriageIntentionCertificateRequest
  ): boolean {
    const {
      parent1FirstName,
      parentsMarried,
    } = marriageIntentionCertificateRequest.requestInformation;

    return !!(parent1FirstName && parentsMarried);
  }

  private handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;

    this.props.marriageIntentionCertificateRequest.answerQuestion({
      [name]: value,
    });
  };

  public render() {
    const {
      marriageIntentionCertificateRequest,
      handleProceed,
      handleStepBack,
    } = this.props;

    const needsVerification =
      marriageIntentionCertificateRequest.mayBeRestricted;

    return (
      <QuestionComponent
        handleProceed={handleProceed}
        handleStepBack={handleStepBack}
        allowProceed={ParentalInformation.isComplete(
          marriageIntentionCertificateRequest
        )}
        nextButtonText={needsVerification ? 'Next' : 'Review request'}
      >
        {this.renderQuestions()}
      </QuestionComponent>
    );
  }

  private renderQuestions(): ReactChild {
    const { marriageIntentionCertificateRequest } = this.props;

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
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <>
        <FieldsetComponent
          legendText={
            <h2 css={SECTION_HEADING_STYLING}>
              What were {forSelf ? 'your' : 'their'} parents’ names at the time
              of {forSelf ? 'your' : 'the'} marriage-intention?
            </h2>
          }
        >
          <p className={SUPPORTING_TEXT_CLASSNAME}>
            Please use the names {forSelf ? 'your' : 'their'} parents used at
            the time of {forSelf ? 'your' : 'the'} marriage-intention. If only
            one parent is listed on {forSelf ? 'your' : 'the'} record, you only
            need to include that name.
          </p>

          <fieldset css={FIELDSET_STYLING}>
            <legend>
              <h3 className="secondary" css={SECTION_HEADING_STYLING}>
                Parent 1 <em>(Example: Mother)</em>
              </h3>
            </legend>

            <div css={NAME_FIELDS_CONTAINER_STYLING}>
              <TextInput
                label="First Name"
                name="parent1FirstName"
                value={parent1FirstName}
                onChange={this.handleChange}
              />

              <TextInput
                label={lastNameLabel()}
                name="parent1LastName"
                value={parent1LastName}
                onChange={this.handleChange}
              />
            </div>
          </fieldset>

          <fieldset css={FIELDSET_STYLING}>
            <legend>
              <h3 className="secondary" css={SECTION_HEADING_STYLING}>
                Parent 2
              </h3>
            </legend>

            <div css={NAME_FIELDS_CONTAINER_STYLING}>
              <TextInput
                label="First Name"
                name="parent2FirstName"
                value={parent2FirstName}
                onChange={this.handleChange}
              />

              <TextInput
                label={lastNameLabel()}
                name="parent2LastName"
                value={parent2LastName}
                onChange={this.handleChange}
              />
            </div>
          </fieldset>
        </FieldsetComponent>

        <FieldsetComponent
          legendText={
            <h2 css={SECTION_HEADING_STYLING}>
              Were {forSelf ? 'your' : `${firstName}’s`} parents married at the
              time of {forSelf ? 'your' : 'their'} marriage-intention?
            </h2>
          }
        >
          <YesNoUnsureComponent
            questionName="parentsMarried"
            questionValue={parentsMarried}
            handleChange={this.handleChange}
          />
        </FieldsetComponent>

        {marriageIntentionCertificateRequest.mayBeRestricted &&
          this.renderRestrictedText()}
      </>
    );
  }

  private renderRestrictedText(): ReactChild {
    const {
      forSelf,
    } = this.props.marriageIntentionCertificateRequest.requestInformation;

    return (
      <div className={NOTE_BOX_CLASSNAME} style={{ paddingBottom: 0 }}>
        <h2 className="h3 tt-u">Record may have an access restriction</h2>

        {forSelf ? (
          <>
            <p>
              If your parents weren’t married at the time of your
              marriage-intention, your record may have an accessrestriction.
            </p>

            <p>
              <strong>
                You will need to provide a valid form of identification (
                <i>e.g.</i>
                driver’s license, state ID, military ID, or passport) later in
                this process.
              </strong>
            </p>
          </>
        ) : (
          <>
            <p>
              If their parents weren’t married at the time of the
              marriage-intention, the record is restricted and can only be
              requested by the people listed on the record.
            </p>

            <p>
              <strong>
                If you are listed on the record, you will need to provide a
                valid form of identification (<i>e.g.</i> driver’s license,
                state ID, military ID, or passport) to get a copy.
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

function lastNameLabel(): ReactChild {
  return (
    <>
      <span style={{ whiteSpace: 'nowrap', marginRight: '0.5em' }}>
        Last / Maiden Name
      </span>

      <wbr />

      <span style={{ whiteSpace: 'nowrap' }}>(if applicable)</span>
    </>
  );
}
