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

import { isPartnerFormPageComplete } from '../../marriageintention/helpers/formUtils';

interface Props {
  marriageIntentionCertificateRequest: MarriageIntentionCertificateRequest;
  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
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
  showDisclaimer?: boolean;
  backTrackingDisclaimer?: boolean;
  disclaimerModalHandler: () => void;
  toggleDisclaimerModal: (val?: boolean) => {};
}

@observer
export default class PartnerForm extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public static isComplete({
    requestInformation,
  }: MarriageIntentionCertificateRequest): boolean {
    return isPartnerFormPageComplete('B', requestInformation);
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

  private advanceForm = (certObj: any) => {
    handleFormPageComplete$({
      partnerFlag: 'B',
      val: '1',
      certObj,
    });
    this.props.handleProceed(certObj);
  };

  private handleStepBack = (ev: MouseEvent) => {
    if (this.props.backTrackingDisclaimer === false) {
      this.props.toggleDisclaimerModal();
      // this.props.handleStepBack(ev);
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
            handleChange: this.handleChange,
            handleResidenceStateChange: this.handleResidenceStateChange,
            handleUseSurnameChange: this.handleUseSurnameChange,
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
            handleChange: this.handleChange,
            handleBirthplaceCountryChange: this.handleBirthplaceCountryChange,
            checkBirthCityForNeighborhood: this.checkBirthCityForNeighborhood,
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

            handleChange: this.handleChange,
            handleBloodRelChange: this.handleBloodRelChange,
            handleBloodRelDescChange: this.handleBloodRelDescChange,
            handleMarriedBeforeChange: this.handleMarriedBeforeChange,
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
