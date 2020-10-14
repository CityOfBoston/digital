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
  EVEN_FIELD_LEN_CONTAINER_STYLING,
  NAME_FIELDS_BASIC_CONTAINER_STYLING,
  HEADER_SPACING_STYLING,
  RADIOGROUP_CONTAINER_STYLING,
  PAIRED_INPUT_STYLING,
  HEADER_PADDING_TOP_STYLING,
  OVERRIDE_SELECT_DISPLAY_STYLING,
} from '../../common/question-components/styling';

import {
  ONE_AND_HALF_MARGINBOTTOM,
  BOTTOM_SPACING_STYLING,
  CLEARED_ROW_STYLING,
  THREE_FOURTH_WIDTH_INPUT_STYLING,
  ONE_FOURTH_WIDTH_INPUT_STYLING,
  ONE_FOURTH_WIDTH_ELEM_INPUT_STYLING,
  FLEXGROW_INITIAL_STYLING,
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

  public static isComplete(
    requestInformation: MarriageIntentionCertificateRequest,
    partnerLabel: string
  ): boolean {
    const {
      firstName,
      lastName,
      surName,
      dob,
      age,
      sex,
      bloodRelation,
      bloodRelationDesc,
      parentsMarriedAtBirth,
      parentA_Name,
      parentA_Surname,
      parentB_Name,
      parentB_Surname,
      birthHospital,
      birthCity,
      birthState,
      birthCountry,
      partnershipType,
      partnershipTypeDissolved,
      // marriageNumb,
      // lastMarriageStatus,
    } = requestInformation[`partner${partnerLabel}`];

    let bloodRelReq = true;
    let partnership_dissolved = true;
    let lastMarriageStatusReq = true;

    const bloodRelDescReq =
      bloodRelation && bloodRelation == '1' ? true : false;

    if (bloodRelDescReq && bloodRelationDesc.length < 1) {
      bloodRelReq = false;
    }

    // const _marriageNumb = MARRIAGE_COUNT.find(
    //   entry => entry.value === marriageNumb
    // );
    // if (marriageNumb && _marriageNumb && _marriageNumb.value !== MARRIAGE_COUNT[0].value) {
    //   if (lastMarriageStatus === '') {
    //     lastMarriageStatusReq = false;
    //   }
    // }

    if (partnershipType !== PARTNERSHIP_TYPE[0].value) {
      if (partnershipTypeDissolved === '') {
        partnership_dissolved = false;
      }
    }

    return !!(
      firstName &&
      lastName &&
      surName &&
      dob &&
      age &&
      sex &&
      bloodRelation &&
      bloodRelReq &&
      parentsMarriedAtBirth &&
      parentA_Name &&
      parentA_Surname &&
      parentB_Name &&
      parentB_Surname &&
      birthCountry &&
      birthHospital &&
      birthCity &&
      birthState &&
      partnershipType &&
      partnership_dissolved &&
      // marriageNumb &&
      lastMarriageStatusReq
    );
  }

  private getDataKey = key => {
    const { partnerLabel } = this.props;
    return `partner${partnerLabel}.${key}`;
  };

  private handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const target = this.getDataKey(event.target.name);
    const splitTarget = target.split('.');
    // console.log(`'handleChange > target: ${target} | val: ${event.target.value}`);

    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        [event.target.name]: event.target.value,
      },
      splitTarget[0]
    );
  };

  private handleBirthDateChange = (newDate: Date | null): void => {
    const isDate = this.isDateObj(newDate);
    const target = this.getDataKey('dob');
    const splitTarget = target.split('.');
    let age = '';

    if (isDate && splitTarget.length > 1) {
      // console.log(`'handleChange > target: ${target} | val: ${newDate} | ${isDate}`);
      age = `${this.calcAge(newDate)}`;
      this.updateAge(age);

      this.props.marriageIntentionCertificateRequest.answerQuestion(
        {
          [target]: newDate,
        },
        splitTarget[0]
      );
    }
  };

  private handleResidenceCountryChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const target = this.getDataKey(event.target.name);

    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        [target]: event.target.value,
      },
      ''
    );
  };

  private handleZipCodeChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const target = this.getDataKey(event.target.name);
    const val = event.target.value
      .replace(/[^0-9]/g, '')
      .replace(/(\..*)\./g, '$1');

    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        [target]: val,
      },
      ''
    );
  };

  private handleResidenceStateChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const { marriageIntentionCertificateRequest, partnerLabel } = this.props;
    const {
      residenceCity,
      residenceCountry,
    } = marriageIntentionCertificateRequest.requestInformation[
      `partner${partnerLabel}`
    ];

    const target = this.getDataKey(event.target.name);
    const inlowerCase = residenceCity.toLowerCase();
    const isBosNeighborhood = BOSTON_NEIGHBORHOODS.indexOf(inlowerCase);
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        [target]: event.target.value,
      },
      ''
    );

    if (
      residenceCountry === 'USA' &&
      event.target.value === 'MA' &&
      isBosNeighborhood > -1
    ) {
      this.replaceBosNeighborhoods({
        target: {
          name: 'residenceCity',
          value: residenceCity,
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
    const { marriageIntentionCertificateRequest, partnerLabel } = this.props;
    const {
      residenceCountry,
      residenceState,
    } = marriageIntentionCertificateRequest.requestInformation[
      `partner${partnerLabel}`
    ];

    const inlowerCase = event.target.value.toLowerCase();
    const isBosNeighborhood = BOSTON_NEIGHBORHOODS.indexOf(inlowerCase);
    const target = this.getDataKey(event.target.name);

    if (
      residenceCountry === 'USA' &&
      residenceState === 'MA' &&
      isBosNeighborhood > -1
    ) {
      this.props.marriageIntentionCertificateRequest.answerQuestion(
        {
          [target]: 'Boston',
        },
        ''
      );
    }
  };

  private checkBirthCityForNeighborhood = (): void => {
    const { marriageIntentionCertificateRequest, partnerLabel } = this.props;
    const {
      birthCountry,
      birthCity,
      birthState,
    } = marriageIntentionCertificateRequest.requestInformation[
      `partner${partnerLabel}`
    ];

    const inlowerCase = birthCity.toLowerCase();
    const isBosNeighborhood = BOSTON_NEIGHBORHOODS.indexOf(inlowerCase);
    const target = this.getDataKey('birthCity');

    if (
      birthCountry === 'USA' &&
      (birthState === 'MA' || birthState === 'Massachusetts') &&
      isBosNeighborhood > -1
    ) {
      this.props.marriageIntentionCertificateRequest.answerQuestion(
        {
          [target]: 'Boston',
        },
        ''
      );
    }
  };

  private updateAge = age => {
    const target = this.getDataKey('age');
    this.props.marriageIntentionCertificateRequest.answerQuestion(
      {
        [target]: age,
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
      // marriageIntentionCertificateRequest,
      partnerLabel,
    } = this.props;
    // const {
    //   marriageNumb,
    // } = marriageIntentionCertificateRequest.requestInformation[`partner${partnerLabel}`];
    // const _marriageNumb = MARRIAGE_COUNT.find(
    //   entry => entry.value === marriageNumb
    // );

    return (
      <QuestionComponent
        handleProceed={this.props.handleProceed}
        handleStepBack={this.props.handleStepBack}
        // allowProceed={PartnerForm.isComplete(
        //   marriageIntentionCertificateRequest,
        //   partnerLabel,
        // )}
        nextButtonText={'NEXT'}
      >
        <FieldsetComponent
          legendText={<h2 css={SECTION_HEADING_STYLING}>{partnerLabel}</h2>}
        >
          {this.nameFields()}
          {this.dateOfBirth()}
          {this.birthPlace()}
          {this.residence()}

          {/* {marriageNumb &&
            // _marriageNumb &&
            marriageNumb.value !== MARRIAGE_COUNT[0].value &&
            this.lastMarriageStatus()} */}

          {this.partnershipType()}
          {this.parents()}
          {this.sex()}
          {this.parentsMarried()}
          {this.bloodRelation()}
        </FieldsetComponent>
      </QuestionComponent>
    );
  }

  // UI ELEMENTS
  // -----------
  residenceStateZip() {
    const { marriageIntentionCertificateRequest, partnerLabel } = this.props;
    const {
      residenceState,
      residenceZip,
    } = marriageIntentionCertificateRequest.requestInformation[
      `partner${partnerLabel}`
    ];

    return (
      <div
        css={[NAME_FIELDS_CONTAINER_STYLING, EVEN_FIELD_LEN_CONTAINER_STYLING]}
      >
        <SelectDropdown
          label="State"
          hideBlankOption
          options={US_STATES}
          name={'residenceState'}
          value={residenceState}
          onChange={this.handleResidenceStateChange}
        />
        <TextInput
          label="Zipcode"
          name="residenceZip"
          value={residenceZip}
          onChange={this.handleZipCodeChange}
          disableLabelNoWrap={true}
          maxLength={10}
          minLength={5}
          required
        />
      </div>
    );
  }

  lastMarriageStatus() {
    const { marriageIntentionCertificateRequest, partnerLabel } = this.props;
    const {
      lastMarriageStatus,
    } = marriageIntentionCertificateRequest.requestInformation[
      `partner${partnerLabel}`
    ];

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
            If Applicable, Status of last marriage
          </h2>

          <div css={RADIOGROUP_CONTAINER_STYLING}>
            <div css={ONE_AND_HALF_MARGINBOTTOM}>
              <RadioGroup
                items={LAST_MARRIAGE_STATUS}
                name="lastMarriageStatus"
                checkedValue={lastMarriageStatus}
                handleItemChange={this.handleChange}
                groupLabel=""
                hideLabel
              />
            </div>

            <label className="notice">
              If void, please provide clerk with evidence.
            </label>

            <label className="notice">
              If annulled, then this is the 1st marriage, but you must have
              proof of annullment.
            </label>
          </div>
        </div>
      </div>
    );
  }

  residence() {
    const { marriageIntentionCertificateRequest, partnerLabel } = this.props;
    const {
      residenceStreetNum,
      residenceStreetName,
      residenceSAptNum,
      residenceCountry,
      residenceCity,
      marriageNumb,
    } = marriageIntentionCertificateRequest.requestInformation[
      `partner${partnerLabel}`
    ];

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
          <h2 css={SECTION_HEADING_STYLING}>Residence</h2>
        </div>

        <div css={TWO_AND_HALF_MARGINBOTTOM}>
          <div
            css={[
              NAME_FIELDS_BASIC_CONTAINER_STYLING,
              FLEXGROW_INITIAL_STYLING,
            ]}
          >
            <div
              css={[
                ONE_FOURTH_WIDTH_INPUT_STYLING,
                ONE_FOURTH_WIDTH_ELEM_INPUT_STYLING,
              ]}
            >
              <TextInput
                label="Street #"
                name="residenceStreetNum"
                value={residenceStreetNum}
                onChange={this.handleChange}
                disableLabelNoWrap={true}
                // labelBelowInput={true}
                required
              />
            </div>
            <div css={THREE_FOURTH_WIDTH_INPUT_STYLING}>
              <TextInput
                label="Street Name"
                name="residenceStreetName"
                value={residenceStreetName}
                onChange={this.handleChange}
                disableLabelNoWrap={true}
                // labelBelowInput={true}
                required
              />
            </div>
            <div
              css={[
                ONE_FOURTH_WIDTH_INPUT_STYLING,
                ONE_FOURTH_WIDTH_ELEM_INPUT_STYLING,
              ]}
            >
              <TextInput
                label="Apt/Unit #"
                name="residenceSAptNum"
                value={residenceSAptNum}
                onChange={this.handleChange}
                disableLabelNoWrap={true}
                // labelBelowInput={true}
              />
            </div>
          </div>

          <div css={[NAME_FIELDS_BASIC_CONTAINER_STYLING, CLEARED_ROW_STYLING]}>
            <SelectDropdown
              label="Select Country of Residence"
              required
              // hideBlankOption
              options={COUNTRIES}
              name={'residenceCountry'}
              value={residenceCountry}
              onChange={this.handleResidenceCountryChange}
              // disableLabelNoWrap={true}
              // labelBelowInput={true}
            />

            <TextInput
              label="City/Town"
              name="residenceCity"
              value={residenceCity}
              onChange={this.handleChange}
              onBlur={this.replaceBosNeighborhoods}
              disableLabelNoWrap={true}
              // labelBelowInput={true}
              required
            />
          </div>
          {residenceCountry === 'USA' && this.residenceStateZip()}

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
                  required
                  // hideBlankOption
                  options={MARRIAGE_COUNT}
                  name={'marriageNumb'}
                  value={marriageNumb}
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
    const { marriageIntentionCertificateRequest, partnerLabel } = this.props;
    const {
      partnershipType,
    } = marriageIntentionCertificateRequest.requestInformation[
      `partner${partnerLabel}`
    ];

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <div
          css={[
            NAME_FIELDS_BASIC_CONTAINER_STYLING,
            HEADER_SPACING_STYLING,
            BOTTOM_SPACING_STYLING,
          ]}
        >
          <h2 css={SECTION_HEADING_STYLING}>Am/Was Member of</h2>

          <div css={RADIOGROUP_CONTAINER_STYLING}>
            <RadioGroup
              items={PARTNERSHIP_TYPE}
              name="partnershipType"
              checkedValue={partnershipType}
              handleItemChange={this.handleChange}
              groupLabel=""
              hideLabel
            />
          </div>
        </div>

        {partnershipType &&
          (partnershipType === 'CIV' || partnershipType === 'DOM') &&
          this.dissolved()}
      </div>
    );
  }

  dissolved() {
    const { marriageIntentionCertificateRequest, partnerLabel } = this.props;
    const {
      partnershipTypeDissolved,
    } = marriageIntentionCertificateRequest.requestInformation[
      `partner${partnerLabel}`
    ];

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
            name="partnershipTypeDissolved"
            checkedValue={partnershipTypeDissolved}
            handleItemChange={this.handleChange}
            groupLabel=""
            hideLabel
          />
        </div>
      </div>
    );
  }

  bloodRelation() {
    const { marriageIntentionCertificateRequest, partnerLabel } = this.props;
    const {
      bloodRelation,
      bloodRelationDesc,
    } = marriageIntentionCertificateRequest.requestInformation[
      `partner${partnerLabel}`
    ];

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <div
          css={[NAME_FIELDS_BASIC_CONTAINER_STYLING, HEADER_SPACING_STYLING]}
        >
          <h2 css={SECTION_HEADING_STYLING}>
            Related by blood or marriage to Partner A
          </h2>

          <div css={RADIOGROUP_CONTAINER_STYLING}>
            <div css={ONE_AND_HALF_MARGINBOTTOM}>
              <RadioGroup
                items={BOOL_RADIOGROUP}
                name="bloodRelation"
                groupLabel=""
                checkedValue={bloodRelation}
                handleItemChange={this.handleChange}
                hideLabel
              />
            </div>
          </div>
        </div>

        <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
          <TextInput
            label="Blood Relation: If yes, how."
            name="bloodRelationDesc"
            value={bloodRelationDesc}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
            maxLength={200}
          />
        </div>
      </div>
    );
  }

  parentsMarried() {
    const { marriageIntentionCertificateRequest, partnerLabel } = this.props;
    const {
      parentsMarriedAtBirth,
    } = marriageIntentionCertificateRequest.requestInformation[
      `partner${partnerLabel}`
    ];

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
                name="parentsMarriedAtBirth"
                checkedValue={parentsMarriedAtBirth}
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
    const { marriageIntentionCertificateRequest, partnerLabel } = this.props;
    const { sex } = marriageIntentionCertificateRequest.requestInformation[
      `partner${partnerLabel}`
    ];

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
                name="sex"
                groupLabel=""
                checkedValue={sex}
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
    const { marriageIntentionCertificateRequest, partnerLabel } = this.props;
    const {
      birthHospital,
      birthCity,
      birthState,
      birthCountry,
    } = marriageIntentionCertificateRequest.requestInformation[
      `partner${partnerLabel}`
    ];

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <div
          css={[NAME_FIELDS_BASIC_CONTAINER_STYLING, HEADER_SPACING_STYLING]}
        >
          <h2 css={SECTION_HEADING_STYLING}>Birthplace</h2>

          <TextInput
            label="Hospital Name"
            name="birthHospital"
            value={birthHospital}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
            required
          />

          <div
            css={[
              NAME_FIELDS_CONTAINER_STYLING,
              EVEN_FIELD_LEN_CONTAINER_STYLING,
            ]}
          >
            <TextInput
              label="City/Town"
              name="birthCity"
              value={birthCity}
              onChange={this.handleChange}
              disableLabelNoWrap={true}
              onBlur={this.checkBirthCityForNeighborhood}
              required
            />

            <TextInput
              label="State/Province"
              name="birthState"
              value={birthState}
              onChange={this.handleChange}
              onBlur={this.checkBirthCityForNeighborhood}
              disableLabelNoWrap={true}
              required
            />
          </div>
          <div
            css={[
              NAME_FIELDS_BASIC_CONTAINER_STYLING,
              OVERRIDE_SELECT_DISPLAY_STYLING,
            ]}
          >
            <SelectDropdown
              label="Birth Country"
              required
              // hideBlankOption
              name={'birthCountry'}
              options={COUNTRIES}
              value={birthCountry}
              onChange={this.handleChange}
              onBlur={this.checkBirthCityForNeighborhood}
            />
          </div>
        </div>
      </div>
    );
  }

  parents() {
    const { marriageIntentionCertificateRequest, partnerLabel } = this.props;
    const {
      parentA_Name,
      parentA_Surname,
      parentB_Name,
      parentB_Surname,
    } = marriageIntentionCertificateRequest.requestInformation[
      `partner${partnerLabel}`
    ];

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <div css={[HEADER_SPACING_STYLING, HEADER_PADDING_TOP_STYLING]}>
          <h2 css={SECTION_HEADING_STYLING}>Parents</h2>
        </div>
        <div style={{ marginBottom: '2.5em' }}>
          <h4 css={SECTION_HEADING_STYLING}>Name of Mother/Parent 1</h4>
          <div css={[NAME_FIELDS_CONTAINER_STYLING, PAIRED_INPUT_STYLING]}>
            <TextInput
              label="First Middle Last"
              name="parentA_Name"
              value={parentA_Name}
              onChange={this.handleChange}
              disableLabelNoWrap={true}
              // labelBelowInput={true}
              required
            />

            <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
              <TextInput
                label="Maiden Name/Surname at birth or adoption"
                name="parentA_Surname"
                value={parentA_Surname}
                onChange={this.handleChange}
                disableLabelNoWrap={true}
                // labelBelowInput={true}
                required
              />
            </div>
          </div>
        </div>

        <h4 css={SECTION_HEADING_STYLING}>Name of Father/Parent 2</h4>
        <div css={[NAME_FIELDS_CONTAINER_STYLING, PAIRED_INPUT_STYLING]}>
          <TextInput
            label="First Middle Last"
            name="parentB_Name"
            value={parentB_Name}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
            // labelBelowInput={true}
            required
          />

          <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
            <TextInput
              label="Maiden Name/Surname at birth or adoption"
              name="parentB_Surname"
              value={parentB_Surname}
              onChange={this.handleChange}
              disableLabelNoWrap={true}
              // labelBelowInput={true}
              required
            />
          </div>
        </div>
      </div>
    );
  }

  dateOfBirth() {
    const { marriageIntentionCertificateRequest, partnerLabel } = this.props;
    const { dob, age } = marriageIntentionCertificateRequest.requestInformation[
      `partner${partnerLabel}`
    ];

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
          <MemorableDateInput
            legend={
              <h2
                css={SECTION_HEADING_STYLING}
                style={{ marginBottom: '1.5rem' }}
              >
                Date of Birth
              </h2>
            }
            initialDate={dob || undefined}
            componentId="dob"
            onlyAllowPast={true}
            // latestDate={latestDate}
            handleDate={this.handleBirthDateChange}
          />
        </div>

        <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
          <TextInput
            label="Age"
            name="age"
            value={age}
            onChange={this.handleChange}
            maxLength={2}
            disableLabelNoWrap={true}
            required
          />
          <span>
            Your age will be automatically calculated based on your Date of
            Birth.
          </span>
        </div>
      </div>
    );
  }

  nameFields() {
    const { marriageIntentionCertificateRequest } = this.props;
    const {
      firstName,
      lastName,
      middleName,
      surName,
      occupation,
    } = marriageIntentionCertificateRequest.requestInformation[
      `partner${this.props.partnerLabel}`
    ];

    // console.log('firstName: ', firstName);

    return (
      <div css={SECTION_WRAPPER_STYLING}>
        <div
          css={[
            NAME_FIELDS_CONTAINER_STYLING,
            EVEN_FIELD_LEN_CONTAINER_STYLING,
          ]}
        >
          <TextInput
            label="First Name"
            name="firstName"
            value={firstName}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
            required
          />

          <TextInput
            label="Middle Name"
            name="middleName"
            value={middleName}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
          />

          <TextInput
            label="Last Name"
            name="lastName"
            value={lastName}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
            required
          />
        </div>

        <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
          <TextInput
            label="Last Name / SURNAME to be used after marriage"
            name="surName"
            value={surName}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
            required
          />
        </div>

        <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
          <TextInput
            label="Occupation"
            name="occupation"
            value={occupation}
            onChange={this.handleChange}
            disableLabelNoWrap={true}
            required
          />
        </div>
      </div>
    );
  }
}
