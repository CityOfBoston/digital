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
  datePlaceOfBirth,
  residence,
  marriageBlock,
  parents,
  PARTNERFORM_HEADER_STYLING,
} from './partnerFormUI';

import {
  handleChange$,
  handleUseSurnameChange$,
  handleAdditionalParentChange$,
  handleBloodRelDescChange$,
  handleBloodRelChange$,
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
      partnerA_firstName,
      partnerA_lastName,
      partnerA_dob,
      partnerA_age,
      partnerA_surName,
      partnerA_useSurname,
      partnerA_occupation,
      partnerA_bloodRelation,
      partnerA_bloodRelationDesc,
      partnerA_birthCity,
      partnerA_birthState,
      partnerA_birthCountry,
      partnerA_residenceAddress,
      partnerA_residenceCountry,
      partnerA_parentsMarriedAtBirth,
      partnerA_parentA_Name,
      partnerA_parentA_Surname,
      partnerA_parentB_Name,
      partnerA_parentB_Surname,
      partnerA_partnershipType,
      partnerA_partnershipTypeDissolved,
      partnerA_partnershipState,

      partnerA_marriageNumb,
      partnerA_marriedBefore,
      partnerA_lastMarriageStatus,
      partnerA_additionalParent,
    } = requestInformation;

    let bloodRelReq = true;
    let useSurnameReq = true;
    let additionalParentsReq = true;
    let marriedBeforeReq = true;
    let partnerA_partnership_dissolved = true;
    let partnerA_lastMarriageStatusReq = true;
    let partnerA_birthStateZip = true;
    let partnershipState = true;
    if (
      partnerA_partnershipType !== PARTNERSHIP_TYPE[0].value &&
      partnerA_partnershipState.length < 2
    ) {
      partnershipState = false;
    }

    const bloodRelDescReq =
      partnerA_bloodRelation && partnerA_bloodRelation == '1' ? true : false;

    if (bloodRelDescReq && partnerA_bloodRelationDesc.length < 1) {
      bloodRelReq = false;
    }

    const surNameTextReq =
      partnerA_useSurname && partnerA_useSurname === '1' ? true : false;

    if (
      (surNameTextReq && partnerA_surName.length < 1) ||
      partnerA_useSurname == ''
    ) {
      useSurnameReq = false;
    }

    const addParentsReq =
      partnerA_additionalParent && partnerA_additionalParent == '1'
        ? true
        : false;

    if (
      (addParentsReq &&
        (partnerA_parentB_Name.length < 1 ||
          partnerA_parentB_Surname.length < 1)) ||
      partnerA_additionalParent == ''
    ) {
      additionalParentsReq = false;
    }

    if (partnerA_birthCountry === 'USA') {
      partnerA_birthStateZip = partnerA_birthState.length > 0 ? true : false;
    }

    const marriedBefore = partnerA_marriedBefore === '1' ? true : false;

    if (partnerA_marriedBefore === '') marriedBeforeReq = false;
    if (marriedBefore && partnerA_marriageNumb === '') marriedBeforeReq = false;

    const getMarriageNumb = (): { label: string; value: string } => {
      let retOb = MARRIAGE_COUNT.find(
        entry => entry.value == partnerA_marriageNumb
      );

      if (!retOb) retOb = { label: '', value: '' };

      return retOb;
    };

    const marriageNumb: { label: string; value: string } = getMarriageNumb();

    if (marriageNumb && marriageNumb.value !== '') {
      if (partnerA_lastMarriageStatus === '') {
        partnerA_lastMarriageStatusReq = false;
      }
    }

    if (partnerA_partnershipType !== PARTNERSHIP_TYPE[0].value) {
      if (partnerA_partnershipTypeDissolved === '') {
        partnerA_partnership_dissolved = false;
      }
    }

    const is_Complete = !!(
      partnerA_firstName &&
      partnerA_lastName &&
      partnerA_dob &&
      partnerA_age &&
      partnerA_occupation &&
      partnerA_bloodRelation &&
      partnerA_birthCity &&
      partnerA_birthCountry &&
      partnerA_residenceAddress &&
      partnerA_residenceCountry &&
      partnerA_parentsMarriedAtBirth &&
      partnerA_partnershipType &&
      partnerA_parentA_Name &&
      partnerA_parentA_Surname &&
      partnerA_partnership_dissolved &&
      partnerA_lastMarriageStatusReq &&
      partnershipState &&
      partnerA_birthStateZip &&
      bloodRelReq &&
      additionalParentsReq &&
      marriedBeforeReq &&
      useSurnameReq
    );

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
      inputName: 'partnerA_useSurname',
      textInput: 'partnerA_surName',
      certObj: this.props.marriageIntentionCertificateRequest,
    });
  };

  private handleAdditionalParentChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    handleAdditionalParentChange$({
      e: event,
      additionalParent: 'partnerA_additionalParent',
      parentB_Name: 'partnerA_parentB_Name',
      parentB_Surname: 'partnerA_parentB_Surname',
      certObj: this.props.marriageIntentionCertificateRequest,
    });
  };

  private handleBloodRelDescChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    handleBloodRelDescChange$({
      e: event,
      partnerA: 'partnerA_bloodRelationDesc',
      partnerB: 'partnerB_bloodRelationDesc',
      certObj: this.props.marriageIntentionCertificateRequest,
    });
  };

  private handleBloodRelChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    handleBloodRelChange$({
      e: event,
      partnerA: 'partnerA_bloodRelation',
      partnerB: 'partnerB_bloodRelation',
      partnerADesc: 'partnerA_bloodRelationDesc',
      partnerBDesc: 'partnerB_bloodRelationDesc',
      certObj: this.props.marriageIntentionCertificateRequest,
    });
  };

  private handleMarriedBeforeChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        ['partnerA_marriedBefore']: event.target.value,
      },
      ''
    );

    if (event.target.value === '0') {
      this.props.marriageIntentionCertificateRequest.answerQuestion(
        {
          ['partnerA_marriageNumb']: '',
        },
        ''
      );
    }
  };

  private handleBirthDateChange = (newDate): void => {
    const isDate = this.isDateObj(newDate);
    let age = '';
    if (isDate) {
      age = `${this.calcAge(newDate)}`;
      this.updateAge(age);
    }
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        partnerA_dob: newDate,
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
          ['partnerA_birthState']: '',
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
          ['partnerA_residenceState']: '',
        },
        ''
      );

      this.props.marriageIntentionCertificateRequest.answerQuestion(
        {
          ['partnerA_residenceZip']: '',
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
      partnerA_residenceCity,
      partnerA_residenceCountry,
    } = marriageIntentionCertificateRequest.requestInformation;

    const inlowerCase = partnerA_residenceCity.toLowerCase();
    const isBosNeighborhood = BOSTON_NEIGHBORHOODS.indexOf(inlowerCase);
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        [event.target.name]: event.target.value,
      },
      ''
    );

    if (
      partnerA_residenceCountry === 'USA' &&
      event.target.value === 'MA' &&
      isBosNeighborhood > -1
    ) {
      this.replaceBosNeighborhoods({
        target: {
          name: 'partnerA_residenceCity',
          value: partnerA_residenceCity,
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
      partnerA_residenceCountry,
      partnerA_residenceState,
    } = marriageIntentionCertificateRequest.requestInformation;
    const inlowerCase = event.target.value.toLowerCase();
    const isBosNeighborhood = BOSTON_NEIGHBORHOODS.indexOf(inlowerCase);

    if (
      partnerA_residenceCountry === 'USA' &&
      partnerA_residenceState === 'MA' &&
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
      partnerA_birthCountry,
      partnerA_birthCity,
      partnerA_birthState,
    } = marriageIntentionCertificateRequest.requestInformation;
    const inlowerCase = partnerA_birthCity.toLowerCase();
    const isBosNeighborhood = BOSTON_NEIGHBORHOODS.indexOf(inlowerCase);

    if (
      partnerA_birthCountry === 'USA' &&
      (partnerA_birthState === 'MA' ||
        partnerA_birthState === 'Massachusetts') &&
      isBosNeighborhood > -1
    ) {
      this.props.marriageIntentionCertificateRequest.answerQuestion(
        {
          ['partnerA_birthCity']: 'Boston',
        },
        ''
      );
    }
  };

  private updateAge = (age: string) => {
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        partnerA_age: age,
      },
      ''
    );
  };

  private calcAge = (dateObj: Date) => {
    const today = new Date();
    let age = today.getFullYear() - dateObj.getFullYear();
    const m = today.getMonth() - dateObj.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dateObj.getDate())) {
      age = age - 1;
    }

    return age;
  };

  private isDateObj = (dateObj: Date | null) => {
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
            handleChange: this.handleChange,
            handleResidenceStateChange: this.handleResidenceStateChange,
            handleUseSurnameChange: this.handleUseSurnameChange,
            firstName: partnerA_firstName,
            lastName: partnerA_lastName,
            middleName: partnerA_middleName,
            surName: partnerA_surName,
            useSurname: partnerA_useSurname,
            occupation: partnerA_occupation,
            suffix: partnerA_suffix,
          })}

          {datePlaceOfBirth({
            partnerFlag: partnerLabel,
            partnerDOB: partnerA_dob,
            birthCountryStr: partnerA_birthCountry,
            birthStateStr: partnerA_birthState,
            birthCityStr: partnerA_birthCity,
            handleChange: this.handleChange,
            handleBirthplaceCountryChange: this.handleBirthplaceCountryChange,
            checkBirthCityForNeighborhood: this.checkBirthCityForNeighborhood,
            handleBirthDateChange: this.handleBirthDateChange,
          })}

          {residence({
            partnerFlag: partnerLabel,
            residenceZipStr: partnerA_residenceZip,
            residenceCityStr: partnerA_residenceCity,
            residenceStateStr: partnerA_residenceState,
            residenceAddressStr: partnerA_residenceAddress,
            residenceCountryStr: partnerA_residenceCountry,
            handleChange: this.handleChange,
            handleZipCodeChange: this.handleZipCodeChange,
            replaceBosNeighborhoods: this.replaceBosNeighborhoods,
            handleResidenceStateChange: this.handleResidenceStateChange,
            handleResidenceCountryChange: this.handleResidenceCountryChange,
          })}

          {marriageBlock({
            partnerFlag: partnerLabel,
            bloodRelation: partnerA_bloodRelation,
            bloodRelationDesc: partnerA_bloodRelationDesc,
            marriedBefore: partnerA_marriedBefore,
            marriageNumb: partnerA_marriageNumb,
            lastMarriageStatus: partnerA_lastMarriageStatus,

            partnershipType: partnerA_partnershipType,
            partnershipState: partnerA_partnershipState,
            partnershipTypeDissolved: partnerA_partnershipTypeDissolved,

            handleChange: this.handleChange,
            handleBloodRelChange: this.handleBloodRelChange,
            handleBloodRelDescChange: this.handleBloodRelDescChange,
            handleMarriedBeforeChange: this.handleMarriedBeforeChange,
          })}

          {parents({
            partnerFlag: partnerLabel,
            parentA_Name: partnerA_parentA_Name,
            parentA_Surname: partnerA_parentA_Surname,
            parentB_Name: partnerA_parentB_Name,
            parentB_Surname: partnerA_parentB_Surname,
            additionalParent: partnerA_additionalParent,
            parentsMarriedAtBirth: partnerA_parentsMarriedAtBirth,
            handleChange: this.handleChange,
            handleAdditionalParentChange: this.handleAdditionalParentChange,
          })}
        </FieldsetComponent>
      </QuestionComponent>
    );
  }
}
