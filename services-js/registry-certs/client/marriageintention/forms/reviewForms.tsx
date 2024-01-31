/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';
import QuestionComponent from '../../common/question-components/QuestionComponent';

import { MI_REVIEW_STYLING } from './styling';
import {
  MARRIAGE_INTENTION_FORM_STYLING,
  MARRIAGE_INTENTION_INTRO_STYLING,
} from '../../common/question-components/styling';

import {
  formatDate,
  getStateFullName,
  getCountryFullName,
  yesNoAnswer,
} from '../helpers/formUtils';

import PartnerView from './partnerView';
import ContactUX from './reviewUI/contact';
import HeaderUX from './reviewUI/header';

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

  public render() {
    const {
      requestInformation,
    } = this.props.marriageIntentionCertificateRequest;

    const appointmentDateTime = `${formatDate(
      requestInformation.appointmentDate
    )}`;

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
          <HeaderUX />

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
            dob={formatDate(requestInformation.partnerA_dob)}
            age={requestInformation.partnerA_age}
            occupation={requestInformation.partnerA_occupation}
            // sex={requestInformation.partnerA_sex}
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
            parentsMarriedAtBirth={yesNoAnswer(
              requestInformation.partnerA_parentsMarriedAtBirth
            )}
            bloodRelation={yesNoAnswer(
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
            dob={formatDate(requestInformation.partnerB_dob)}
            age={requestInformation.partnerB_age}
            occupation={requestInformation.partnerB_occupation}
            // sex={requestInformation.partnerB_sex}
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
            parentsMarriedAtBirth={yesNoAnswer(
              requestInformation.partnerB_parentsMarriedAtBirth
            )}
            bloodRelation={yesNoAnswer(
              requestInformation.partnerB_bloodRelation
            )}
            bloodRelationDesc={`
              ${requestInformation.partnerB_bloodRelationDesc}
            `}
            partnershipState={requestInformation.partnerB_partnershipState}
          />

          <ContactUX
            appointmentDateTime={appointmentDateTime}
            requestInformation={requestInformation}
          />
        </div>
      </QuestionComponent>
    );
  }
}
