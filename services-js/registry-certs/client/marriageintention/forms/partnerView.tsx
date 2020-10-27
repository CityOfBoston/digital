/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Component } from 'react';
import { observer } from 'mobx-react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';

import {
  SECTION_HEADING_STYLING,
  SECTION_WRAPPER_STYLING,
  MARRIAGE_INTENTION_FORM_STYLING,
} from '../../common/question-components/styling';

import {
  BOTTOM_SPACING_STYLING,
  PAIRED_COLUMNS_STYLING,
  COLUMNS_STYLING,
  REVIEW_BOTTOM_SPACING_STYLING,
  REVIEW_SUB_HEADING_STYLING,
} from './styling';

import { PARTNERSHIP_TYPE, LAST_MARRIAGE_STATUS } from './inputData';

interface Props {
  marriageIntentionCertificateRequest: MarriageIntentionCertificateRequest;
  partyLabel: string;
  firstName: string;
  lastName: string;
  middleName: string;
  surName: string;
  dob: string;
  age: string;
  occupation: string;
  sex: string;
  address: string;
  birthCity: string;
  birthState: string;
  birthCountry: string;
  marriageNumb: string;
  lastMarriageStatus: string;
  partnerShipType: string;
  partnerShipDissolve: string;
  parentA: string;
  parentB: string;
  parentsMarriedAtBirth: string;
  bloodRelation: string;
  bloodRelationDesc: string;
  suffix: string;
}

@observer
export default class PartnerView extends Component<Props> {
  constructor(props: Props) {
    super(props);

    this.state = {
      partyLabel: props.partyLabel,
      firstName: props.firstName,
      lastName: props.lastName,
      middleName: props.middleName,
      surName: props.surName,
      dob: props.dob,
      age: props.age,
      occupation: props.occupation,
      sex: props.sex,
      address: props.address,
    };
  }

