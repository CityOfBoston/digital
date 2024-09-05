/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Component, MouseEvent } from 'react';

import { observer } from 'mobx-react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';

import QuestionComponent from '../../common/question-components/QuestionComponent';

import FieldsetComponent from '../../common/question-components/FieldsetComponent';

import {
  nameFields,
  marriageBlock,
  datePlaceOfBirth,
  residence,
  parents,
  PARTNERFORM_HEADER_STYLING,
} from './partnerFormUI';

import {
  // handleChange$,
  // handleUseSurnameChange$,
  // handleAdditionalParentChange$,
  // handleBloodRelDescChange$,
  // handleBloodRelChange$,
  // handleFormPageComplete$,

  handleChange$,
  handleUseSurnameChange$,
  handleAdditionalParentChange$,
  handleBloodRelDescChange$,
  handleBloodRelChange$,
  handleFormPageComplete$,
  handleMarriedBeforeChange$,
  handleBirthplaceCountryChange$,
  handleResidenceCountryChange$,
  handleZipCodeChange$,
  handleResidenceStateChange$,
  replaceBosNeighborhoods$,
  checkBirthCityForNeighborhood$,
  handleParentNameChange$,
  isDateObj$,
  updateAge$,
  calcAge$,
} from './eventHandlers';

import { isPartnerFormPageComplete } from '../../marriageintention/helpers/formUtils';

interface Props {
  marriageIntentionCertificateRequest: MarriageIntentionCertificateRequest;
  handleProceed: (ev: MouseEvent | TouchEvent) => void;
  handleStepBack: (ev: MouseEvent | TouchEvent) => void;
  formErrors: (data: {
    action: string;
    ref?: React.RefObject<HTMLSpanElement> | null;
    section: string;
  }) => any | undefined;
  refObjs: {
    nameFieldsRef: React.RefObject<HTMLSpanElement>;
    residenceRef: React.RefObject<HTMLSpanElement>;
    marriageRef: React.RefObject<HTMLSpanElement>;
    datePlaceOfBirthRef: React.RefObject<HTMLSpanElement>;
    parentsRef: React.RefObject<HTMLSpanElement>;
  };
  errorElemSrc: object;
  partnerLabel: string;
  partnerNum?: number | string;
  backTrackingDisclaimer: boolean;
  toggleDisclaimerModal: (val: boolean) => void;
}

