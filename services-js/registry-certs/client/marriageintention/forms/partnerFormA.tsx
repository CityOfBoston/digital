/** @jsx jsx */

import { jsx } from '@emotion/core';

import { ChangeEvent, Component, MouseEvent } from 'react';

import { observer } from 'mobx-react';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';

import QuestionComponent from '../../common/question-components/QuestionComponent';

import FieldsetComponent from '../../common/question-components/FieldsetComponent';

import { BOSTON_NEIGHBORHOODS } from './inputData';

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
  handleFormPageComplete$,
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
    return isPartnerFormPageComplete('A', requestInformation);
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
            handleChange: this.handleChange,
            handleResidenceStateChange: this.handleResidenceStateChange,
            handleUseSurnameChange: this.handleUseSurnameChange,
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
            handleChange: this.handleChange,
            handleBirthplaceCountryChange: this.handleBirthplaceCountryChange,
            checkBirthCityForNeighborhood: this.checkBirthCityForNeighborhood,
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
            handleChange: this.handleChange,
            handleZipCodeChange: this.handleZipCodeChange,
            replaceBosNeighborhoods: this.replaceBosNeighborhoods,
            handleResidenceStateChange: this.handleResidenceStateChange,
            handleResidenceCountryChange: this.handleResidenceCountryChange,
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

            handleChange: this.handleChange,
            handleBloodRelChange: this.handleBloodRelChange,
            handleBloodRelDescChange: this.handleBloodRelDescChange,
            handleMarriedBeforeChange: this.handleMarriedBeforeChange,
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
            handleChange: this.handleChange,
            handleAdditionalParentChange: this.handleAdditionalParentChange,
            formErrors: this.props.formErrors,
            errorElemSrc: this.props.errorElemSrc,
            refs: this.props.refObjs.parentsRef,
          })}
        </FieldsetComponent>
      </QuestionComponent>
    );
  }
}
