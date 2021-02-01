/** @jsx jsx */

import { jsx } from '@emotion/core';

import { ChangeEvent, Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';

import { TextInput, MemorableDateInput } from '@cityofboston/react-fleet';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';

import QuestionComponent from '../../common/question-components/QuestionComponent';
import FieldsetComponent from '../../common/question-components/FieldsetComponent';

import {
  MARRIAGE_INTENTION_FORM_STYLING,
  PAIRED_INPUT_STYLING,
  SECTION_HEADING_STYLING,
  NAME_FIELDS_CONTAINER_STYLING,
  NAME_FIELDS_BASIC_CONTAINER_STYLING,
  // OVERRIDE_SELECT_DISPLAY_STYLING,
} from '../../common/question-components/styling';

interface Props {
  marriageIntentionCertificateRequest: MarriageIntentionCertificateRequest;
  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
}

@observer
export default class ContactInfo extends Component<Props> {
  public static isComplete({
    requestInformation,
    isEmailValid,
  }: MarriageIntentionCertificateRequest): boolean {
    const {
      email,
      dayPhone,
      // appointmentTime,
      appointmentDate,
    } = requestInformation;

    // const regExStr = /^(\d{1,2}):(\d{2})(:00)?([ap]m)?$/;

    return !!(
      email &&
      isEmailValid(email) &&
      dayPhone &&
      // regExStr.test(appointmentTime) &&
      // appointmentTime &&
      appointmentDate
    );
  }

  private handlePhoneChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const parsedPhone = event.target.value
      .replace(/[^0-9]/g, '')
      .replace(/(\..*)\./g, '$1');
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        [event.target.name]: parsedPhone,
      },
      ''
    );
  };

  private handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        [event.target.name]: event.target.value,
      },
      ''
    );
  };

  private handleAptDateChange = (newDate: Date | null): void => {
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        appointmentDate: newDate,
      },
      ''
    );
  };

  public render() {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      email,
      dayPhone,
      appointmentDate,
      // appointmentTime,
    } = marriageIntentionCertificateRequest.requestInformation;

    const earliestDateToday = new Date(
      new Date(new Date(new Date().setHours(9)).setMinutes(0)).setSeconds(0)
    );

    // const earliestDateToday = new Date(new Date().setHours(-1, 59, 59, 0));

    return (
      <QuestionComponent
        handleProceed={this.props.handleProceed}
        handleStepBack={this.props.handleStepBack}
        allowProceed={ContactInfo.isComplete(
          marriageIntentionCertificateRequest
        )}
        nextButtonText={'NEXT'}
      >
        <FieldsetComponent
          legendText={
            <h2 css={SECTION_HEADING_STYLING}>Contact Information</h2>
          }
        >
          <div css={MARRIAGE_INTENTION_FORM_STYLING}>
            <div
              css={[
                NAME_FIELDS_CONTAINER_STYLING,
                PAIRED_INPUT_STYLING,
                NAME_FIELDS_BASIC_CONTAINER_STYLING,
              ]}
            >
              <div>
                <TextInput
                  label="Phone Number"
                  name="dayPhone"
                  value={dayPhone}
                  onChange={this.handlePhoneChange}
                  maxLength={11}
                  minLength={10}
                  optionalDescription={
                    'Numbers only, no spaces or dashes needed.'
                  }
                />
              </div>

              <TextInput
                label="EMail Address"
                name="email"
                value={email}
                onChange={this.handleChange}
                optionalDescription={''}
              />
            </div>
            <div
              css={NAME_FIELDS_BASIC_CONTAINER_STYLING}
              style={{ paddingTop: '1.5rem' }}
            >
              <MemorableDateInput
                legend={
                  <h2
                    css={SECTION_HEADING_STYLING}
                    style={{ marginBottom: '1.5rem' }}
                  >
                    What is your appointment date?
                  </h2>
                }
                initialDate={appointmentDate || undefined}
                componentId="appointmentDate"
                onlyAllowFuture={true}
                earliestDate={earliestDateToday}
                handleDate={this.handleAptDateChange}
              />
            </div>
          </div>
        </FieldsetComponent>
      </QuestionComponent>
    );
  }
}