@observer
export default class PartnerForm extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public static isComplete({
    requestInformation,
  }: MarriageIntentionCertificateRequest): boolean {
    const isComplete = isPartnerFormPageComplete('B', requestInformation);

    return isComplete;
  }

  // ------------------------------------------------------ //
  public handleBirthDateChange = (newDate): void => {
    const isDate = isDateObj$(newDate);
    const partnerFlag: string = 'B';
    let age = '';

    if (isDate) {
      age = `${calcAge$(newDate)}`;
      updateAge$({
        val: age,
        partnerFlag,
        certObj: this.props.marriageIntentionCertificateRequest,
      });
    }

    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        [`partner${partnerFlag}_dob`]: newDate,
      },
      ''
    );
  };
  // ------------------------------------------------------ //

  private advanceForm = (certObj: any) => {
    handleFormPageComplete$({
      partnerFlag: 'B',
      val: '1',
      certObj,
    });
    this.props.handleProceed(certObj);
  };

  private handleStepBack = (ev: MouseEvent | TouchEvent) => {
    const { toggleDisclaimerModal, backTrackingDisclaimer } = this.props;

    if (backTrackingDisclaimer === false && toggleDisclaimerModal) {
      toggleDisclaimerModal(true);
    } else {
      this.props.handleStepBack(ev);
    }
  };

  // RENDER ALL UI
  public render() {
    const {
      marriageIntentionCertificateRequest,
      partnerLabel,
      partnerNum,
    } = this.props;

    const {
      partnerB_marriageNumb,
      partnerB_lastMarriageStatus,
      partnerB_firstName,
      partnerB_lastName,
      partnerB_middleName,
      partnerB_surName,
      partnerB_useSurname,
      partnerB_occupation,
      partnerB_suffix,
      partnerB_dob,
      partnerB_birthCountry,
      partnerB_birthCity,
      partnerB_birthState,
      partnerB_residenceZip,
      partnerB_residenceCity,
      partnerB_residenceState,
      partnerB_residenceAddress,
      partnerB_residenceCountry,
      partnerB_bloodRelation,
      partnerB_bloodRelationDesc,
      partnerB_parentsMarriedAtBirth,
      partnerB_parentB_Surname,
      partnerB_parentB_Name,
      partnerB_parentA_Surname,
      partnerB_parentA_Name,
      partnerB_partnershipType,
      partnerB_partnershipState,
      partnerB_partnershipTypeDissolved,
      partnerB_marriedBefore,
      partnerB_additionalParent,
      partnerB_formPageComplete,
    } = marriageIntentionCertificateRequest.requestInformation;

    const partner_num = partnerNum ? partnerNum : partnerLabel;

    return (
      <QuestionComponent
        handleProceed={this.advanceForm.bind(
          this,
          marriageIntentionCertificateRequest
        )}
        allowProceed={PartnerForm.isComplete(
          marriageIntentionCertificateRequest
        )}
        handleStepBack={this.handleStepBack}
        nextButtonText={
          partnerB_formPageComplete && partnerB_formPageComplete === '1'
            ? 'Save & Continue'
            : 'NEXT'
        }
      >
        <FieldsetComponent
          legendText={
            <h2 css={PARTNERFORM_HEADER_STYLING}>Person {partner_num}</h2>
          }
        >
          {nameFields({
            formPageComplete: partnerB_formPageComplete,
            partnerFlag: partnerLabel,
            handleChange: e =>
              handleChange$({
                e,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            handleResidenceStateChange: e =>
              handleResidenceStateChange$({
                e,
                partnerFlag: 'B',
                requestInformation:
                  marriageIntentionCertificateRequest.requestInformation,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            handleUseSurnameChange: e =>
              handleUseSurnameChange$({
                val: e.target.value,
                partnerFlag: 'B',
                certObj: this.props.marriageIntentionCertificateRequest,
                requestInformation:
                  marriageIntentionCertificateRequest.requestInformation,
              }),
            formErrors: this.props.formErrors,
            errorElemSrc: this.props.errorElemSrc,
            refs: this.props.refObjs.nameFieldsRef,
            firstName: partnerB_firstName,
            lastName: partnerB_lastName,
            middleName: partnerB_middleName,
            surName: partnerB_surName,
            useSurname: partnerB_useSurname,
            occupation: partnerB_occupation,
            suffix: partnerB_suffix,
          })}

          {datePlaceOfBirth({
            formPageComplete: partnerB_formPageComplete,
            partnerFlag: partnerLabel,
            partnerDOB: partnerB_dob,
            birthCountryStr: partnerB_birthCountry,
            birthStateStr: partnerB_birthState,
            birthCityStr: partnerB_birthCity,
            handleChange: e =>
              handleChange$({
                e,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            handleBirthplaceCountryChange: e =>
              handleBirthplaceCountryChange$({
                e,
                partnerFlag: 'B',
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            checkBirthCityForNeighborhood: () =>
              checkBirthCityForNeighborhood$({
                partnerFlag: 'B',
                requestInformation:
                  marriageIntentionCertificateRequest.requestInformation,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            handleBirthDateChange: this.handleBirthDateChange,
            formErrors: this.props.formErrors,
            errorElemSrc: this.props.errorElemSrc,
            refs: this.props.refObjs.datePlaceOfBirthRef,
          })}

          {residence({
            formPageComplete: partnerB_formPageComplete,
            partnerFlag: partnerLabel,
            residenceZipStr: partnerB_residenceZip,
            residenceCityStr: partnerB_residenceCity,
            residenceStateStr: partnerB_residenceState,
            residenceAddressStr: partnerB_residenceAddress,
            residenceCountryStr: partnerB_residenceCountry,
            handleChange: e =>
              handleChange$({
                e,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            handleZipCodeChange: e =>
              handleZipCodeChange$({
                e,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            replaceBosNeighborhoods: e =>
              replaceBosNeighborhoods$({
                e,
                partnerFlag: 'B',
                requestInformation:
                  marriageIntentionCertificateRequest.requestInformation,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            handleResidenceStateChange: e =>
              handleResidenceStateChange$({
                e,
                partnerFlag: 'B',
                requestInformation:
                  marriageIntentionCertificateRequest.requestInformation,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            handleResidenceCountryChange: e =>
              handleResidenceCountryChange$({
                e,
                partnerFlag: 'B',
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            formErrors: this.props.formErrors,
            errorElemSrc: this.props.errorElemSrc,
            refs: this.props.refObjs.residenceRef,
          })}

          {marriageBlock({
            formPageComplete: partnerB_formPageComplete,
            partnerFlag: partnerLabel,
            bloodRelation: partnerB_bloodRelation,
            bloodRelationDesc: partnerB_bloodRelationDesc,
            marriedBefore: partnerB_marriedBefore,
            marriageNumb: partnerB_marriageNumb,
            lastMarriageStatus: partnerB_lastMarriageStatus,

            partnershipType: partnerB_partnershipType,
            partnershipState: partnerB_partnershipState,
            partnershipTypeDissolved: partnerB_partnershipTypeDissolved,

            handleChange: e =>
              handleChange$({
                e,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            handleBloodRelChange: e =>
              handleBloodRelChange$({
                e,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            handleBloodRelDescChange: e =>
              handleBloodRelDescChange$({
                e,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            handleMarriedBeforeChange: e =>
              handleMarriedBeforeChange$({
                val: e.target.value,
                partnerFlag: 'B',
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            formErrors: this.props.formErrors,
            errorElemSrc: this.props.errorElemSrc,
            refs: this.props.refObjs.marriageRef,
          })}

          {parents({
            formPageComplete: partnerB_formPageComplete,
            partnerFlag: partnerLabel,
            parentA_Name: partnerB_parentA_Name,
            parentA_Surname: partnerB_parentA_Surname,
            parentB_Name: partnerB_parentB_Name,
            parentB_Surname: partnerB_parentB_Surname,
            additionalParent: partnerB_additionalParent,
            parentsMarriedAtBirth: partnerB_parentsMarriedAtBirth,
            handleParentNameChange: e =>
              handleParentNameChange$({
                e,
                partnerFlag: 'B',
                requestInformation:
                  marriageIntentionCertificateRequest.requestInformation,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            handleAddParentNameChange: e =>
              handleParentNameChange$({
                e,
                partnerFlag: 'B',
                parentFlag: 'B',
                requestInformation:
                  marriageIntentionCertificateRequest.requestInformation,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            handleChange: e =>
              handleChange$({
                e,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            handleAdditionalParentChange: e =>
              handleAdditionalParentChange$({
                val: e.target.value,
                partnerFlag: 'B',
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            formErrors: this.props.formErrors,
            errorElemSrc: this.props.errorElemSrc,
            refs: this.props.refObjs.parentsRef,
          })}
        </FieldsetComponent>
      </QuestionComponent>
    );
  }
}
