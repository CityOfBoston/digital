import React from 'react';
import { observer } from 'mobx-react';

import { TextInput } from '@cityofboston/react-fleet';

import BirthCertificateRequest from '../../store/BirthCertificateRequest';

import QuestionComponent from './QuestionComponent';
import FieldsetComponent from './FieldsetComponent';

import {
  NAME_FIELDS_CONTAINER_STYLING,
  SUPPORTING_TEXT_STYLING,
  SECTION_HEADING_STYLING,
} from '../styling';

interface Props {
  birthCertificateRequest: BirthCertificateRequest;

  handleProceed: () => void;
  handleStepBack: () => void;
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
            were given at birth.<br />If {forSelf ? 'you' : 'they'} were
            adopted, use {forSelf ? 'your' : 'their'} post-adoption name.
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
            {/*<h3 className={`${QUESTION_TEXT_STYLING} secondary`}>*/}
            {/*Is there an alternative spelling?*/}
            {/*</h3>*/}

            <TextInput
              // hideLabel={true}
              label="Alternative spelling"
              name="altSpelling"
              value={altSpelling}
              onChange={this.handleChange}
            />
          </div>
        </FieldsetComponent>

        <FieldsetComponent
          legendText={
            <h2 className={SECTION_HEADING_STYLING}>
              When were {forSelf ? 'you' : 'they'} born?
            </h2>
          }
        >
          {/* todo */}
          <TextInput
            label="Date of Birth"
            name="birthDate"
            onChange={this.handleChange}
            value={birthDate}
          />
        </FieldsetComponent>
      </QuestionComponent>
    );
  }
}
