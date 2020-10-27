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
      partnerB_firstName,
      partnerB_lastName,
      partnerB_surName,
      partnerB_dob,
      partnerB_age,
      partnerB_sex,
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
      partnerB_suffix,

      partnerB_marriageNumb,
      partnerB_lastMarriageStatus,
    } = requestInformation;

    let bloodRelReq = true;
    let partnerB_partnership_dissolved = true;
    let partnerB_lastMarriageStatusReq = true;
    let partnerB_birthStateZip = true;
    let suffix = partnerB_suffix && partnerB_suffix.length > 0 ? true : false;

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
      partnerB_sex &&
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
      suffix &&
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
      partnerB_lastMarriageStatus,
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
              name="partnerB_lastMarriageStatus"
              checkedValue={partnerB_lastMarriageStatus}
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
      partnerB_residenceState,
      partnerB_residenceZip,
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
                  name={'partnerB_residenceState'}
                  value={partnerB_residenceState}
                  onChange={this.handleResidenceStateChange}
                />
              </div>
            </div>
          </div>
        </div>

        <TextInput
          label="Residence Zip Code"
          name="partnerB_residenceZip"
          value={partnerB_residenceZip}
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
      partnerB_residenceAddress,
      partnerB_residenceCountry,
      partnerB_residenceCity,
      partnerB_marriageNumb,
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
            name="partnerB_residenceAddress"
            value={partnerB_residenceAddress}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
            optionalDescription={
              'Please include your apartment number if that applies.'
            }
            maxLength={100}
          />

          <TextInput
            label="Residence City/Town"
            name="partnerB_residenceCity"
            value={partnerB_residenceCity}
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
                  name={'partnerB_residenceCountry'}
                  value={partnerB_residenceCountry}
                  onChange={this.handleResidenceCountryChange}
                  disableLabelNoWrap={true}
                />
              </div>
            </div>
          </div>

          {partnerB_residenceCountry === 'USA' && this.residenceStateZip()}

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
                  name={'partnerB_marriageNumb'}
                  value={partnerB_marriageNumb}
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
      partnerB_partnershipType,
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
              name="partnerB_partnershipType"
              checkedValue={partnerB_partnershipType}
              handleItemChange={this.handleChange}
              groupLabel=""
              hideLabel
            />
          </div>
        </div>

        {partnerB_partnershipType &&
          (partnerB_partnershipType === 'CIV' ||
            partnerB_partnershipType === 'DOM') &&
          this.dissolved()}
      </div>
    );
  }

  dissolved() {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      partnerB_partnershipTypeDissolved,
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
            name="partnerB_partnershipTypeDissolved"
            checkedValue={partnerB_partnershipTypeDissolved}
            handleItemChange={this.handleChange}
            groupLabel=""
            hideLabel
          />
        </div>
      </div>
    );
  }

  bloodRelation() {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      partnerB_bloodRelation,
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <div
          css={[NAME_FIELDS_BASIC_CONTAINER_STYLING, HEADER_SPACING_STYLING]}
        >
          <h2 css={SECTION_HEADING_STYLING}>
            Related by blood or marriage to Person A
          </h2>

          <div css={RADIOGROUP_CONTAINER_STYLING}>
            <div css={ONE_AND_HALF_MARGINBOTTOM}>
              <RadioGroup
                items={BOOL_RADIOGROUP}
                name="partnerB_bloodRelation"
                groupLabel=""
                checkedValue={partnerB_bloodRelation}
                handleItemChange={this.handleBloodRelChange}
                hideLabel
              />
            </div>
          </div>
        </div>

        {partnerB_bloodRelation === '1' && this.bloodRelDesc()}
      </div>
    );
  }

  bloodRelDesc() {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      partnerB_bloodRelationDesc,
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
        <TextInput
          label="Blood Relation: If yes, how?"
          name="partnerB_bloodRelationDesc"
          value={partnerB_bloodRelationDesc}
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
      partnerB_parentsMarriedAtBirth,
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
                name="partnerB_parentsMarriedAtBirth"
                checkedValue={partnerB_parentsMarriedAtBirth}
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
      partnerB_sex,
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
                name="partnerB_sex"
                groupLabel=""
                checkedValue={partnerB_sex}
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
      // partnerB_birthHospital,
      partnerB_birthCity,
      partnerB_birthCountry,
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <div
          css={[NAME_FIELDS_BASIC_CONTAINER_STYLING, HEADER_SPACING_STYLING]}
        >
          <h2 css={SECTION_HEADING_STYLING}>Birthplace</h2>

          {/* <TextInput
            label="Birthplace Hospital"
            name="partnerB_birthHospital"
            value={partnerB_birthHospital}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
            optionalDescription={
              'City/Town where the hospital was - not based on where the family was living'
            }
          /> */}

          <TextInput
            label="Birthplace City/Town"
            name="partnerB_birthCity"
            value={partnerB_birthCity}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
            onBlur={this.checkBirthCityForNeighborhood}
            optionalDescription={
              'Please list the city/town where the hospital was located, not where your family was living.'
            }
            maxLength={100}
          />

          {partnerB_birthCountry === 'USA' && this.birthStateZip()}

          <div
            css={[
              NAME_FIELDS_BASIC_CONTAINER_STYLING,
              OVERRIDE_SELECT_DISPLAY_STYLING,
            ]}
          >
            <SelectDropdown
              label="Birthplace Country"
              // hideBlankOption
              name={'partnerB_birthCountry'}
              options={COUNTRIES}
              value={partnerB_birthCountry}
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
      partnerB_birthState,
      // partnerB_birthZip,
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <TextInput
          label="Birthplace State/Province"
          name="partnerB_birthState"
          value={partnerB_birthState}
          onChange={this.handleChange}
          onBlur={this.checkBirthCityForNeighborhood}
          disableLabelNoWrap={true}
          maxLength={50}
        />

        {/* <TextInput
          label="Birthplace Zip Code"
          name="partnerB_birthZip"
          value={partnerB_birthZip}
          onChange={this.handleChange}
          disableLabelNoWrap={true}
          type={'number'}
        /> */}
      </div>
    );
  }

  parents() {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      partnerB_parentA_Name,
      partnerB_parentA_Surname,
      partnerB_parentB_Name,
      partnerB_parentB_Surname,
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
            name="partnerB_parentA_Name"
            value={partnerB_parentA_Name}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
            maxLength={38}
          />

          <TextInput
            label="Parent 1/Mother - Maiden Name/Surname at Birth or Adoption"
            name="partnerB_parentA_Surname"
            value={partnerB_parentA_Surname}
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
            name="partnerB_parentB_Name"
            value={partnerB_parentB_Name}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
            maxLength={38}
          />

          <TextInput
            label="Parent 2/Father - Maiden Name/Surname at Birth or Adoption"
            name="partnerB_parentB_Surname"
            value={partnerB_parentB_Surname}
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
      partnerB_dob,
      partnerB_age,
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
            initialDate={partnerB_dob || undefined}
            componentId="dob"
            onlyAllowPast={true}
            handleDate={this.handleBirthDateChange}
          />
        </div>

        <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
          <TextInput
            label="Age"
            name="partnerB_age"
            value={partnerB_age}
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
      partnerB_firstName,
      partnerB_lastName,
      partnerB_middleName,
      partnerB_surName,
      partnerB_occupation,
      partnerB_suffix,
    } = marriageIntentionCertificateRequest.requestInformation;

    return (
      <div css={[SECTION_WRAPPER_STYLING, NAME_FIELDS_BASIC_CONTAINER_STYLING]}>
        <TextInput
          label="First Name"
          name="partnerB_firstName"
          value={partnerB_firstName}
          onChange={this.handleChange}
          disableLabelNoWrap={true}
          maxLength={100}
        />

        <TextInput
          label="Middle Name"
          name="partnerB_middleName"
          value={partnerB_middleName}
          onChange={this.handleChange}
          disableLabelNoWrap={true}
          optionalDescription={
            'This is your current middle name if you have one. You may not list a new middle name.'
          }
          maxLength={50}
        />

        <TextInput
          label="Last Name"
          name="partnerB_lastName"
          value={partnerB_lastName}
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
            name="partnerB_surName"
            value={partnerB_surName}
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
            name={'partnerB_suffix'}
            value={partnerB_suffix}
            onChange={this.handleResidenceStateChange}
          />
        </div>

        <TextInput
          label="Occupation"
          name="partnerB_occupation"
          value={partnerB_occupation}
          onChange={this.handleChange}
          disableLabelNoWrap={true}
          maxLength={100}
        />
      </div>
    );
  }
}
