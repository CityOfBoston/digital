/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Component, MouseEvent } from 'react';

import { observer } from 'mobx-react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';

import QuestionComponent from '../../common/question-components/QuestionComponent';

import FieldsetComponent from '../../common/question-components/FieldsetComponent';

// import { BOSTON_NEIGHBORHOODS } from './inputData';

import {
  nameFields,
  residence,
  marriageBlock,
  parents,
  datePlaceOfBirth,
  PARTNERFORM_HEADER_STYLING,
} from './partnerFormUI';

import {
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
  partnerNum?: number | string;
  partnerLabel: string;
  toggleDisclaimerModal: (val: boolean) => void;
  backTrackingDisclaimer: boolean;
}

@observer
export default class PartnerForm extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public static isComplete({
    requestInformation,
  }: MarriageIntentionCertificateRequest): boolean {
    const isComplete = isPartnerFormPageComplete('A', requestInformation);

    return isComplete;
  }

  // ------------------------------------------------------ //
  public handleBirthDateChange = (newDate): void => {
    const isDate = isDateObj$(newDate);
    const partnerFlag: string = 'A';
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
      partnerFlag: 'A',
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
      partnerA_marriageNumb,
      partnerA_lastMarriageStatus,
      partnerA_firstName,
      partnerA_lastName,
      partnerA_middleName,
      partnerA_surName,
      partnerA_useSurname,
      partnerA_occupation,
      partnerA_suffix,
      partnerA_dob,
      partnerA_birthCountry,
      partnerA_birthCity,
      partnerA_birthState,
      partnerA_residenceZip,
      partnerA_residenceCity,
      partnerA_residenceState,
      partnerA_residenceAddress,
      partnerA_residenceCountry,
      partnerA_bloodRelation,
      partnerA_bloodRelationDesc,
      partnerA_parentsMarriedAtBirth,
      partnerA_parentB_Surname,
      partnerA_parentB_Name,
      partnerA_parentA_Surname,
      partnerA_parentA_Name,
      partnerA_partnershipType,
      partnerA_partnershipState,
      partnerA_partnershipTypeDissolved,
      partnerA_marriedBefore,
      partnerA_additionalParent,
      partnerA_formPageComplete,
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
          partnerA_formPageComplete && partnerA_formPageComplete === '1'
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
            formPageComplete: partnerA_formPageComplete,
            partnerFlag: partnerLabel,
            handleChange: e =>
              handleChange$({
                e,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            handleResidenceStateChange: e =>
              handleResidenceStateChange$({
                e,
                partnerFlag: 'A',
                requestInformation:
                  marriageIntentionCertificateRequest.requestInformation,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            handleUseSurnameChange: e =>
              handleUseSurnameChange$({
                val: e.target.value,
                partnerFlag: 'A',
                certObj: this.props.marriageIntentionCertificateRequest,
                requestInformation:
                  marriageIntentionCertificateRequest.requestInformation,
              }),
            formErrors: this.props.formErrors,
            errorElemSrc: this.props.errorElemSrc,
            refs: this.props.refObjs.nameFieldsRef,

            firstName: partnerA_firstName,
            lastName: partnerA_lastName,
            middleName: partnerA_middleName,
            surName: partnerA_surName,
            useSurname: partnerA_useSurname,
            occupation: partnerA_occupation,
            suffix: partnerA_suffix,
          })}

          {datePlaceOfBirth({
            formPageComplete: partnerA_formPageComplete,
            partnerFlag: partnerLabel,
            partnerDOB: partnerA_dob,
            birthCountryStr: partnerA_birthCountry,
            birthStateStr: partnerA_birthState,
            birthCityStr: partnerA_birthCity,
            handleChange: e =>
              handleChange$({
                e,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            handleBirthplaceCountryChange: e =>
              handleBirthplaceCountryChange$({
                e,
                partnerFlag: 'A',
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            checkBirthCityForNeighborhood: () =>
              checkBirthCityForNeighborhood$({
                partnerFlag: 'A',
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
            formPageComplete: partnerA_formPageComplete,
            partnerFlag: partnerLabel,
            residenceZipStr: partnerA_residenceZip,
            residenceCityStr: partnerA_residenceCity,
            residenceStateStr: partnerA_residenceState,
            residenceAddressStr: partnerA_residenceAddress,
            residenceCountryStr: partnerA_residenceCountry,
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
                partnerFlag: 'A',
                requestInformation:
                  marriageIntentionCertificateRequest.requestInformation,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            handleResidenceStateChange: e =>
              handleResidenceStateChange$({
                e,
                partnerFlag: 'A',
                requestInformation:
                  marriageIntentionCertificateRequest.requestInformation,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            handleResidenceCountryChange: e =>
              handleResidenceCountryChange$({
                e,
                partnerFlag: 'A',
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            formErrors: this.props.formErrors,
            errorElemSrc: this.props.errorElemSrc,
            refs: this.props.refObjs.residenceRef,
          })}

          {marriageBlock({
            formPageComplete: partnerA_formPageComplete,
            partnerFlag: partnerLabel,
            bloodRelation: partnerA_bloodRelation,
            bloodRelationDesc: partnerA_bloodRelationDesc,
            marriedBefore: partnerA_marriedBefore,
            marriageNumb: partnerA_marriageNumb,
            lastMarriageStatus: partnerA_lastMarriageStatus,

            partnershipType: partnerA_partnershipType,
            partnershipState: partnerA_partnershipState,
            partnershipTypeDissolved: partnerA_partnershipTypeDissolved,

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
                partnerFlag: 'A',
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            formErrors: this.props.formErrors,
            errorElemSrc: this.props.errorElemSrc,
            refs: this.props.refObjs.marriageRef,
          })}

          {parents({
            formPageComplete: partnerA_formPageComplete,
            partnerFlag: partnerLabel,
            parentA_Name: partnerA_parentA_Name,
            parentA_Surname: partnerA_parentA_Surname,
            parentB_Name: partnerA_parentB_Name,
            parentB_Surname: partnerA_parentB_Surname,
            additionalParent: partnerA_additionalParent,
            parentsMarriedAtBirth: partnerA_parentsMarriedAtBirth,
            handleParentNameChange: e =>
              handleParentNameChange$({
                e,
                partnerFlag: 'A',
                requestInformation:
                  marriageIntentionCertificateRequest.requestInformation,
                certObj: this.props.marriageIntentionCertificateRequest,
              }),
            handleAddParentNameChange: e =>
              handleParentNameChange$({
                e,
                partnerFlag: 'A',
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
                partnerFlag: 'A',
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