  public render() {
    const { marriageIntentionCertificateRequest, suffix } = this.props;
    const genderObj = marriageIntentionCertificateRequest.getGenderLabel(
      this.props.sex
    );
    const genderLabel = genderObj && genderObj.value ? genderObj.label : 'N/A';

    const partnerShipTypeObj = PARTNERSHIP_TYPE.find(
      entry => entry.value === this.props.partnerShipType
    );
    const partnerShipType =
      partnerShipTypeObj && partnerShipTypeObj.value
        ? partnerShipTypeObj.label
        : '';

    const lastMarriageStatusObj = LAST_MARRIAGE_STATUS.find(
      entry => entry.value === this.props.lastMarriageStatus
    );
    const lastMarriageStatus =
      lastMarriageStatusObj && lastMarriageStatusObj.value
        ? lastMarriageStatusObj.label
        : '';
    const lastName =
      suffix && suffix !== 'N/A'
        ? `${this.props.lastName} ${suffix}`
        : `${this.props.lastName}`;
    return (
      <div>
        <div css={SECTION_WRAPPER_STYLING}>
          <h2
            css={[SECTION_HEADING_STYLING, BOTTOM_SPACING_STYLING]}
            style={{
              fontSize: '2rem',
              textDecoration: 'none',
            }}
          >
            Partner {this.props.partyLabel}
          </h2>

          <div css={PAIRED_COLUMNS_STYLING}>
            <div css={COLUMNS_STYLING}>
              <label>First Name: </label>
              {this.props.firstName}
            </div>

            <div css={COLUMNS_STYLING}>
              <label>Middle Name: </label>
              {this.props.middleName}
            </div>
          </div>

          <div css={PAIRED_COLUMNS_STYLING}>
            <div css={COLUMNS_STYLING}>
              <label>Last Name: </label>
              {lastName}
            </div>

            <div css={COLUMNS_STYLING}>
              <label>Last Name / Surname: </label>
              {this.props.surName}
            </div>
          </div>

          <div
            css={[
              BOTTOM_SPACING_STYLING,
              PAIRED_COLUMNS_STYLING,
              REVIEW_BOTTOM_SPACING_STYLING,
              REVIEW_SUB_HEADING_STYLING,
            ]}
          >
            <div css={COLUMNS_STYLING}>
              <label>Date of Birth: </label>
              {this.props.dob}
            </div>

            <div css={COLUMNS_STYLING}>
              <label>Age: </label>
              {this.props.age}
            </div>

            <div css={COLUMNS_STYLING}>
              <label>Sex: </label>
              {genderLabel}
            </div>

            <div css={COLUMNS_STYLING}>
              <label>Occupation: </label>
              {this.props.occupation}
            </div>

            <div css={COLUMNS_STYLING}>
              <label>Address: </label>
              {this.props.address}
            </div>
          </div>

          <div
            css={[
              BOTTOM_SPACING_STYLING,
              PAIRED_COLUMNS_STYLING,
              REVIEW_BOTTOM_SPACING_STYLING,
              REVIEW_SUB_HEADING_STYLING,
            ]}
          >
            <h2 css={BOTTOM_SPACING_STYLING}>Birthplace</h2>

            <div css={COLUMNS_STYLING}>
              <label>City: </label>
              {this.props.birthCity}
            </div>

            <div css={COLUMNS_STYLING}>
              <label>State: </label>
              {this.props.birthState}
            </div>

            <div css={COLUMNS_STYLING}>
              <label>Country: </label>
              {this.props.birthCountry}
            </div>
          </div>

          <div
            css={[
              BOTTOM_SPACING_STYLING,
              PAIRED_COLUMNS_STYLING,
              REVIEW_BOTTOM_SPACING_STYLING,
              REVIEW_SUB_HEADING_STYLING,
            ]}
          >
            <h2 css={BOTTOM_SPACING_STYLING}>Parents</h2>

            <div css={COLUMNS_STYLING}>
              <label>Parent 1/Mother: </label>
              {this.props.parentA}
            </div>

            <div css={COLUMNS_STYLING}>
              <label>Parent 2/Father: </label>
              {this.props.parentB}
            </div>

            <div css={COLUMNS_STYLING}>
              <label>
                Were your parents married at the time of your birth?:
              </label>
              {this.props.parentsMarriedAtBirth === '1' ? ' Yes' : ' No'}
            </div>
          </div>

          <div
            css={[
              BOTTOM_SPACING_STYLING,
              PAIRED_COLUMNS_STYLING,
              REVIEW_BOTTOM_SPACING_STYLING,
              MARRIAGE_INTENTION_FORM_STYLING,
            ]}
          >
            <h2 css={BOTTOM_SPACING_STYLING}>Marriage</h2>

            <div css={COLUMNS_STYLING}>
              <label>Marriage Number: </label>
              {this.props.marriageNumb}
            </div>

            {this.props.marriageNumb !== '1st' && (
              <div css={COLUMNS_STYLING}>
                <label>Last Marriage Status: </label>
                {lastMarriageStatus}
              </div>
            )}

            {this.props.marriageNumb !== '1st' && (
              <div css={COLUMNS_STYLING}>
                <label>Last Marriage Resolution: </label>
                {this.props.partnerShipDissolve}
              </div>
            )}

            <div css={COLUMNS_STYLING}>
              <label>Current Partnership Type: </label>
              {partnerShipType}
            </div>

            {this.props.partnerShipType !== 'N/A' && (
              <div css={COLUMNS_STYLING}>
                <label>Civil Union Or Domestic Partnership: Dissolved: </label>
                {this.props.partnerShipDissolve}
              </div>
            )}

            <div css={COLUMNS_STYLING}>
              <label>Blood Relation to Partner?: </label>
              {this.props.bloodRelation === '1' ? 'Yes' : 'No'}
            </div>

            {this.props.bloodRelation === 'Yes' && (
              <div css={COLUMNS_STYLING}>
                <label>Describe Blood Relation: </label>
                {this.props.bloodRelationDesc}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
