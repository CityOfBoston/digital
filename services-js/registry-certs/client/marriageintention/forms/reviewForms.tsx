/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';
import QuestionComponent from '../../common/question-components/QuestionComponent';

import { COUNTRIES, US_STATES } from './inputData';

import {
  SECTION_HEADING_STYLING,
  SECTION_WRAPPER_STYLING,
  MARRIAGE_INTENTION_FORM_STYLING,
  MARRIAGE_INTENTION_INTRO_STYLING,
  NAME_FIELDS_BASIC_CONTAINER_STYLING,
} from '../../common/question-components/styling';

import {
  MAIN_HEADING_STYLING,
  MI_REVIEW_STYLING,
  PAIRED_COLUMNS_STYLING,
  COLUMNS_STYLING,
} from './styling';

import PartnerView from './partnerView';

interface Props {
  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
  marriageIntentionCertificateRequest: MarriageIntentionCertificateRequest;
}

@observer
export default class ReviewForms extends Component<Props> {
  constructor(props: Props) {
    super(props);

    this.state = {
      marriageIntentionCertificateRequest:
        props.marriageIntentionCertificateRequest,
    };
  }

  public static isComplete(): boolean {
    return true;
  }

  private adjustForTimezone(date: Date): Date {
    var timeOffsetInMS: number = date.getTimezoneOffset() * 60000;
    date.setTime(date.getTime() + timeOffsetInMS);
    return date;
  }

  private formatDate(_dateObj): any {
    const dateObj = new Date(this.adjustForTimezone(_dateObj));
    const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(
      dateObj
    );
    const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(
      dateObj
    );
    const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(
      dateObj
    );

    return `${month} ${day}, ${year}`;
  }

