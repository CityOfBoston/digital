/** @jsx jsx */

import { jsx, css } from '@emotion/core';

import { ChangeEvent, Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';

import {
  TextInput,
  MemorableDateInput,
  SANS,
  CHARLES_BLUE,
} from '@cityofboston/react-fleet';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';

import QuestionComponent from '../../common/question-components/QuestionComponent';
import FieldsetComponent from '../../common/question-components/FieldsetComponent';

import {
  MARRIAGE_INTENTION_FORM_STYLING,
  PAIRED_INPUT_STYLING,
  // SECTION_HEADING_STYLING,
  NAME_FIELDS_CONTAINER_STYLING,
  NAME_FIELDS_BASIC_CONTAINER_STYLING,
} from '../../common/question-components/styling';

import {
  CONTACTFORM_HEADER_STYLING,
  CONTACTFORM_CONTACT_FIELD_STYLING,
} from './contactUI/contactFormStyling';

interface Props {
  marriageIntentionCertificateRequest: MarriageIntentionCertificateRequest;
  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent | TouchEvent) => void;
  toggleDisclaimerModal: (val: boolean) => void;
  backTrackingDisclaimer: boolean;
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

  private handleStepBack = (ev: MouseEvent | TouchEvent) => {
    const { toggleDisclaimerModal, backTrackingDisclaimer } = this.props;

    if (backTrackingDisclaimer === false && toggleDisclaimerModal) {
      toggleDisclaimerModal(true);
    } else {
      this.props.handleStepBack(ev);
    }
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
        handleStepBack={this.handleStepBack}
        allowProceed={ContactInfo.isComplete(
          marriageIntentionCertificateRequest
        )}
        nextButtonText={'NEXT'}
      >
        <FieldsetComponent
          legendText={<h2 css={[CONTACTFORM_HEADER_STYLING]}>Contact Info</h2>}
          description={`Please share the best email and phone number to get in contact with you. This will be used to contact you about your appointment.`}
        >
          <div css={MARRIAGE_INTENTION_FORM_STYLING}>
            <div
              css={[
                NAME_FIELDS_CONTAINER_STYLING,
                PAIRED_INPUT_STYLING,
                NAME_FIELDS_BASIC_CONTAINER_STYLING,
              ]}
            >
              <div css={CONTACTFORM_CONTACT_FIELD_STYLING}>
                <TextInput
                  label="EMail Address"
                  name="email"
                  value={email}
                  onChange={this.handleChange}
                  // optionalDescription={''}
                  required={true}
                  className={'contact-fields'}
                />

                <TextInput
                  label="Confirm EMail Address"
                  name="emailConfirm"
                  value={emailConfirm}
                  onChange={this.handleChange}
                  // optionalDescription={''}
                  required={true}
                  error={email === emailConfirm ? '' : 'Email does not match'}
                  className={'contact-fields'}
                />

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
                  className={'contact-fields'}
                />
              </div>
            </div>
            <div
              css={NAME_FIELDS_BASIC_CONTAINER_STYLING}
              style={{ paddingTop: '1.5rem', marginBottom: '1em' }}
            >
              <MemorableDateInput
                legend={
                  <h2
                    css={[APPT_HEADER_STYLING]}
                    style={{ marginBottom: '1.5rem' }}
                  >
                    Appointment Date
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

export const THICK_BORDER_STYLE = `4px solid ${CHARLES_BLUE}`;
const APPT_HEADER_STYLING = css(`
  padding-bottom: 0.25rem;
  marginBottom: 0;
  font-weight: 700;
  color: ${CHARLES_BLUE};
  border-bottom: ${THICK_BORDER_STYLE};

  text-transform: uppercase;
  font-family: ${SANS};
  font-size: 1.125rem !important;
`);
