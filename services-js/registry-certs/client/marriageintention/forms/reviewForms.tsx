/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';
import QuestionComponent from '../../common/question-components/QuestionComponent';

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

  private formatDate(_dateObj): any {
    const dateTimeFormat = new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
    const [
      { value: month },
      ,
      { value: day },
      ,
      { value: year },
    ] = dateTimeFormat.formatToParts(_dateObj);
    const _day = _dateObj.getUTCDate();
    const currDay = day === _day ? day : _day;

    return `${month} ${currDay}, ${year}`;
  }

  public render() {
    const {
      requestInformation,
    } = this.props.marriageIntentionCertificateRequest;

    const appointmentDateTime = `${this.formatDate(
      requestInformation.appointmentDate
    )}`;

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
              ${requestInformation.partnerA_residenceAddress} 
              ${requestInformation.partnerA_residenceState} 
              ${requestInformation.partnerA_residenceZip} 
              ${requestInformation.partnerA_residenceCountry}
            `}
            birthCity={requestInformation.partnerA_birthCity}
            birthState={requestInformation.partnerA_birthState}
            birthCountry={requestInformation.partnerA_birthCountry}
            marriageNumb={requestInformation.partnerA_marriageNumb}
            lastMarriageStatus={`${
              requestInformation.partnerA_lastMarriageStatus
            }`}
            partnerShipType={`${requestInformation.partnerA_partnershipType}`}
            partnerShipDissolve={`
              ${requestInformation.partnerA_partnershipTypeDissolved}
            `}
            parentA={`
              ${requestInformation.partnerA_parentA_Name} 
              ${requestInformation.partnerA_parentA_Surname}
            `}
            parentB={`
              ${requestInformation.partnerA_parentB_Name} 
              ${requestInformation.partnerA_parentB_Surname}
            `}
            parentsMarriedAtBirth={`
              ${requestInformation.partnerA_parentsMarriedAtBirth}
            `}
            bloodRelation={`
              ${requestInformation.partnerA_bloodRelation}
            `}
            bloodRelationDesc={`
              ${requestInformation.partnerA_bloodRelationDesc}
            `}
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
              ${requestInformation.partnerB_residenceAddress} 
              ${requestInformation.partnerB_residenceStreetName}, 
              ${requestInformation.partnerB_residenceState} 
              ${requestInformation.partnerB_residenceZip} 
              ${requestInformation.partnerB_residenceCountry}
            `}
            birthCity={requestInformation.partnerB_birthCity}
            birthState={requestInformation.partnerB_birthState}
            birthCountry={requestInformation.partnerB_birthCountry}
            marriageNumb={requestInformation.partnerB_marriageNumb}
            lastMarriageStatus={`${
              requestInformation.partnerB_lastMarriageStatus
            }`}
            partnerShipType={`${requestInformation.partnerB_partnershipType}`}
            partnerShipDissolve={`
              ${requestInformation.partnerB_partnershipTypeDissolved}
            `}
            parentA={`
              ${requestInformation.partnerB_parentA_Name} 
              ${requestInformation.partnerB_parentA_Surname}
            `}
            parentB={`
              ${requestInformation.partnerB_parentB_Name} 
              ${requestInformation.partnerB_parentB_Surname}
            `}
            parentsMarriedAtBirth={`
              ${requestInformation.partnerB_parentsMarriedAtBirth}
            `}
            bloodRelation={`
              ${requestInformation.partnerB_bloodRelation}
            `}
            bloodRelationDesc={`
              ${requestInformation.partnerB_bloodRelationDesc}
            `}
          />
        </div>
      </QuestionComponent>
    );
  }
}