  public render() {
    const {
      requestInformation,
    } = this.props.marriageIntentionCertificateRequest;

    const appointmentDateTime = `${this.formatDate(
      requestInformation.appointmentDate
    )}`;

    const YesNoAnswer = (val: any) => {
      return parseInt(val) === 1 ? 'Yes' : 'No';
    };

    const partnerA_parentA = `${requestInformation.partnerA_parentA_Name}/${
      requestInformation.partnerA_parentA_Surname
    }`;
    const partnerA_parentB = `${requestInformation.partnerA_parentB_Name}/${
      requestInformation.partnerA_parentB_Surname
    }`;
    const partnerB_parentA = `${requestInformation.partnerB_parentA_Name}/${
      requestInformation.partnerB_parentA_Surname
    }`;
    const partnerB_parentB = `${requestInformation.partnerB_parentB_Name}/${
      requestInformation.partnerB_parentB_Surname
    }`;
    const getCountryFullName = (Name: string) => {
      const countryObj = COUNTRIES.find(entry => entry.value === Name);
      let retVal = '';

      if (countryObj && countryObj.label) {
        retVal = ` ${countryObj.label.toLocaleUpperCase()}`;
        if (countryObj.shortLabel)
          retVal = ` ${countryObj.shortLabel.toLocaleUpperCase()}`;
      }

      return retVal;
    };
    const getStateFullName = (Name: string) => {
      const countryObj = US_STATES.find(entry => entry.value === Name);
      return countryObj && countryObj.label && countryObj.label !== '--'
        ? countryObj.label
        : '';
    };

    return (
      <QuestionComponent
        handleProceed={this.props.handleProceed}
        handleStepBack={this.props.handleStepBack}
        allowProceed={true}
        nextButtonText={'Submit'}
      >
        <div
          css={[
            MARRIAGE_INTENTION_FORM_STYLING,
            MARRIAGE_INTENTION_INTRO_STYLING,
            MI_REVIEW_STYLING,
          ]}
        >
          <h1 css={[SECTION_HEADING_STYLING, MAIN_HEADING_STYLING]}>
            Contact Information
          </h1>

          <div css={SECTION_WRAPPER_STYLING}>
            <div css={PAIRED_COLUMNS_STYLING}>
              <div css={COLUMNS_STYLING}>
                <label>Email: </label>
                {requestInformation.email}
              </div>

              <div css={COLUMNS_STYLING}>
                <label>Phone #: </label>
                {requestInformation.dayPhone}
              </div>
            </div>

            <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
              <label>Appointment Date: </label>
              {appointmentDateTime}
            </div>
          </div>
          <h1 css={[SECTION_HEADING_STYLING, MAIN_HEADING_STYLING]}>
            Review Partner Information
          </h1>

          {/* PARTY A */}
          <PartnerView
            marriageIntentionCertificateRequest={
              this.props.marriageIntentionCertificateRequest
            }
            partyLabel={'A'}
            firstName={requestInformation.partnerA_firstName}
            lastName={requestInformation.partnerA_lastName}
            suffix={requestInformation.partnerA_suffix}
            middleName={requestInformation.partnerA_middleName}
            surName={requestInformation.partnerA_surName}
            dob={this.formatDate(requestInformation.partnerA_dob)}
            age={requestInformation.partnerA_age}
            occupation={requestInformation.partnerA_occupation}
            sex={requestInformation.partnerA_sex}
            address={`
              ${requestInformation.partnerA_residenceAddress},
              ${requestInformation.partnerA_residenceCity}
              ${getStateFullName(requestInformation.partnerA_residenceState)} 
              ${requestInformation.partnerA_residenceZip} 
              ${getCountryFullName(
                requestInformation.partnerA_residenceCountry
              )}
            `}
            birthCity={requestInformation.partnerA_birthCity}
            birthState={getStateFullName(
              requestInformation.partnerA_birthState
            )}
            birthCountry={getCountryFullName(
              requestInformation.partnerA_birthCountry
            )}
            marriageNumb={requestInformation.partnerA_marriageNumb}
            lastMarriageStatus={`${
              requestInformation.partnerA_lastMarriageStatus
            }`}
            partnerShipType={`${requestInformation.partnerA_partnershipType}`}
            partnerShipDissolve={`
              ${requestInformation.partnerA_partnershipTypeDissolved}
            `}
            parentA={partnerA_parentA}
            parentB={partnerA_parentB}
            parentsMarriedAtBirth={YesNoAnswer(
              requestInformation.partnerA_parentsMarriedAtBirth
            )}
            bloodRelation={YesNoAnswer(
              requestInformation.partnerA_bloodRelation
            )}
            bloodRelationDesc={`
              ${requestInformation.partnerA_bloodRelationDesc}
            `}
            partnershipState={requestInformation.partnerA_partnershipState}
          />

          {/* PARTY B */}
          <PartnerView
            marriageIntentionCertificateRequest={
              this.props.marriageIntentionCertificateRequest
            }
            partyLabel={'B'}
            firstName={requestInformation.partnerB_firstName}
            lastName={requestInformation.partnerB_lastName}
            suffix={requestInformation.partnerB_suffix}
            middleName={requestInformation.partnerB_middleName}
            surName={requestInformation.partnerB_surName}
            dob={this.formatDate(requestInformation.partnerB_dob)}
            age={requestInformation.partnerB_age}
            occupation={requestInformation.partnerB_occupation}
            sex={requestInformation.partnerB_sex}
            address={`
              ${requestInformation.partnerB_residenceAddress},
              ${requestInformation.partnerB_residenceCity}
              ${getStateFullName(requestInformation.partnerB_residenceState)} 
              ${requestInformation.partnerB_residenceZip} 
              ${getCountryFullName(
                requestInformation.partnerB_residenceCountry
              )}
            `}
            birthCity={requestInformation.partnerB_birthCity}
            birthState={getStateFullName(
              requestInformation.partnerB_birthState
            )}
            birthCountry={getCountryFullName(
              requestInformation.partnerB_birthCountry
            )}
            marriageNumb={requestInformation.partnerB_marriageNumb}
            lastMarriageStatus={`${
              requestInformation.partnerB_lastMarriageStatus
            }`}
            partnerShipType={`${requestInformation.partnerB_partnershipType}`}
            partnerShipDissolve={`
              ${requestInformation.partnerB_partnershipTypeDissolved}
            `}
            parentA={partnerB_parentA}
            parentB={partnerB_parentB}
            parentsMarriedAtBirth={YesNoAnswer(
              requestInformation.partnerB_parentsMarriedAtBirth
            )}
            bloodRelation={YesNoAnswer(
              requestInformation.partnerB_bloodRelation
            )}
            bloodRelationDesc={`
              ${requestInformation.partnerB_bloodRelationDesc}
            `}
            partnershipState={requestInformation.partnerB_partnershipState}
          />
        </div>
      </QuestionComponent>
    );
  }
}
