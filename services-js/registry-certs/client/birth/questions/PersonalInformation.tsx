import React, { MouseEvent } from 'react';
import { observer } from 'mobx-react';

import { TextInput, MemorableDateInput } from '@cityofboston/react-fleet';

import BirthCertificateRequest from '../../store/BirthCertificateRequest';

import QuestionComponent from '../components/QuestionComponent';
import FieldsetComponent from '../components/FieldsetComponent';

import {
  NAME_FIELDS_CONTAINER_STYLING,
  SUPPORTING_TEXT_STYLING,
  SECTION_HEADING_STYLING,
} from '../styling';

const EARLIEST_DATE = '1/1/1870';

interface Props {
  birthCertificateRequest: BirthCertificateRequest;

  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
}

@observer
export default class PersonalInformation extends React.Component<Props> {
  public static isComplete({
    requestInformation,
  }: BirthCertificateRequest): boolean {
    const { firstName, lastName, birthDate } = requestInformation;

    return !!(firstName && lastName && birthDate);
  }

  private handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
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
            <h2 className={SECTION_HEADING_STYLING}>
              What was {forSelf ? 'your' : 'their'} name at birth?
            </h2>
          }
        >
          <p className={SUPPORTING_TEXT_STYLING}>
            If {forSelf ? 'you' : 'they'} changed {forSelf ? 'your' : 'their'}{' '}
            name at some point, please use the name {forSelf ? 'you' : 'they'}{' '}
            were given at birth. If {forSelf ? 'you' : 'they'} were adopted, use{' '}
            {forSelf ? 'your' : 'their'} post-adoption name.
          </p>

          <div className={NAME_FIELDS_CONTAINER_STYLING}>
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
                className={SECTION_HEADING_STYLING}
                style={{ marginBottom: '1.5rem' }}
              >
                When were {forSelf ? 'you' : 'they'} born?
              </h2>
            }
            initialDate={birthDate || ''}
            componentId="dob"
            onlyAllowPast={true}
            earliestDate={EARLIEST_DATE}
            handleDate={this.handleDateChange}
          />
        </div>
      </QuestionComponent>
    );
  }
}
