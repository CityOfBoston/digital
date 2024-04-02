/** @jsx jsx */

import { jsx } from '@emotion/core';

import { ChangeEvent, Component, MouseEvent } from 'react';

import { observer } from 'mobx-react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';

import QuestionComponent from '../../common/question-components/QuestionComponent';

import FieldsetComponent from '../../common/question-components/FieldsetComponent';

import {
  PARTNERSHIP_TYPE,
  MARRIAGE_COUNT,
  BOSTON_NEIGHBORHOODS,
} from './inputData';

import {
  nameFields,
  marriageBlock,
  datePlaceOfBirth,
  residence,
  parents,
  PARTNERFORM_HEADER_STYLING,
} from './partnerFormUI';

import {
  handleChange$,
  handleUseSurnameChange$,
  handleAdditionalParentChange$,
  handleBloodRelDescChange$,
  handleBloodRelChange$,
  handleFormPageComplete$,
} from './eventHandlers';

interface Props {
  marriageIntentionCertificateRequest: MarriageIntentionCertificateRequest;
  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
  partnerLabel: string;
  partnerNum?: number | string;
}

@observer
export default class PartnerForm extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public static isComplete({
    requestInformation,
  }: MarriageIntentionCertificateRequest): boolean {
    const {
      partnerB_firstName,
      partnerB_lastName,
      partnerB_dob,
      partnerB_age,
      partnerB_surName,
      partnerB_useSurname,
      partnerB_occupation,
      partnerB_bloodRelation,
      partnerB_bloodRelationDesc,
      partnerB_birthCity,
      partnerB_birthState,
      partnerB_birthCountry,
      partnerB_residenceAddress,
      partnerB_residenceCountry,
      partnerB_parentsMarriedAtBirth,
      partnerB_parentA_Name,
      partnerB_parentA_Surname,
      partnerB_parentB_Name,
      partnerB_parentB_Surname,
      partnerB_partnershipType,
      partnerB_partnershipTypeDissolved,
      partnerB_partnershipState,

      partnerB_marriageNumb,
      partnerB_marriedBefore,
      partnerB_lastMarriageStatus,
      partnerB_additionalParent,
    } = requestInformation;

    console.log(
      `partnerFormB ... `,
      requestInformation.partnerA_formPageComplete,
      requestInformation.partnerB_formPageComplete
    );

    let bloodRelReq = true;
    let useSurnameReq = true;
    let additionalParentsReq = true;
    let marriedBeforeReq = true;
    let partnerB_partnership_dissolved = true;
    let partnerB_lastMarriageStatusReq = true;
    let partnerB_birthStateZip = true;
    let partnershipState = true;
    if (
      partnerB_partnershipType !== PARTNERSHIP_TYPE[0].value &&
      partnerB_partnershipState.length < 2
    ) {
      partnershipState = false;
    }

    const bloodRelDescReq =
      partnerB_bloodRelation && partnerB_bloodRelation == '1' ? true : false;

    if (bloodRelDescReq && partnerB_bloodRelationDesc.length < 1) {
      bloodRelReq = false;
    }

    const surNameTextReq =
      partnerB_useSurname && partnerB_useSurname === '1' ? true : false;

    if (
      (surNameTextReq && partnerB_surName.length < 1) ||
      partnerB_useSurname == ''
    ) {
      useSurnameReq = false;
    }

    const addParentsReq =
      partnerB_additionalParent && partnerB_additionalParent == '1'
        ? true
        : false;

    if (
      (addParentsReq &&
        (partnerB_parentB_Name.length < 1 ||
          partnerB_parentB_Surname.length < 1)) ||
      partnerB_additionalParent == ''
    ) {
      additionalParentsReq = false;
    }

    if (partnerB_birthCountry === 'USA') {
      partnerB_birthStateZip = partnerB_birthState.length > 0 ? true : false;
    }

    const marriedBefore = partnerB_marriedBefore === '1' ? true : false;

    if (partnerB_marriedBefore === '') marriedBeforeReq = false;
    if (marriedBefore && partnerB_marriageNumb === '') marriedBeforeReq = false;

    const getMarriageNumb = (): { label: string; value: string } => {
      let retOb = MARRIAGE_COUNT.find(
        entry => entry.value == partnerB_marriageNumb
      );

      if (!retOb) retOb = { label: '', value: '' };

      return retOb;
    };

    const marriageNumb: { label: string; value: string } = getMarriageNumb();

    if (marriageNumb && marriageNumb.value !== '') {
      if (partnerB_lastMarriageStatus === '') {
        partnerB_lastMarriageStatusReq = false;
      }
    }

    if (partnerB_partnershipType !== PARTNERSHIP_TYPE[0].value) {
      if (partnerB_partnershipTypeDissolved === '') {
        partnerB_partnership_dissolved = false;
      }
    }

    const is_Complete = !!(
      partnerB_firstName &&
      partnerB_lastName &&
      partnerB_dob &&
      partnerB_age &&
      partnerB_occupation &&
      partnerB_bloodRelation &&
      partnerB_birthCity &&
      partnerB_birthCountry &&
      partnerB_residenceAddress &&
      partnerB_residenceCountry &&
      partnerB_parentsMarriedAtBirth &&
      partnerB_partnershipType &&
      partnerB_parentA_Name &&
      partnerB_parentA_Surname &&
      partnerB_partnership_dissolved &&
      partnerB_lastMarriageStatusReq &&
      partnershipState &&
      partnerB_birthStateZip &&
      bloodRelReq &&
      additionalParentsReq &&
      marriedBeforeReq &&
      useSurnameReq
    );

    if (is_Complete) {
      handleFormPageComplete$({
        partnerFlag: 'A',
        val: '1',
        certObj: arguments[0],
      });
    }

    return is_Complete;
  }

  private handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    handleChange$({
      e: event,
      certObj: this.props.marriageIntentionCertificateRequest,
    });
  };

  private handleUseSurnameChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    handleUseSurnameChange$({
      e: event,
      inputName: 'partnerB_useSurname',
      textInput: 'partnerB_surName',
      certObj: this.props.marriageIntentionCertificateRequest,
    });
  };

  private handleAdditionalParentChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    handleAdditionalParentChange$({
      e: event,
      additionalParent: 'partnerB_additionalParent',
      parentB_Name: 'partnerB_parentB_Name',
      parentB_Surname: 'partnerB_parentB_Surname',
      certObj: this.props.marriageIntentionCertificateRequest,
    });
  };

  private handleBloodRelDescChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    handleBloodRelDescChange$({
      e: event,
      partnerA: 'partnerB_bloodRelationDesc',
      partnerB: 'partnerA_bloodRelationDesc',
      certObj: this.props.marriageIntentionCertificateRequest,
    });
  };

  private handleBloodRelChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    handleBloodRelChange$({
      e: event,
      partnerA: 'partnerB_bloodRelation',
      partnerB: 'partnerA_bloodRelation',
      partnerADesc: 'partnerB_bloodRelationDesc',
      partnerBDesc: 'partnerA_bloodRelationDesc',
      certObj: this.props.marriageIntentionCertificateRequest,
    });
  };

  private handleMarriedBeforeChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        ['partnerB_marriedBefore']: event.target.value,
      },
      ''
    );

    if (event.target.value === '0') {
      this.props.marriageIntentionCertificateRequest.answerQuestion(
        {
          ['partnerB_marriageNumb']: '',
        },
        ''
      );
    }
  };

  private handleBirthDateChange = (newDate: Date | null): void => {
    const isDate = this.isDateObj(newDate);
    let age = '';
    if (isDate) {
      age = `${this.calcAge(newDate)}`;
      this.updateAge(age);
    }
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        partnerB_dob: newDate,
      },
      ''
    );
  };

  private handleBirthplaceCountryChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        [event.target.name]: event.target.value,
      },
      ''
    );

    if (event.target.value !== 'USA') {
      this.props.marriageIntentionCertificateRequest.answerQuestion(
        {
          ['partnerB_birthState']: '',
        },
        ''
      );
    }
  };

  private handleResidenceCountryChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        [event.target.name]: event.target.value,
      },
      ''
    );

    if (event.target.value !== 'USA') {
      this.props.marriageIntentionCertificateRequest.answerQuestion(
        {
          ['partnerB_residenceState']: '',
        },
        ''
      );

      this.props.marriageIntentionCertificateRequest.answerQuestion(
        {
          ['partnerB_residenceZip']: '',
        },
        ''
      );
    }
  };

  private handleZipCodeChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const val = event.target.value
      .replace(/[^0-9]/g, '')
      .replace(/(\..*)\./g, '$1');

    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        [event.target.name]: val,
      },
      ''
    );
  };

  private handleResidenceStateChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      partnerB_residenceCity,
      partnerB_residenceCountry,
    } = marriageIntentionCertificateRequest.requestInformation;

    const inlowerCase = partnerB_residenceCity.toLowerCase();
    const isBosNeighborhood = BOSTON_NEIGHBORHOODS.indexOf(inlowerCase);
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        [event.target.name]: event.target.value,
      },
      ''
    );

    if (
      partnerB_residenceCountry === 'USA' &&
      event.target.value === 'MA' &&
      isBosNeighborhood > -1
    ) {
      this.replaceBosNeighborhoods({
        target: {
          name: 'partnerB_residenceCity',
          value: partnerB_residenceCity,
        },
      });
    }
  };

  private replaceBosNeighborhoods = (
    event:
      | ChangeEvent<HTMLInputElement>
      | {
          target: { name: string; value: string };
        }
  ): void => {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      partnerB_residenceCountry,
      partnerB_residenceState,
    } = marriageIntentionCertificateRequest.requestInformation;
    const inlowerCase = event.target.value.toLowerCase();
    const isBosNeighborhood = BOSTON_NEIGHBORHOODS.indexOf(inlowerCase);

    if (
      partnerB_residenceCountry === 'USA' &&
      partnerB_residenceState === 'MA' &&
      isBosNeighborhood > -1
    ) {
      this.props.marriageIntentionCertificateRequest.answerQuestion(
        {
          [event.target.name]: 'Boston',
        },
        ''
      );
    }
  };

  private checkBirthCityForNeighborhood = (): void => {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      partnerB_birthCountry,
      partnerB_birthCity,
      partnerB_birthState,
    } = marriageIntentionCertificateRequest.requestInformation;
    const inlowerCase = partnerB_birthCity.toLowerCase();
    const isBosNeighborhood = BOSTON_NEIGHBORHOODS.indexOf(inlowerCase);

    if (
      partnerB_birthCountry === 'USA' &&
      (partnerB_birthState === 'MA' ||
        partnerB_birthState === 'Massachusetts') &&
      isBosNeighborhood > -1
    ) {
      this.props.marriageIntentionCertificateRequest.answerQuestion(
        {
          ['partnerB_birthCity']: 'Boston',
        },
        ''
      );
    }
  };

  private updateAge = age => {
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        partnerB_age: age,
      },
      ''
    );
  };

  private calcAge = dateObj => {
    const today = new Date();
    let age = today.getFullYear() - dateObj.getFullYear();
    const m = today.getMonth() - dateObj.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dateObj.getDate())) {
      age = age - 1;
    }

    return age;
  };

  private isDateObj = dateObj => {
    if (Object.prototype.toString.call(dateObj) === '[object Date]') {
      return true;
    }
    return false;
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
        handleProceed={this.props.handleProceed}
        handleStepBack={this.props.handleStepBack}
        allowProceed={PartnerForm.isComplete(
          marriageIntentionCertificateRequest
        )}
        nextButtonText={'NEXT'}
      >
        <FieldsetComponent
          legendText={
            <h2 css={PARTNERFORM_HEADER_STYLING}>Person {partner_num}</h2>
          }
        >
          {nameFields({
            partnerFlag: partnerLabel,
            formPageComplete: partnerB_formPageComplete,
            handleChange: this.handleChange,
            handleResidenceStateChange: this.handleResidenceStateChange,
            handleUseSurnameChange: this.handleUseSurnameChange,
            firstName: partnerB_firstName,
            lastName: partnerB_lastName,
            middleName: partnerB_middleName,
            surName: partnerB_surName,
            useSurname: partnerB_useSurname,
            occupation: partnerB_occupation,
            suffix: partnerB_suffix,
          })}

          {datePlaceOfBirth({
            partnerFlag: partnerLabel,
            partnerDOB: partnerB_dob,
            birthCountryStr: partnerB_birthCountry,
            birthStateStr: partnerB_birthState,
            birthCityStr: partnerB_birthCity,
            handleChange: this.handleChange,
            handleBirthplaceCountryChange: this.handleBirthplaceCountryChange,
            checkBirthCityForNeighborhood: this.checkBirthCityForNeighborhood,
            handleBirthDateChange: this.handleBirthDateChange,
          })}

          {residence({
            partnerFlag: partnerLabel,
            residenceZipStr: partnerB_residenceZip,
            residenceCityStr: partnerB_residenceCity,
            residenceStateStr: partnerB_residenceState,
            residenceAddressStr: partnerB_residenceAddress,
            residenceCountryStr: partnerB_residenceCountry,
            handleChange: this.handleChange,
            handleZipCodeChange: this.handleZipCodeChange,
            replaceBosNeighborhoods: this.replaceBosNeighborhoods,
            handleResidenceStateChange: this.handleResidenceStateChange,
            handleResidenceCountryChange: this.handleResidenceCountryChange,
          })}

          {marriageBlock({
            partnerFlag: partnerLabel,
            bloodRelation: partnerB_bloodRelation,
            bloodRelationDesc: partnerB_bloodRelationDesc,
            marriedBefore: partnerB_marriedBefore,
            marriageNumb: partnerB_marriageNumb,
            lastMarriageStatus: partnerB_lastMarriageStatus,

            partnershipType: partnerB_partnershipType,
            partnershipState: partnerB_partnershipState,
            partnershipTypeDissolved: partnerB_partnershipTypeDissolved,

            handleChange: this.handleChange,
            handleBloodRelChange: this.handleBloodRelChange,
            handleBloodRelDescChange: this.handleBloodRelDescChange,
            handleMarriedBeforeChange: this.handleMarriedBeforeChange,
          })}

          {parents({
            partnerFlag: partnerLabel,
            parentA_Name: partnerB_parentA_Name,
            parentA_Surname: partnerB_parentA_Surname,
            parentB_Name: partnerB_parentB_Name,
            parentB_Surname: partnerB_parentB_Surname,
            additionalParent: partnerB_additionalParent,
            parentsMarriedAtBirth: partnerB_parentsMarriedAtBirth,
            handleChange: this.handleChange,
            handleAdditionalParentChange: this.handleAdditionalParentChange,
          })}
        </FieldsetComponent>
      </QuestionComponent>
    );
  }
}
