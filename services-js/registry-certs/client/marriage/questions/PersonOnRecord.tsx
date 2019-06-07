/** @jsx jsx */

import { jsx } from '@emotion/core';

import { ChangeEvent, Component, MouseEvent, ReactChild } from 'react';

import { observer } from 'mobx-react';

import { TextInput } from '@cityofboston/react-fleet';

import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';

import FieldsetComponent from '../../common/question-components/FieldsetComponent';
import QuestionComponent from '../../common/question-components/QuestionComponent';
import YesNoUnsureComponent from '../../common/question-components/YesNoUnsureComponent';

import {
  NAME_FIELDS_CONTAINER_STYLING,
  SUPPORTING_TEXT_CLASSNAME,
  SECTION_HEADING_STYLING,
  NOTE_BOX_CLASSNAME,
  // NOTE_BOX_CLASSNAME,
} from '../../common/question-components/styling';

export type Person = 'person1' | 'person2';

interface Props {
  marriageCertificateRequest: MarriageCertificateRequest;
  person: Person;

  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
}

@observer
export default class PersonOnRecord extends Component<Props> {
  public static isComplete(
    person: Person,
    { requestInformation }: MarriageCertificateRequest
  ): boolean {
    const {
      firstName1,
      lastName1,
      firstName2,
      lastName2,
      parentsMarried1,
      parentsMarried2,
    } = requestInformation;

    if (person === 'person1') {
      return !!(firstName1 && lastName1 && parentsMarried1);
    } else {
      return !!(firstName2 && lastName2 && parentsMarried2);
    }
  }

  private handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    this.props.marriageCertificateRequest.answerQuestion({
      [event.target.name]: event.target.value,
    });
  };

  public render() {
    const { marriageCertificateRequest, person } = this.props;
    const {
      forSelf,
      firstName1,
      firstName2,
      lastName1,
      lastName2,
      maidenName1,
      maidenName2,
      parentsMarried1,
      parentsMarried2,
    } = marriageCertificateRequest.requestInformation;
    const userForSelf = person === 'person1' && forSelf;

    const headingText = `What is the name of the ${
      person === 'person1' ? 'first' : 'other'
    } person on the certificate?`;

    return (
      <>
        <QuestionComponent
          handleProceed={this.props.handleProceed}
          handleStepBack={this.props.handleStepBack}
          allowProceed={PersonOnRecord.isComplete(
            person,
            marriageCertificateRequest
          )}
        >
          <FieldsetComponent
            legendText={
              <h2 css={SECTION_HEADING_STYLING}>
                {userForSelf ? 'What is your name?' : headingText}
              </h2>
            }
          >
            {!userForSelf && person === 'person1' && (
              <p className={SUPPORTING_TEXT_CLASSNAME}>
                It doesn’t matter which person comes first on the marriage
                certificate.
              </p>
            )}

            <div css={NAME_FIELDS_CONTAINER_STYLING}>
              <TextInput
                label="First Name"
                name={person === 'person1' ? 'firstName1' : 'firstName2'}
                value={person === 'person1' ? firstName1 : firstName2}
                onChange={this.handleChange}
              />

              <TextInput
                label="Last Name"
                name={person === 'person1' ? 'lastName1' : 'lastName2'}
                value={person === 'person1' ? lastName1 : lastName2}
                onChange={this.handleChange}
              />
            </div>

            <div className="m-t700">
              <TextInput
                label="Maiden name"
                name={person === 'person1' ? 'maidenName1' : 'maidenName2'}
                value={person === 'person1' ? maidenName1 : maidenName2}
                onChange={this.handleChange}
              />
            </div>
          </FieldsetComponent>

          <FieldsetComponent
            legendText={
              <h2 id="filedInBoston" css={SECTION_HEADING_STYLING}>
                Were {userForSelf ? 'your' : 'their'} parents married at the
                time of {forSelf ? 'your' : 'their'} birth?
              </h2>
            }
          >
            <YesNoUnsureComponent
              questionName={
                person === 'person1' ? 'parentsMarried1' : 'parentsMarried2'
              }
              questionValue={
                person === 'person1' ? parentsMarried1 : parentsMarried2
              }
              handleChange={this.handleChange}
            />
          </FieldsetComponent>
        </QuestionComponent>

        {marriageCertificateRequest.mayBeRestricted &&
          this.renderRestrictedText(person)}
      </>
    );
  }

  private renderRestrictedText(person: Person): ReactChild {
    const { marriageCertificateRequest } = this.props;
    const {
      forSelf,
      parentsMarried1,
    } = marriageCertificateRequest.requestInformation;

    let noteBoxContent: ReactChild;

    if (person === 'person1' && forSelf) {
      noteBoxContent = (
        <>
          <p>
            If your parents weren’t married at the time of your birth, your
            marriage certificate may have an access restriction.
          </p>

          <p>
            <strong>
              You will need to provide a valid form of identification (
              <i>e.g.</i> driver’s license, state ID, military ID, or passport)
              in a later step.
            </strong>
          </p>
        </>
      );
    } else {
      noteBoxContent = (
        <>
          <p>
            If either set of parents weren’t married at the time of the person’s
            birth, the marriage certificate is restricted and can only be
            requested by the people listed on the record.
          </p>

          <p>
            <strong>
              If you are listed on the record, you will need to provide a valid
              form of identification (<i>e.g.</i> driver’s license, state ID,
              military ID, or passport) in{' '}
              {person === 'person1' ? 'a later' : 'the next'} step.
            </strong>{' '}
            If you are not listed on the record, you will not be able to get a
            copy. Your request will be canceled and your card will not be
            charged.
          </p>
        </>
      );
    }

    // If user is on person2 and
    // If parentsMarried1 and parentsMarried2 are both not “yes” and user
    // was already warned during the previous step, do not show a second time.
    if (marriageCertificateRequest.mayBeRestricted) {
      return (
        <>
          {(person === 'person1' || parentsMarried1 === 'yes') && (
            <div className={NOTE_BOX_CLASSNAME} style={{ paddingBottom: 0 }}>
              <h2 className="h3 tt-u">Record may have an access restriction</h2>

              {noteBoxContent}
            </div>
          )}
        </>
      );
    } else {
      return <></>;
    }
  }
}
