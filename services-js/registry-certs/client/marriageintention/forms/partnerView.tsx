/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Component } from 'react';
import { observer } from 'mobx-react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';

import { REVIEW_FORM_STYLING } from './reviewUI/reviewStying';

import {
  $ReviewControlHeader,
  $ReviewFieldValuePair,
} from './reviewUI/components';

import { PARTNERSHIP_TYPE, LAST_MARRIAGE_STATUS } from './inputData';

interface Props {
  marriageIntentionCertificateRequest: MarriageIntentionCertificateRequest;
  partnerLabel: string;
  firstName: string;
  lastName: string;
  middleName: string;
  surName: string;
  dob: string;
  age: string;
  occupation: string;
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
  partnershipState: string;
  stepStr: string;
  toggleDisclaimerModal: (val: boolean) => void;
  backTrackingDisclaimer: boolean;
}

@observer
export default class PartnerView extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render() {
    const {
      suffix,
      firstName,
      lastName,
      surName,
      occupation,
      dob,
      birthCity,
      birthCountry,
      address,
      bloodRelation,
      bloodRelationDesc,
      marriageNumb,
      partnerShipDissolve,
      parentA,
      parentB,
      parentsMarriedAtBirth,
      stepStr,
    } = this.props;

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

    const lastNameStr =
      suffix && suffix !== 'N/A' ? `${lastName} ${suffix}` : `${lastName}`;

    return (
      <div>
        {$ReviewControlHeader({
          title: `Person ${this.props.partnerLabel}`,
          btnStr: `Edit This Page`,
          routeStep: `${stepStr}`,
          backTrackingDisclaimer: this.props.backTrackingDisclaimer,
          toggleDisclaimerModal: this.props.toggleDisclaimerModal,
        })}

        <div css={REVIEW_FORM_STYLING}>
          <div className="section-wrapper">
            <h2>Personal Information</h2>

            {$ReviewFieldValuePair({
              field: `Legal Name`,
              value: `${firstName} ${lastNameStr}`,
            })}

            {$ReviewFieldValuePair({
              field: `Last Name to be Used After Marriage`,
              value: `${surName}`,
            })}

            {$ReviewFieldValuePair({
              field: `Occupation`,
              value: `${occupation}`,
            })}
          </div>

          <div className="section-wrapper">
            <h2>Date and Place of Birth</h2>

            {$ReviewFieldValuePair({
              field: `Date of Birth`,
              value: `${dob}`,
            })}

            {$ReviewFieldValuePair({
              field: `BirthPlace`,
              value: `${birthCity}, ${birthCountry}`,
            })}
          </div>

          <div className="section-wrapper">
            <h2>Residence</h2>

            {$ReviewFieldValuePair({
              field: `Address`,
              value: `${address}`,
            })}
          </div>

          <div className="section-wrapper">
            <h2>Marriage</h2>

            {$ReviewFieldValuePair({
              field: `If Applicable, Blood Relation To Current Partner`,
              value: `${bloodRelation}`,
            })}

            {bloodRelation === 'Yes' &&
              $ReviewFieldValuePair({
                field: `Blood Relation Description`,
                value: `${bloodRelationDesc}`,
              })}

            {$ReviewFieldValuePair({
              field: `Marriage Number`,
              value: `${marriageNumb}`,
            })}

            {$ReviewFieldValuePair({
              field: `If Applicable, Status of Last Marriage`,
              value: `${lastMarriageStatus}`,
            })}

            {$ReviewFieldValuePair({
              field: `If Applicable, Status of Civil Union or Domestic Partnership`,
              value: `${partnerShipDissolve}`,
            })}

            {$ReviewFieldValuePair({
              field: `If Applicable, State of Civil Union or Domestic Partnership`,
              value: `${partnerShipType}`,
            })}
          </div>

          <div className="section-wrapper">
            <h2>Parents</h2>

            {$ReviewFieldValuePair({
              field: `Parent 1`,
              value: `${parentA}`,
            })}

            {$ReviewFieldValuePair({
              field: `Parent 2`,
              value: `${parentB}`,
            })}

            {$ReviewFieldValuePair({
              field: `Status of Marriage at Time of Birth`,
              value: `${parentsMarriedAtBirth}`,
            })}
          </div>
        </div>
      </div>
    );
  }
}
