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
      emailConfirm,
      dayPhone,
      appointmentDate,
    } = requestInformation;

    let dayPhoneLen: number = 0;
    const matchPhone: any = dayPhone.match(/\d+/gi);

    if (matchPhone) {
      dayPhoneLen = parseInt(matchPhone.join(''));
    }

    return !!(
      email &&
      isEmailValid(email) &&
      emailConfirm &&
      isEmailValid(emailConfirm) &&
      email === emailConfirm &&
      dayPhone &&
      dayPhoneLen > 9 &&
      appointmentDate
    );
  }

  private handlePhoneChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { marriageIntentionCertificateRequest } = this.props;
    const parsedPhone = event.target.value.replace(/[a-z]/g, '');
    marriageIntentionCertificateRequest.answerQuestion(
      {
        dayPhoneUnformattedStr: event.target.value
          .replace(/[^0-9]/g, '')
          .replace(/(\..*)\./g, '$1'),
      },
      ''
    );
    marriageIntentionCertificateRequest.answerQuestion(
      {
        [event.target.name]: parsedPhone,
      },
      ''
    );
  };

  private processOnKeyDown = (event: ChangeEvent<HTMLInputElement>): void => {
    let val = event.target.value
      .replace(/[^0-9]/g, '')
      .replace(/(\..*)\./g, '$1');
    const formatted = (_txt: any, f: any, s: any, t: any) => {
      if (t) {
        return `(${f}) ${s}-${t}`;
      } else if (s) {
        return `(${f}) ${s}`;
      } else if (f) {
        return `(${f})`;
      } else {
        return '';
      }
    };

    if (val.length > 3) {
      event.target.value = val
        .replace(/[^0-9]/g, '')
        .replace(/(\..*)\./g, '$1')
        .replace(/\D/g, '')
        .replace(/(\d{1,3})(\d{1,3})?(\d{1,4})?/g, formatted);
    }
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
      emailConfirm,
      dayPhone,
      appointmentDate,
    } = marriageIntentionCertificateRequest.requestInformation;

    const earliestDateToday = new Date(
      new Date(new Date(new Date().setHours(9)).setMinutes(0)).setSeconds(0)
    );

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
                  maxLength={14}
                  minLength={10}
                  optionalDescription={
                    'Numbers only, no spaces or dashes needed.'
                  }
                  onKeyDown={this.processOnKeyDown}
                  placeholder={'(___) ___-____'}
                  required={true}
                />
              </div>

              <div>
                <TextInput
                  label="EMail Address"
                  name="email"
                  value={email}
                  onChange={this.handleChange}
                  optionalDescription={''}
                  required={true}
                />

                <TextInput
                  label="Confirm EMail Address"
                  name="emailConfirm"
                  value={emailConfirm}
                  onChange={this.handleChange}
                  optionalDescription={''}
                  required={true}
                  error={email === emailConfirm ? '' : 'Email does not match'}
                />
              </div>
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
                includeToday={true}
              />
            </div>
          </div>
        </FieldsetComponent>
      </QuestionComponent>
    );
  }
}
