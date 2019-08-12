/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ChangeEvent, Component, MouseEvent, ReactChild } from 'react';

import { observer } from 'mobx-react';

import { TextInput, MEDIA_SMALL } from '@cityofboston/react-fleet';

import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';

import FieldsetComponent from '../../common/question-components/FieldsetComponent';
import QuestionComponent from '../../common/question-components/QuestionComponent';
import YesNoUnsureComponent from '../../common/question-components/YesNoUnsureComponent';
import AltSpellings from '../../common/question-components/AltSpellings';

import {
  SUPPORTING_TEXT_CLASSNAME,
  SECTION_HEADING_STYLING,
  NOTE_BOX_CLASSNAME,
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
      fullName1,
      fullName2,
      parentsMarried1,
      parentsMarried2,
    } = requestInformation;

    if (person === 'person1') {
      return !!(fullName1 && parentsMarried1);
    } else {
      return !!(fullName2 && parentsMarried2);
    }
  }

  private handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    this.props.marriageCertificateRequest.answerQuestion({
      [event.target.name]: event.target.value,
    });
  };

  private updateAltSpellings = (
    person: Person,
    questionValues: Object
  ): void => {
    const keyName = person === 'person1' ? 'altSpellings1' : 'altSpellings2';

    this.props.marriageCertificateRequest.answerQuestion({
      [keyName]: questionValues,
    });
  };

  public render() {
    const { marriageCertificateRequest, person } = this.props;
    const {
      forSelf,
      fullName1,
      fullName2,
      maidenName1,
      maidenName2,
      altSpellings1,
      altSpellings2,
      parentsMarried1,
      parentsMarried2,
    } = marriageCertificateRequest.requestInformation;
    const isPerson1: boolean = person === 'person1';
    const userForSelf: boolean | null = isPerson1 && forSelf;

    const headingText = `What is the name of the ${
      isPerson1 ? 'first' : 'other'
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
            {!userForSelf && isPerson1 && (
              <p className={SUPPORTING_TEXT_CLASSNAME}>
                It doesn’t matter which person comes first on the marriage
                certificate.
              </p>
            )}

            <TextInput
              label="Full Name"
              name={isPerson1 ? 'fullName1' : 'fullName2'}
              value={isPerson1 ? fullName1 : fullName2}
              onChange={this.handleChange}
            />

            <TextInput
              label={
                <>
                  Maiden name <span style={{ fontSize: '90%' }}>(if any)</span>
                </>
              }
              name={isPerson1 ? 'maidenName1' : 'maidenName2'}
              value={isPerson1 ? maidenName1 : maidenName2}
              onChange={this.handleChange}
              css={SHORT_STYLING}
            />

            <AltSpellings
              values={isPerson1 ? altSpellings1 : altSpellings2}
              person={person}
              width="short"
              handleChange={result => this.updateAltSpellings(person, result)}
            />
          </FieldsetComponent>

          <FieldsetComponent
            legendText={
              <h2 id="filedInBoston" css={SECTION_HEADING_STYLING}>
                Were {userForSelf ? 'your' : 'their'} parents married at the
                time of {userForSelf ? 'your' : 'their'} birth?
              </h2>
            }
          >
            <YesNoUnsureComponent
              questionName={isPerson1 ? 'parentsMarried1' : 'parentsMarried2'}
              questionValue={isPerson1 ? parentsMarried1 : parentsMarried2}
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
      parentsMarried2,
    } = marriageCertificateRequest.requestInformation;
    const isPerson1: boolean = person === 'person1';

    let noteBoxContent: ReactChild;

    if (forSelf && isPerson1) {
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
              military ID, or passport) in {isPerson1 ? 'a later' : 'the next'}{' '}
              step.
            </strong>{' '}
            If you are not listed on the record, you will not be able to get a
            copy. Your request will be canceled and your card will not be
            charged.
          </p>
        </>
      );
    }

    // Ensure warning appears on correct step, but never show the warning twice.
    if (
      (isPerson1 && parentsMarried1 === 'yes') ||
      (!isPerson1 && parentsMarried2 === 'yes')
    ) {
      return <></>;
    } else {
      return (
        <>
          <div className={NOTE_BOX_CLASSNAME} style={{ paddingBottom: 0 }}>
            <h2 className="h3 tt-u">Record may have an access restriction</h2>

            {noteBoxContent}
          </div>
        </>
      );
    }
  }
}

const SHORT_STYLING = css({
  [MEDIA_SMALL]: {
    width: '50%',
  },
});
