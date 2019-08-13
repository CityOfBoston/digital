/** @jsx jsx */

import { jsx } from '@emotion/core';

import { ChangeEvent, Component, MouseEvent, ReactChild } from 'react';
import { observer } from 'mobx-react';

import { TextInput, MemorableDateInput } from '@cityofboston/react-fleet';

import BirthCertificateRequest from '../../store/BirthCertificateRequest';

import QuestionComponent from '../../common/question-components/QuestionComponent';
import FieldsetComponent from '../../common/question-components/FieldsetComponent';

import {
  NAME_FIELDS_CONTAINER_STYLING,
  SUPPORTING_TEXT_CLASSNAME,
  SECTION_HEADING_STYLING,
  NOTE_BOX_CLASSNAME,
} from '../../common/question-components/styling';

const EARLIEST_DATE = new Date(Date.UTC(1870, 0, 1));

interface Props {
  birthCertificateRequest: BirthCertificateRequest;
  showRecentBirthWarning?: boolean;

  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
}

@observer
export default class PersonalInformation extends Component<Props> {
  public static isComplete({
    requestInformation,
  }: BirthCertificateRequest): boolean {
    const { firstName, lastName, birthDate } = requestInformation;

    return !!(firstName && lastName && birthDate);
  }

  private handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    this.props.birthCertificateRequest.answerQuestion({
      [event.target.name]: event.target.value,
    });
  };

  private handleDateChange = (newDate: Date | null): void => {
    this.props.birthCertificateRequest.answerQuestion({
      birthDate: newDate,
    });
  };

  public render() {
    const { birthCertificateRequest } = this.props;
    const {
      forSelf,
      firstName,
      lastName,
      altSpelling,
      birthDate,
    } = birthCertificateRequest.requestInformation;

    return (
      <QuestionComponent
        handleProceed={this.props.handleProceed}
        handleStepBack={this.props.handleStepBack}
        allowProceed={PersonalInformation.isComplete(birthCertificateRequest)}
      >
        <FieldsetComponent
          legendText={
            <h2 css={SECTION_HEADING_STYLING}>
              What was {forSelf ? 'your' : 'their'} name at birth?
            </h2>
          }
        >
          <p className={SUPPORTING_TEXT_CLASSNAME}>
            If {forSelf ? 'you' : 'they'} changed {forSelf ? 'your' : 'their'}{' '}
            name at some point, please use the name {forSelf ? 'you' : 'they'}{' '}
            were given at birth. If {forSelf ? 'you' : 'they'} were adopted, use{' '}
            {forSelf ? 'your' : 'their'} post-adoption name.
          </p>

          <div css={NAME_FIELDS_CONTAINER_STYLING}>
            <TextInput
              label="First Name"
              name="firstName"
              value={firstName}
              onChange={this.handleChange}
            />

            <TextInput
              label="Last Name"
              name="lastName"
              value={lastName}
              onChange={this.handleChange}
            />
          </div>

          <div className="m-t700">
            <TextInput
              label="Alternative spelling"
              name="altSpelling"
              value={altSpelling}
              onChange={this.handleChange}
            />
          </div>
        </FieldsetComponent>

        <div className="m-v700">
          <MemorableDateInput
            legend={
              <h2
                css={SECTION_HEADING_STYLING}
                style={{ marginBottom: '1.5rem' }}
              >
                When were {forSelf ? 'you' : 'they'} born?
              </h2>
            }
            initialDate={birthDate || undefined}
            componentId="dob"
            onlyAllowPast={true}
            earliestDate={EARLIEST_DATE}
            handleDate={this.handleDateChange}
          />
        </div>

        {birthDate &&
          (isDateWithinPastTenDays(birthDate) ||
            this.props.showRecentBirthWarning) &&
          this.renderRecentBirthWarningText()}
      </QuestionComponent>
    );
  }

  private renderRecentBirthWarningText(): ReactChild {
    return (
      <div className={NOTE_BOX_CLASSNAME} style={{ paddingBottom: 0 }}>
        <h2 className="h3 tt-u">We might not have the birth certificate yet</h2>

        <p>
          <strong>
            We recommend waiting at least two weeks before you request a birth
            certificate.
          </strong>{' '}
          It generally takes two weeks for us to receive paperwork from the
          hospital.
        </p>

        <p>
          If you order too early, we can only hold your request for seven days
          while we wait for the hospital record. If we don’t receive the record
          in time, your request will be canceled automatically and your card
          will not be charged. You’ll have to resubmit your request.
        </p>
      </div>
    );
  }
}

function isDateWithinPastTenDays(date: Date): boolean {
  const dayInMs = 8.64e7;
  const tenDaysAgo = new Date(Date.now() - 10 * dayInMs);

  return tenDaysAgo < date;
}
