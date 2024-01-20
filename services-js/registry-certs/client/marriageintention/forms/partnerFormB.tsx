/** @jsx jsx */

import { jsx } from '@emotion/core';

import { ChangeEvent, Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';
import QuestionComponent from '../../common/question-components/QuestionComponent';
import FieldsetComponent from '../../common/question-components/FieldsetComponent';

import { SECTION_HEADING_STYLING } from '../../common/question-components/styling';

import {
  PARTNERSHIP_TYPE,
  MARRIAGE_COUNT,
  BOSTON_NEIGHBORHOODS,
} from './inputData';

import {
  lastMarriageStatus,
  nameFields,
  dateOfBirth,
  birthPlace,
  residence,
  bloodRelation,
  parentsMarried,
  parents,
  partnershipType,
} from './partnerFormUI';

interface Props {
  marriageIntentionCertificateRequest: MarriageIntentionCertificateRequest;
  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
  partnerLabel: string;
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
      partnerB_surName,
      partnerB_dob,
      partnerB_age,
      partnerB_occupation,
      partnerB_residenceAddress,
      partnerB_residenceCountry,
      partnerB_bloodRelation,
      partnerB_bloodRelationDesc,
      partnerB_parentsMarriedAtBirth,
      partnerB_parentA_Name,
      partnerB_parentA_Surname,
      partnerB_parentB_Name,
      partnerB_parentB_Surname,
      partnerB_birthCity,
      partnerB_birthState,
      partnerB_birthCountry,
      partnerB_partnershipType,
      partnerB_partnershipTypeDissolved,
      partnerB_partnershipState,

      partnerB_marriageNumb,
      partnerB_lastMarriageStatus,
    } = requestInformation;

    let bloodRelReq = true;
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

    if (partnerB_birthCountry === 'USA') {
      partnerB_birthStateZip = partnerB_birthState.length > 0 ? true : false;
    }

    if (bloodRelDescReq && partnerB_bloodRelationDesc.length < 1) {
      bloodRelReq = false;
    }

    const marriageNumb = MARRIAGE_COUNT.find(
      entry => entry.value === partnerB_marriageNumb
    );
    if (marriageNumb && marriageNumb.value !== MARRIAGE_COUNT[0].value) {
      if (partnerB_lastMarriageStatus === '') {
        partnerB_lastMarriageStatusReq = false;
      }
    }

    if (partnerB_partnershipType !== PARTNERSHIP_TYPE[0].value) {
      if (partnerB_partnershipTypeDissolved === '') {
        partnerB_partnership_dissolved = false;
      }
    }

    return !!(
      partnerB_firstName &&
      partnerB_lastName &&
      partnerB_surName &&
      partnerB_dob &&
      partnerB_age &&
      partnerB_bloodRelation &&
      bloodRelReq &&
      partnerB_parentsMarriedAtBirth &&
      partnerB_parentA_Name &&
      partnerB_parentA_Surname &&
      partnerB_parentB_Name &&
      partnerB_parentB_Surname &&
      partnerB_birthCity &&
      partnerB_birthCountry &&
      partnerB_partnershipType &&
      partnerB_partnership_dissolved &&
      partnerB_marriageNumb &&
      partnerB_lastMarriageStatusReq &&
      partnerB_residenceAddress &&
      partnerB_residenceCountry &&
      partnerB_occupation &&
      partnershipState &&
      partnerB_birthStateZip
    );
  }

  private handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        [event.target.name]: event.target.value,
      },
      ''
    );
  };

  private handleBloodRelDescChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        ['partnerA_bloodRelationDesc']: event.target.value,
      },
      ''
    );

    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        ['partnerB_bloodRelationDesc']: event.target.value,
      },
      ''
    );
  };

  private handleBloodRelChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        ['partnerA_bloodRelation']: event.target.value,
      },
      ''
    );

    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        ['partnerB_bloodRelation']: event.target.value,
      },
      ''
    );

    if (event.target.value === '0') {
      this.props.marriageIntentionCertificateRequest.answerQuestion(
        {
          ['partnerA_bloodRelationDesc']: '',
        },
        ''
      );

      this.props.marriageIntentionCertificateRequest.answerQuestion(
        {
          ['partnerB_bloodRelationDesc']: '',
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
    const { marriageIntentionCertificateRequest, partnerLabel } = this.props;
    const {
      partnerB_marriageNumb,
      partnerB_lastMarriageStatus,
      partnerB_firstName,
      partnerB_lastName,
      partnerB_middleName,
      partnerB_surName,
      partnerB_occupation,
      partnerB_suffix,
      partnerB_dob,
      partnerB_age,
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
    } = marriageIntentionCertificateRequest.requestInformation;
    const marriageNumb = MARRIAGE_COUNT.find(
      entry => entry.value === partnerB_marriageNumb
    );

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
            <h2 css={SECTION_HEADING_STYLING}>Person {partnerLabel}</h2>
          }
        >
          {nameFields({
            partnerFlag: partnerLabel,
            handleChange: this.handleChange,
            handleResidenceStateChange: this.handleResidenceStateChange,
            firstName: partnerB_firstName,
            lastName: partnerB_lastName,
            middleName: partnerB_middleName,
            surName: partnerB_surName,
            occupation: partnerB_occupation,
            suffix: partnerB_suffix,
          })}
          {dateOfBirth({
            partnerDOB: partnerB_dob,
            partnerAge: partnerB_age,
            partnerFlag: partnerLabel,
            handleChange: this.handleChange,
            handleBirthDateChange: this.handleBirthDateChange,
          })}
          {birthPlace({
            partnerFlag: partnerLabel,
            birthCityStr: partnerB_birthCity,
            birthCountryStr: partnerB_birthCountry,
            birthStateStr: partnerB_birthState,
            handleChange: this.handleChange,
            handleBirthplaceCountryChange: this.handleBirthplaceCountryChange,
            checkBirthCityForNeighborhood: this.checkBirthCityForNeighborhood,
          })}
          {residence({
            partnerFlag: partnerLabel,
            marriageNumb: partnerB_marriageNumb,
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

          {marriageNumb &&
            marriageNumb.value !== MARRIAGE_COUNT[0].value &&
            lastMarriageStatus({
              partnerFlag: partnerLabel,
              handleChange: this.handleChange,
              lastMarriageStatus: partnerB_lastMarriageStatus,
            })}

          {partnershipType({
            partnerFlag: partnerLabel,
            partnershipType: partnerB_partnershipType,
            partnershipState: partnerB_partnershipState,
            partnershipTypeDissolved: partnerB_partnershipTypeDissolved,
            handleChange: this.handleChange,
          })}
          {parents({
            partnerFlag: partnerLabel,
            parentA_Name: partnerB_parentA_Name,
            parentA_Surname: partnerB_parentA_Surname,
            parentB_Name: partnerB_parentB_Name,
            parentB_Surname: partnerB_parentB_Surname,
            handleChange: this.handleChange,
          })}
          {parentsMarried({
            partnerFlag: partnerLabel,
            parentsMarriedAtBirth: partnerB_parentsMarriedAtBirth,
            handleChange: this.handleChange,
          })}
          {bloodRelation({
            partnerFlag: partnerLabel,
            bloodRelation: partnerB_bloodRelation,
            bloodRelationDesc: partnerB_bloodRelationDesc,
            handleBloodRelChange: this.handleBloodRelChange,
            handleBloodRelDescChange: this.handleBloodRelDescChange,
          })}
        </FieldsetComponent>
      </QuestionComponent>
    );
  }
}
