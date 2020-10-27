/** @jsx jsx */

import { jsx } from '@emotion/core';

import { ChangeEvent, Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';

import {
  TextInput,
  MemorableDateInput,
  RadioGroup,
  SelectDropdown,
} from '@cityofboston/react-fleet';

import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';

import QuestionComponent from '../../common/question-components/QuestionComponent';
import FieldsetComponent from '../../common/question-components/FieldsetComponent';

import {
  SECTION_HEADING_STYLING,
  SECTION_WRAPPER_STYLING,
  NAME_FIELDS_CONTAINER_STYLING,
  NAME_FIELDS_BASIC_CONTAINER_STYLING,
  HEADER_SPACING_STYLING,
  RADIOGROUP_CONTAINER_STYLING,
  HEADER_PADDING_TOP_STYLING,
  OVERRIDE_SELECT_DISPLAY_STYLING,
  MARRIAGE_INTENTION_FORM_STYLING,
} from '../../common/question-components/styling';

import {
  ONE_AND_HALF_MARGINBOTTOM,
  BOTTOM_SPACING_STYLING,
  TWO_AND_HALF_MARGINBOTTOM,
} from './styling';

import {
  SEX_CHECKBOX,
  BOOL_RADIOGROUP,
  COUNTRIES,
  PARTNERSHIP_TYPE_DISSOLVED,
  PARTNERSHIP_TYPE,
  MARRIAGE_COUNT,
  US_STATES,
  LAST_MARRIAGE_STATUS,
  BOSTON_NEIGHBORHOODS,
  SUFFIX_OPTIONS,
} from './inputData';

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
      partnerA_sex,
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
      partnerA_suffix,

      partnerA_marriageNumb,
      partnerA_lastMarriageStatus,
    } = requestInformation;

    let bloodRelReq = true;
    let partnerA_partnership_dissolved = true;
    let partnerA_lastMarriageStatusReq = true;
    let partnerA_birthStateZip = true;
    let suffix = partnerA_suffix && partnerA_suffix.length > 0 ? true : false;
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
      partnerA_sex &&
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
      suffix &&
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

  private handleResidenceCountryChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        [event.target.name]: event.target.value,
      },
      ''
    );
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
          {this.nameFields()}
          {this.dateOfBirth()}
          {this.birthPlace()}
          {this.residence()}

          {marriageNumb &&
            marriageNumb.value !== MARRIAGE_COUNT[0].value &&
            this.lastMarriageStatus()}

          {this.partnershipType()}
          {this.parents()}
          {this.sex()}
          {this.parentsMarried()}
          {this.bloodRelation()}

          {/* {this.showDeepPartnerData()} */}
        </FieldsetComponent>
      </QuestionComponent>
    );
  }

  // UI ELEMENTS
  // -----------

  lastMarriageStatus() {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      partnerA_lastMarriageStatus,
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <div
          css={[
            NAME_FIELDS_BASIC_CONTAINER_STYLING,
            HEADER_SPACING_STYLING,
            BOTTOM_SPACING_STYLING,
          ]}
        >
          <h2 css={SECTION_HEADING_STYLING}>
            If Applicable, Status of Last Marriage
          </h2>

          <div css={RADIOGROUP_CONTAINER_STYLING}>
            <RadioGroup
              items={LAST_MARRIAGE_STATUS}
              name="partnerA_lastMarriageStatus"
              checkedValue={partnerA_lastMarriageStatus}
              handleItemChange={this.handleChange}
              groupLabel=""
              hideLabel
            />

            <label className="notice">
              If void, please provide clerk with evidence.
            </label>
          </div>
        </div>
      </div>
    );
  }

  residenceStateZip() {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      partnerA_residenceState,
      partnerA_residenceZip,
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <div>
        <div css={NAME_FIELDS_CONTAINER_STYLING}>
          <div css={OVERRIDE_SELECT_DISPLAY_STYLING}>
            <div className="fs-c m-b300">
              <div className="sel">
                <SelectDropdown
                  label="Residence State"
                  hideBlankOption
                  options={US_STATES}
                  name={'partnerA_residenceState'}
                  value={partnerA_residenceState}
                  onChange={this.handleResidenceStateChange}
                />
              </div>
            </div>
          </div>
        </div>

        <TextInput
          label="Residence Zip Code"
          name="partnerA_residenceZip"
          value={partnerA_residenceZip}
          onChange={this.handleZipCodeChange}
          disableLabelNoWrap={true}
          maxLength={10}
          minLength={5}
        />
      </div>
    );
  }

  residence() {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      partnerA_residenceAddress,
      partnerA_residenceCountry,
      partnerA_residenceCity,
      partnerA_marriageNumb,
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
          <h2 css={SECTION_HEADING_STYLING}>Residence</h2>
        </div>

        <div
          css={[TWO_AND_HALF_MARGINBOTTOM, NAME_FIELDS_BASIC_CONTAINER_STYLING]}
        >
          <TextInput
            label="Residence Address"
            name="partnerA_residenceAddress"
            value={partnerA_residenceAddress}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
            optionalDescription={
              'Please include your apartment number if that applies.'
            }
            maxLength={100}
          />

          <TextInput
            label="Residence City/Town"
            name="partnerA_residenceCity"
            value={partnerA_residenceCity}
            onChange={this.handleChange}
            onBlur={this.replaceBosNeighborhoods}
            disableLabelNoWrap={true}
            optionalDescription={
              "For Boston residents: Please put 'Boston' as the City, do not use neighborhood names."
            }
            maxLength={100}
          />

          <div
            css={[
              NAME_FIELDS_BASIC_CONTAINER_STYLING,
              OVERRIDE_SELECT_DISPLAY_STYLING,
            ]}
          >
            <div className="fs-c m-b300">
              <div className="sel">
                <SelectDropdown
                  label="Select Country of Residence"
                  // hideBlankOption
                  options={COUNTRIES}
                  name={'partnerA_residenceCountry'}
                  value={partnerA_residenceCountry}
                  onChange={this.handleResidenceCountryChange}
                  disableLabelNoWrap={true}
                />
              </div>
            </div>
          </div>

          {partnerA_residenceCountry === 'USA' && this.residenceStateZip()}

          <div
            css={[
              NAME_FIELDS_BASIC_CONTAINER_STYLING,
              OVERRIDE_SELECT_DISPLAY_STYLING,
            ]}
          >
            <div className="fs-c m-b300">
              <div className="sel">
                <SelectDropdown
                  label="This Marriage is your ..."
                  // hideBlankOption
                  options={MARRIAGE_COUNT}
                  name={'partnerA_marriageNumb'}
                  value={partnerA_marriageNumb}
                  onChange={this.handleChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  partnershipType() {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      partnerA_partnershipType,
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <div
          css={[
            NAME_FIELDS_BASIC_CONTAINER_STYLING,
            HEADER_SPACING_STYLING,
            BOTTOM_SPACING_STYLING,
          ]}
        >
          <h2 css={SECTION_HEADING_STYLING}>Were you ever a member of a ...</h2>

          <div css={RADIOGROUP_CONTAINER_STYLING}>
            <RadioGroup
              items={PARTNERSHIP_TYPE}
              name="partnerA_partnershipType"
              checkedValue={partnerA_partnershipType}
              handleItemChange={this.handleChange}
              groupLabel=""
              hideLabel
            />
          </div>
        </div>

        {partnerA_partnershipType &&
          (partnerA_partnershipType === 'CIV' ||
            partnerA_partnershipType === 'DOM') &&
          this.dissolved()}
      </div>
    );
  }

  dissolved() {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      partnerA_partnershipTypeDissolved,
      partnerA_partnershipState,
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <div
        css={[
          NAME_FIELDS_BASIC_CONTAINER_STYLING,
          HEADER_SPACING_STYLING,
          BOTTOM_SPACING_STYLING,
        ]}
      >
        <h3 css={SECTION_HEADING_STYLING}>
          Civil Union Or Domestic Partnership: Dissolved
        </h3>

        <div css={RADIOGROUP_CONTAINER_STYLING}>
          <RadioGroup
            items={PARTNERSHIP_TYPE_DISSOLVED}
            name="partnerA_partnershipTypeDissolved"
            checkedValue={partnerA_partnershipTypeDissolved}
            handleItemChange={this.handleChange}
            groupLabel=""
            hideLabel
          />
        </div>

        <TextInput
          label="Partnership State/Country"
          name="partnerA_partnershipState"
          value={partnerA_partnershipState}
          onChange={this.handleChange}
          disableLabelNoWrap={true}
          maxLength={100}
        />
      </div>
    );
  }

  bloodRelation() {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      partnerA_bloodRelation,
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <div
          css={[NAME_FIELDS_BASIC_CONTAINER_STYLING, HEADER_SPACING_STYLING]}
        >
          <h2 css={SECTION_HEADING_STYLING}>
            Related by blood or marriage to Person B
          </h2>

          <div css={RADIOGROUP_CONTAINER_STYLING}>
            <div css={ONE_AND_HALF_MARGINBOTTOM}>
              <RadioGroup
                items={BOOL_RADIOGROUP}
                name="partnerA_bloodRelation"
                groupLabel=""
                checkedValue={partnerA_bloodRelation}
                handleItemChange={this.handleBloodRelChange}
                hideLabel
              />
            </div>
          </div>
        </div>

        {partnerA_bloodRelation === '1' && this.bloodRelDesc()}
      </div>
    );
  }

  bloodRelDesc() {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      partnerA_bloodRelationDesc,
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
        <TextInput
          label="Blood Relation: If yes, how?"
          name="partnerA_bloodRelationDesc"
          value={partnerA_bloodRelationDesc}
          onChange={this.handleBloodRelDescChange}
          disableLabelNoWrap={true}
          maxLength={100}
        />
      </div>
    );
  }

  parentsMarried() {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      partnerA_parentsMarriedAtBirth,
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <div
          css={[NAME_FIELDS_BASIC_CONTAINER_STYLING, HEADER_SPACING_STYLING]}
        >
          <h2 css={SECTION_HEADING_STYLING}>
            Were your parents married at the time of your birth?
          </h2>

          <div css={RADIOGROUP_CONTAINER_STYLING}>
            <div css={ONE_AND_HALF_MARGINBOTTOM}>
              <RadioGroup
                items={BOOL_RADIOGROUP}
                groupLabel=""
                name="partnerA_parentsMarriedAtBirth"
                checkedValue={partnerA_parentsMarriedAtBirth}
                handleItemChange={this.handleChange}
                hideLabel
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  sex() {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      partnerA_sex,
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <div
          css={[NAME_FIELDS_BASIC_CONTAINER_STYLING, HEADER_SPACING_STYLING]}
        >
          <h2 css={SECTION_HEADING_STYLING}>Sex</h2>

          <div css={RADIOGROUP_CONTAINER_STYLING}>
            <div css={ONE_AND_HALF_MARGINBOTTOM}>
              <RadioGroup
                items={SEX_CHECKBOX}
                name="partnerA_sex"
                groupLabel=""
                checkedValue={partnerA_sex}
                handleItemChange={this.handleChange}
                hideLabel
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  birthPlace() {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      // partnerA_birthHospital,
      partnerA_birthCity,
      partnerA_birthCountry,
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <div
          css={[NAME_FIELDS_BASIC_CONTAINER_STYLING, HEADER_SPACING_STYLING]}
        >
          <h2 css={SECTION_HEADING_STYLING}>Birthplace</h2>

          <TextInput
            label="Birthplace City/Town"
            name="partnerA_birthCity"
            value={partnerA_birthCity}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
            onBlur={this.checkBirthCityForNeighborhood}
            optionalDescription={
              'Please list the city/town where the hospital was located, not where your family was living.'
            }
            maxLength={100}
          />

          {partnerA_birthCountry === 'USA' && this.birthStateZip()}

          <div
            css={[
              NAME_FIELDS_BASIC_CONTAINER_STYLING,
              OVERRIDE_SELECT_DISPLAY_STYLING,
            ]}
          >
            <SelectDropdown
              label="Birthplace Country"
              // hideBlankOption
              name={'partnerA_birthCountry'}
              options={COUNTRIES}
              value={partnerA_birthCountry}
              onChange={this.handleChange}
              onBlur={this.checkBirthCityForNeighborhood}
            />
          </div>
        </div>
      </div>
    );
  }

  birthStateZip() {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      partnerA_birthState,
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <TextInput
          label="Birthplace State/Province"
          name="partnerA_birthState"
          value={partnerA_birthState}
          onChange={this.handleChange}
          onBlur={this.checkBirthCityForNeighborhood}
          disableLabelNoWrap={true}
          maxLength={50}
        />
      </div>
    );
  }

  parents() {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      partnerA_parentA_Name,
      partnerA_parentA_Surname,
      partnerA_parentB_Name,
      partnerA_parentB_Surname,
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <div css={[HEADER_SPACING_STYLING, HEADER_PADDING_TOP_STYLING]}>
          <h2 css={SECTION_HEADING_STYLING}>Parents</h2>
        </div>
        <div
          css={[
            MARRIAGE_INTENTION_FORM_STYLING,
            TWO_AND_HALF_MARGINBOTTOM,
            NAME_FIELDS_BASIC_CONTAINER_STYLING,
          ]}
          style={{ marginBottom: '2.5em' }}
        >
          <h4 css={SECTION_HEADING_STYLING}>Name of Parent 1/Mother</h4>

          <TextInput
            label="Parent 1/Mother - First Middle Last"
            name="partnerA_parentA_Name"
            value={partnerA_parentA_Name}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
            maxLength={38}
          />

          <TextInput
            label="Parent 1/Mother - Maiden Name/Surname at Birth or Adoption"
            name="partnerA_parentA_Surname"
            value={partnerA_parentA_Surname}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
            maxLength={38}
            optionalDescription={
              "This should be your parent's last name at the time of their birth or adoption."
            }
          />
        </div>

        <div
          css={[
            MARRIAGE_INTENTION_FORM_STYLING,
            TWO_AND_HALF_MARGINBOTTOM,
            NAME_FIELDS_BASIC_CONTAINER_STYLING,
          ]}
          style={{ marginBottom: '2.5em' }}
        >
          <h4 css={SECTION_HEADING_STYLING}>Name of Parent 2/Father</h4>

          <TextInput
            label="Parent 2/Father - First Middle Last"
            name="partnerA_parentB_Name"
            value={partnerA_parentB_Name}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
            maxLength={38}
          />

          <TextInput
            label="Parent 2/Father - Maiden Name/Surname at Birth or Adoption"
            name="partnerA_parentB_Surname"
            value={partnerA_parentB_Surname}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
            maxLength={38}
            optionalDescription={
              "This should be your parent's last name at the time of their birth or adoption."
            }
          />
        </div>
      </div>
    );
  }

  dateOfBirth() {
    const { marriageIntentionCertificateRequest, partnerLabel } = this.props;
    const {
      partnerA_dob,
      partnerA_age,
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
          <h2 css={SECTION_HEADING_STYLING} style={{ marginBottom: '1.5rem' }}>
            Date of Birth
          </h2>
          <MemorableDateInput
            hideLengend={true}
            legend={`Person ${partnerLabel} Date of Birth`}
            initialDate={partnerA_dob || undefined}
            componentId="dob"
            onlyAllowPast={true}
            handleDate={this.handleBirthDateChange}
          />
        </div>

        <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
          <TextInput
            label="Age"
            name="partnerA_age"
            value={partnerA_age}
            onChange={this.handleChange}
            maxLength={2}
            disableLabelNoWrap={true}
            optionalDescription={
              'Your age will be automatically calculated based on your date of birth.'
            }
          />
        </div>
      </div>
    );
  }

  nameFields() {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      partnerA_firstName,
      partnerA_lastName,
      partnerA_middleName,
      partnerA_surName,
      partnerA_occupation,
      partnerA_suffix,
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <div css={[SECTION_WRAPPER_STYLING, NAME_FIELDS_BASIC_CONTAINER_STYLING]}>
        <TextInput
          label="First Name"
          name="partnerA_firstName"
          value={partnerA_firstName}
          onChange={this.handleChange}
          disableLabelNoWrap={true}
          maxLength={100}
        />

        <TextInput
          label="Middle Name"
          name="partnerA_middleName"
          value={partnerA_middleName}
          onChange={this.handleChange}
          disableLabelNoWrap={true}
          optionalDescription={
            'This is your current middle name if you have one. You may not list a new middle name.'
          }
          maxLength={50}
        />

        <TextInput
          label="Last Name"
          name="partnerA_lastName"
          value={partnerA_lastName}
          onChange={this.handleChange}
          disableLabelNoWrap={true}
          maxLength={100}
        />

        <div
          css={[
            NAME_FIELDS_BASIC_CONTAINER_STYLING,
            OVERRIDE_SELECT_DISPLAY_STYLING,
          ]}
        >
          <TextInput
            label="Last Name / SURNAME to be used after marriage"
            name="partnerA_surName"
            value={partnerA_surName}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
            optionalDescription={
              "You can keep your current last name or use a new last name. Examples: Take your future spouse's last name, use a two part last name, or create a new last name."
            }
            maxLength={50}
          />
        </div>

        <div
          css={[
            NAME_FIELDS_BASIC_CONTAINER_STYLING,
            OVERRIDE_SELECT_DISPLAY_STYLING,
          ]}
        >
          <SelectDropdown
            label="Suffix"
            // hideBlankOption
            options={SUFFIX_OPTIONS}
            name={'partnerA_suffix'}
            value={partnerA_suffix}
            onChange={this.handleResidenceStateChange}
          />
        </div>

        <TextInput
          label="Occupation"
          name="partnerA_occupation"
          value={partnerA_occupation}
          onChange={this.handleChange}
          disableLabelNoWrap={true}
          maxLength={100}
        />
      </div>
    );
  }
}
