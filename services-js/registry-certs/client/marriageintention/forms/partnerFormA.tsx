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
      partnerA_firstName,
      partnerA_lastName,
      partnerA_surName,
      partnerA_dob,
      partnerA_age,
      partnerA_occupation,
      partnerA_residenceAddress,
      partnerA_residenceCountry,
      partnerA_bloodRelation,
      partnerA_bloodRelationDesc,
      partnerA_parentsMarriedAtBirth,
      partnerA_parentA_Name,
      partnerA_parentA_Surname,
      partnerA_parentB_Name,
      partnerA_parentB_Surname,
      partnerA_birthCity,
      partnerA_birthState,
      partnerA_birthCountry,
      partnerA_partnershipType,
      partnerA_partnershipTypeDissolved,
      partnerA_partnershipState,

      partnerA_marriageNumb,
      partnerA_lastMarriageStatus,
    } = requestInformation;

    let bloodRelReq = true;
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

    if (partnerA_birthCountry === 'USA') {
      partnerA_birthStateZip = partnerA_birthState.length > 0 ? true : false;
    }

    if (bloodRelDescReq && partnerA_bloodRelationDesc.length < 1) {
      bloodRelReq = false;
    }

    const marriageNumb = MARRIAGE_COUNT.find(
      entry => entry.value === partnerA_marriageNumb
    );
    if (marriageNumb && marriageNumb.value !== MARRIAGE_COUNT[0].value) {
      if (partnerA_lastMarriageStatus === '') {
        partnerA_lastMarriageStatusReq = false;
      }
    }

    if (partnerA_partnershipType !== PARTNERSHIP_TYPE[0].value) {
      if (partnerA_partnershipTypeDissolved === '') {
        partnerA_partnership_dissolved = false;
      }
    }

    return !!(
      partnerA_firstName &&
      partnerA_lastName &&
      partnerA_surName &&
      partnerA_dob &&
      partnerA_age &&
      partnerA_bloodRelation &&
      bloodRelReq &&
      partnerA_parentsMarriedAtBirth &&
      partnerA_parentA_Name &&
      partnerA_parentA_Surname &&
      partnerA_parentB_Name &&
      partnerA_parentB_Surname &&
      partnerA_birthCity &&
      partnerA_birthCountry &&
      partnerA_partnershipType &&
      partnerA_partnership_dissolved &&
      partnerA_marriageNumb &&
      partnerA_lastMarriageStatusReq &&
      partnerA_residenceAddress &&
      partnerA_residenceCountry &&
      partnerA_occupation &&
      partnershipState &&
      partnerA_birthStateZip
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

  private updateAge = age => {
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        partnerA_age: age,
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
      partnerA_marriageNumb,
      partnerA_lastMarriageStatus,
      partnerA_firstName,
      partnerA_lastName,
      partnerA_middleName,
      partnerA_surName,
      partnerA_occupation,
      partnerA_suffix,
      partnerA_dob,
      partnerA_age,
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
    } = marriageIntentionCertificateRequest.requestInformation;
    const marriageNumb = MARRIAGE_COUNT.find(
      entry => entry.value === partnerA_marriageNumb
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
            firstName: partnerA_firstName,
            lastName: partnerA_lastName,
            middleName: partnerA_middleName,
            surName: partnerA_surName,
            occupation: partnerA_occupation,
            suffix: partnerA_suffix,
          })}
          {dateOfBirth({
            partnerDOB: partnerA_dob,
            partnerAge: partnerA_age,
            partnerFlag: partnerLabel,
            handleChange: this.handleChange,
            handleBirthDateChange: this.handleBirthDateChange,
          })}
          {birthPlace({
            partnerFlag: partnerLabel,
            birthCityStr: partnerA_birthCity,
            birthCountryStr: partnerA_birthCountry,
            birthStateStr: partnerA_birthState,
            handleChange: this.handleChange,
            handleBirthplaceCountryChange: this.handleBirthplaceCountryChange,
            checkBirthCityForNeighborhood: this.checkBirthCityForNeighborhood,
          })}
          {residence({
            partnerFlag: partnerLabel,
            marriageNumb: partnerA_marriageNumb,
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

          {marriageNumb &&
            marriageNumb.value !== MARRIAGE_COUNT[0].value &&
            lastMarriageStatus({
              partnerFlag: partnerLabel,
              handleChange: this.handleChange,
              lastMarriageStatus: partnerA_lastMarriageStatus,
            })}

          {partnershipType({
            partnerFlag: partnerLabel,
            partnershipType: partnerA_partnershipType,
            partnershipState: partnerA_partnershipState,
            partnershipTypeDissolved: partnerA_partnershipTypeDissolved,
            handleChange: this.handleChange,
          })}
          {parents({
            partnerFlag: partnerLabel,
            parentA_Name: partnerA_parentA_Name,
            parentA_Surname: partnerA_parentA_Surname,
            parentB_Name: partnerA_parentB_Name,
            parentB_Surname: partnerA_parentB_Surname,
            handleChange: this.handleChange,
          })}
          {parentsMarried({
            partnerFlag: partnerLabel,
            parentsMarriedAtBirth: partnerA_parentsMarriedAtBirth,
            handleChange: this.handleChange,
          })}
          {bloodRelation({
            partnerFlag: partnerLabel,
            bloodRelation: partnerA_bloodRelation,
            bloodRelationDesc: partnerA_bloodRelationDesc,
            handleBloodRelChange: this.handleBloodRelChange,
            handleBloodRelDescChange: this.handleBloodRelDescChange,
          })}
        </FieldsetComponent>
      </QuestionComponent>
    );
  }
}
