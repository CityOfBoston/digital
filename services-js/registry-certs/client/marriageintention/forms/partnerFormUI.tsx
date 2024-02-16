/** @jsx jsx */

import { jsx, css } from '@emotion/core';

import { THICK_BORDER_STYLE } from '../../common/question-components/styling';
import {
  RadioGroup,
  TextInput,
  SelectDropdown,
  MemorableDateInput,
  DEFAULT_TEXT,
  SERIF,
  SANS,
  CHARLES_BLUE,
} from '@cityofboston/react-fleet';

import {
  SECTION_WRAPPER_STYLING,
  NAME_FIELDS_CONTAINER_STYLING,
  NAME_FIELDS_BASIC_CONTAINER_STYLING,
  HEADER_SPACING_STYLING,
  OVERRIDE_SELECT_DISPLAY_STYLING,
  MARRIAGE_INTENTION_FORM_STYLING,
  RADIOGROUP_CONTAINER_STYLING,
  SELECTINPUT_WRAPPER_STYLING,
} from '../../common/question-components/styling';

import {
  BOTTOM_SPACING_STYLING,
  ONE_AND_HALF_MARGINBOTTOM,
  TWO_AND_HALF_MARGINBOTTOM,
} from './styling';

import {
  SUFFIX_OPTIONS,
  LAST_MARRIAGE_STATUS,
  MARRIAGE_COUNT,
  BOOL_RADIOGROUP,
  PARTNERSHIP_TYPE_DISSOLVED,
  PARTNERSHIP_TYPE2,
} from './inputData';
import { COUNTRIES, US_STATES } from '../../../utils/data';
import { ToolTip } from '@cityofboston/react-fleet';

export const PARTNERFORM_HEADER_STYLING = css(`
  color: ${CHARLES_BLUE};
  font-weight: 700;
  font-size: 1.75rem;
  font-family: ${SANS};
  text-transform: uppercase;
  padding-bottom: 0.25em;

  h2 {
    margin-bottom: 3.9375rem;
  }
`);

export const PARTNERFORM_SECTION_HEADING_STYLING = css(`
  color: ${CHARLES_BLUE};
  font-weight: 700;
  font-size: 1.125rem;
  font-family: ${SANS};
  text-transform: uppercase;
  margin-top: 0.5em;
  margin-bottom: 1.25em;

  h1 {
    border-bottom: ${THICK_BORDER_STYLE};
  }

  .notice {
    color: ${DEFAULT_TEXT};
    font-family: ${SERIF};
    font-size: 0.9375rem;
    font-style: italic;
    font-weight: normal;
    line-height: 1.2rem;
    text-transform: none;
    padding-top: 0.5em;
    margin-top: 0.25em;
    border-top: ${THICK_BORDER_STYLE};
    
    .tool-tip__wrapper {
      display: inline-block;
    }
  }
`);

export const BOTTOM_BORDER = css(`
  border-bottom: ${THICK_BORDER_STYLE};
  margin-bottom: 1em;
`);

const MEMORABLEDATEINPUT_STYLING = css(`
  margin-bottom: 2.25em;
`);

export const nameFields = (data: {
  partnerFlag: string;
  handleChange: ((e: any) => void) | undefined;
  handleResidenceStateChange: ((e: any) => void) | undefined;
  handleUseSurnameChange: ((e: any) => void) | undefined;
  firstName: string;
  lastName: string;
  middleName: string;
  surName: string;
  useSurname: string;
  occupation: string;
  suffix: string;
}) => {
  const {
    partnerFlag,
    firstName,
    lastName,
    middleName,
    surName,
    useSurname,
    occupation,
    suffix,
    handleChange,
    handleResidenceStateChange,
    handleUseSurnameChange,
  } = data;
  // const partnerNameStr = `partner${partnerFlag}_useSurname`;
  const $CSS_SECTION_WRAPPER = css(`margin-bottom: 1.5em;`);

  return (
    <div
      css={[
        SECTION_WRAPPER_STYLING,
        NAME_FIELDS_BASIC_CONTAINER_STYLING,
        $CSS_SECTION_WRAPPER,
      ]}
    >
      <h1 css={[PARTNERFORM_SECTION_HEADING_STYLING]}>
        Personal Information
        <div className="notice">
          Please enter your legal name as it appears on official documents. You
          cannot list a new middle name. If you wish to change your last name,
          you can indicate this after providing your legal name.
        </div>
      </h1>

      <TextInput
        label="First Name"
        name={`partner${partnerFlag}_firstName`}
        value={firstName}
        onChange={handleChange}
        disableLabelNoWrap={true}
        maxLength={100}
        softRequired={true}
      />

      <TextInput
        label="Middle Name"
        name={`partner${partnerFlag}_middleName`}
        value={middleName}
        onChange={handleChange}
        disableLabelNoWrap={true}
        optionalDescription={
          'Please enter your middle name if you have one. You cannot list a new middle name.'
        }
        maxLength={50}
        softRequired={false}
      />

      <TextInput
        label="Last Name"
        name={`partner${partnerFlag}_lastName`}
        value={lastName}
        onChange={handleChange}
        disableLabelNoWrap={true}
        maxLength={100}
      />

      <div css={RADIOGROUP_CONTAINER_STYLING}>
        <div css={ONE_AND_HALF_MARGINBOTTOM}>
          <RadioGroup
            items={BOOL_RADIOGROUP}
            name={`partner${partnerFlag}_useSurname`}
            groupLabel="Would you like to change your last name?"
            checkedValue={useSurname}
            handleItemChange={handleUseSurnameChange}
            hideLabel={false}
            className={`radio-group__label`}
            softRequired={true}
            toolTip={{
              icon: '?',
              msg:
                'Examples: Use your future spouse’s last name, use a two-part last name, or create a new last name.',
            }}
          />
        </div>
      </div>

      {useSurname === '1' && (
        <div
          css={[
            NAME_FIELDS_BASIC_CONTAINER_STYLING,
            OVERRIDE_SELECT_DISPLAY_STYLING,
          ]}
        >
          <TextInput
            label="New Last Name to be Used After Marriage"
            name={`partner${partnerFlag}_surName`}
            value={surName}
            onChange={handleChange}
            disableLabelNoWrap={true}
            optionalDescription={`You can keep your current last name or use a new last name.`}
            maxLength={50}
            softRequired={true}
            toolTip={{
              icon: '?',
              msg:
                'Examples: Use your future spouse’s last name, use a two-part last name, or create a new last name.',
            }}
          />
        </div>
      )}

      <div
        css={[
          NAME_FIELDS_BASIC_CONTAINER_STYLING,
          OVERRIDE_SELECT_DISPLAY_STYLING,
          SELECTINPUT_WRAPPER_STYLING,
        ]}
      >
        <SelectDropdown
          label="Suffix"
          options={SUFFIX_OPTIONS}
          name={`partner${partnerFlag}_suffix`}
          value={suffix}
          onChange={handleResidenceStateChange}
          softRequired={false}
          optionalDescription={`Please select your suffix if you have one.`}
        />
      </div>

      <TextInput
        label="Occupation"
        name={`partner${partnerFlag}_occupation`}
        value={occupation}
        onChange={handleChange}
        disableLabelNoWrap={true}
        maxLength={100}
        softRequired={true}
        toolTip={{
          icon: '?',
          msg:
            'This information is collected as required by the Massachusetts State Marriage Intention Form.',
        }}
      />
    </div>
  );
};

export const datePlaceOfBirth = (data: {
  partnerFlag: string;
  partnerDOB: Date | null | undefined;
  birthCityStr: string;
  birthCountryStr: string;
  birthStateStr: string;
  handleChange: ((e: any) => void) | undefined;
  handleBirthplaceCountryChange: ((e: any) => void) | undefined;
  checkBirthCityForNeighborhood: ((e: any) => void) | undefined;
  handleBirthDateChange: (newDate: Date | null) => void;
}) => {
  const {
    partnerFlag,
    partnerDOB,
    handleBirthDateChange,
    birthCityStr,
    birthCountryStr,
    birthStateStr,
    handleChange,
    handleBirthplaceCountryChange,
    checkBirthCityForNeighborhood,
  } = data;

  const birthCity = (data: {
    partnerFlag: string;
    birthCity: string;
    handleChange: ((e: any) => void) | undefined;
    checkBirthCityForNeighborhood: ((e: any) => void) | undefined;
  }) => {
    const {
      partnerFlag,
      birthCity,
      handleChange,
      checkBirthCityForNeighborhood,
    } = data;

    return (
      <div>
        <TextInput
          label="Birthplace City/Town"
          name={`partner${partnerFlag}_birthCity`}
          value={birthCity}
          onChange={handleChange}
          disableLabelNoWrap={true}
          onBlur={checkBirthCityForNeighborhood}
          optionalDescription={
            'Please list the city/town where the hospital was located, not where your family was living.'
          }
          maxLength={100}
          softRequired={true}
        />
      </div>
    );
  };

  const birthStateZip = (data: {
    partnerFlag: string;
    birthStateStr: string;
    handleChange: ((e: any) => void) | undefined;
    checkBirthCityForNeighborhood: ((e: any) => void) | undefined;
  }) => {
    const {
      partnerFlag,
      birthStateStr,
      handleChange,
      checkBirthCityForNeighborhood,
    } = data;
    return (
      <div css={[SECTION_WRAPPER_STYLING, SELECTINPUT_WRAPPER_STYLING]}>
        <div css={OVERRIDE_SELECT_DISPLAY_STYLING}>
          <SelectDropdown
            label="Birthplace State/Province"
            hideBlankOption
            options={US_STATES}
            name={`partner${partnerFlag}_birthState`}
            value={birthStateStr}
            onChange={handleChange}
            onBlur={checkBirthCityForNeighborhood}
            softRequired={true}
          />
        </div>
      </div>
    );
  };

  return (
    <div css={[SECTION_WRAPPER_STYLING, NAME_FIELDS_BASIC_CONTAINER_STYLING]}>
      <h1
        css={[
          PARTNERFORM_SECTION_HEADING_STYLING,
          // SECTION_HEADING_STYLING
          BOTTOM_BORDER,
        ]}
      >
        Date and Place of Birth
      </h1>

      <MemorableDateInput
        hideLengend={true}
        legend={`Person ${partnerFlag} Date of Birth`}
        initialDate={partnerDOB || undefined}
        componentId="dob"
        onlyAllowPast={true}
        handleDate={handleBirthDateChange}
        cssObj={MEMORABLEDATEINPUT_STYLING}
        requires={{ day: 'soft', month: 'soft', year: 'soft' }}
      />

      <div
        css={[
          NAME_FIELDS_BASIC_CONTAINER_STYLING,
          OVERRIDE_SELECT_DISPLAY_STYLING,
          SELECTINPUT_WRAPPER_STYLING,
        ]}
      >
        <SelectDropdown
          label="Birthplace Country"
          name={`partner${partnerFlag}_birthCountry`}
          options={COUNTRIES}
          value={birthCountryStr}
          onChange={handleBirthplaceCountryChange}
          onBlur={checkBirthCityForNeighborhood}
          softRequired={true}
        />
      </div>

      {birthCountryStr === 'USA' &&
        birthStateZip({
          partnerFlag,
          birthStateStr: birthStateStr,
          handleChange,
          checkBirthCityForNeighborhood,
        })}
      {birthCountryStr &&
        birthCity({
          partnerFlag,
          birthCity: birthCityStr,
          handleChange,
          checkBirthCityForNeighborhood,
        })}
    </div>
  );
};

export const residence = (data: {
  partnerFlag: string;
  residenceZipStr: string;
  residenceCityStr: string;
  residenceStateStr: string;
  residenceAddressStr: string;
  residenceCountryStr: string;
  handleChange: ((e: any) => void) | undefined;
  handleZipCodeChange: ((e: any) => void) | undefined;
  replaceBosNeighborhoods: ((e: any) => void) | undefined;
  handleResidenceStateChange: ((e: any) => void) | undefined;
  handleResidenceCountryChange: ((e: any) => void) | undefined;
}) => {
  const {
    partnerFlag,
    residenceZipStr,
    residenceCityStr,
    residenceStateStr,
    residenceAddressStr,
    residenceCountryStr,
    handleChange,
    handleZipCodeChange,
    replaceBosNeighborhoods,
    handleResidenceStateChange,
    handleResidenceCountryChange,
  } = data;

  const residenceZip = (data: {
    partnerFlag: string;
    residenceZipStr: string;
    handleZipCodeChange: ((e: any) => void) | undefined;
  }) => {
    const { partnerFlag, residenceZipStr, handleZipCodeChange } = data;

    return (
      <div>
        <TextInput
          label="Residence Zip Code"
          name={`partner${partnerFlag}_residenceZip`}
          value={residenceZipStr}
          onChange={handleZipCodeChange}
          disableLabelNoWrap={true}
          maxLength={10}
          minLength={5}
          softRequired={true}
        />
      </div>
    );
  };

  const residenceState = (data: {
    partnerFlag: string;
    residenceStateStr: string;
    handleResidenceStateChange: ((e: any) => void) | undefined;
  }) => {
    const { partnerFlag, residenceStateStr, handleResidenceStateChange } = data;

    return (
      <div>
        <div
          css={[
            NAME_FIELDS_CONTAINER_STYLING,
            OVERRIDE_SELECT_DISPLAY_STYLING,
            SELECTINPUT_WRAPPER_STYLING,
          ]}
        >
          <SelectDropdown
            label="State of Residence"
            hideBlankOption
            options={US_STATES}
            name={`partner${partnerFlag}_residenceState`}
            value={residenceStateStr}
            onChange={handleResidenceStateChange}
            softRequired={true}
          />
        </div>
      </div>
    );
  };

  const residenceCity = (data: {
    partnerFlag: string;
    residenceCityStr: string;
    residenceAddressStr: string;
    handleChange: ((e: any) => void) | undefined;
    replaceBosNeighborhoods: ((e: any) => void) | undefined;
  }) => {
    const {
      partnerFlag,
      residenceCityStr,
      residenceAddressStr,
      handleChange,
      replaceBosNeighborhoods,
    } = data;

    return (
      <div>
        <TextInput
          label="Residence City/Town"
          name={`partner${partnerFlag}_residenceCity`}
          value={residenceCityStr}
          onChange={handleChange}
          onBlur={replaceBosNeighborhoods}
          disableLabelNoWrap={true}
          optionalDescription={
            "For Boston residents: Please put 'Boston' as the City, do not use neighborhood names."
          }
          maxLength={100}
          softRequired={true}
        />

        <TextInput
          label="Residence Address"
          name={`partner${partnerFlag}_residenceAddress`}
          value={residenceAddressStr}
          onChange={handleChange}
          disableLabelNoWrap={true}
          optionalDescription={
            'Please include your apartment number if that applies.'
          }
          maxLength={100}
          softRequired={true}
        />
      </div>
    );
  };

  return (
    <div css={SECTION_WRAPPER_STYLING}>
      <h1 css={[PARTNERFORM_SECTION_HEADING_STYLING]}>
        Residence
        <div className="notice">
          Please enter your current residential address. If your mailing address
          is not the same as your residential one, you will have the opportunity
          to share your preferred address during your appointment.
        </div>
      </h1>

      <div
        css={[TWO_AND_HALF_MARGINBOTTOM, NAME_FIELDS_BASIC_CONTAINER_STYLING]}
      >
        <div
          css={[
            NAME_FIELDS_BASIC_CONTAINER_STYLING,
            OVERRIDE_SELECT_DISPLAY_STYLING,
            SELECTINPUT_WRAPPER_STYLING,
          ]}
        >
          <SelectDropdown
            label="Country of Residence"
            options={COUNTRIES}
            name={`partner${partnerFlag}_residenceCountry`}
            value={residenceCountryStr}
            onChange={handleResidenceCountryChange}
            disableLabelNoWrap={true}
            softRequired={true}
            toolTip={{
              icon: '?',
              msg:
                'If your mailing address differs from your residential one, you can provide your preferred address with the Registry during your appointment.',
            }}
          />
        </div>

        {residenceCountryStr === 'USA' &&
          residenceState({
            partnerFlag,
            residenceStateStr,
            handleResidenceStateChange,
          })}
        {residenceCountryStr &&
          residenceCity({
            partnerFlag,
            residenceCityStr,
            residenceAddressStr,
            handleChange,
            replaceBosNeighborhoods,
          })}
        {residenceCountryStr === 'USA' &&
          residenceZip({
            partnerFlag,
            residenceZipStr,
            handleZipCodeChange,
          })}
      </div>
    </div>
  );
};

export const findMarriageNumb = (val: string) =>
  MARRIAGE_COUNT.find(entry => entry.value === val);

export const marriageBlock = (data: {
  partnerFlag: string;
  bloodRelation: string;
  bloodRelationDesc: string;
  marriedBefore: string;
  marriageNumb: string;
  lastMarriageStatus: string;

  partnershipType: string;
  partnershipState: string;
  partnershipTypeDissolved: string;

  handleChange: ((e: any) => void) | undefined;
  handleBloodRelChange: ((e: any) => void) | undefined;
  handleBloodRelDescChange: ((e: any) => void) | undefined;
  handleMarriedBeforeChange: ((e: any) => void) | undefined;
}) => {
  const {
    partnerFlag,
    bloodRelation,
    bloodRelationDesc,
    marriedBefore,
    marriageNumb,
    lastMarriageStatus,

    partnershipType,
    partnershipState,
    partnershipTypeDissolved,

    handleChange,
    handleBloodRelChange,
    handleBloodRelDescChange,
    handleMarriedBeforeChange,
  } = data;

  const marrigeNumInput = (marriageNumb: string) => {
    return (
      <div
        css={[
          NAME_FIELDS_BASIC_CONTAINER_STYLING,
          OVERRIDE_SELECT_DISPLAY_STYLING,
          SELECTINPUT_WRAPPER_STYLING,
        ]}
      >
        <SelectDropdown
          label="This Marriage is your ..."
          options={MARRIAGE_COUNT}
          name={`partner${partnerFlag}_marriageNumb`}
          value={marriageNumb}
          onChange={handleChange}
          softRequired={true}
          toolTip={{
            icon: '?',
            msg:
              'This information is collected as required by Massachusetts State Law Chapter 46 Section 1.',
          }}
        />
      </div>
    );
  };

  return (
    <div css={[SECTION_WRAPPER_STYLING, NAME_FIELDS_BASIC_CONTAINER_STYLING]}>
      <h1 css={[PARTNERFORM_SECTION_HEADING_STYLING]}>
        Marriage
        <div className="notice" />
      </h1>

      <div css={RADIOGROUP_CONTAINER_STYLING}>
        <div css={ONE_AND_HALF_MARGINBOTTOM}>
          <RadioGroup
            items={BOOL_RADIOGROUP}
            name={`partner${partnerFlag}_bloodRelation`}
            groupLabel="Are you related by blood or marriage to your future spouse?"
            checkedValue={bloodRelation}
            handleItemChange={handleBloodRelChange}
            hideLabel={false}
            className={`radio-group__label`}
            softRequired={true}
            toolTip={{
              icon: '?',
              msg:
                'This information is collected to ensure the marriage abides by Massachusetts State Law Chapter 207 Sections 1-8.',
            }}
          />
        </div>
      </div>

      {bloodRelation === '1' &&
        bloodRelDesc({
          partnerFlag,
          bloodRelationDesc,
          handleBloodRelDescChange,
        })}

      <div css={RADIOGROUP_CONTAINER_STYLING}>
        <div css={ONE_AND_HALF_MARGINBOTTOM}>
          <RadioGroup
            items={BOOL_RADIOGROUP}
            name={`partner${partnerFlag}_marriedBefore`}
            groupLabel="Have you ever been married before?"
            checkedValue={marriedBefore}
            handleItemChange={handleMarriedBeforeChange}
            className={`radio-group__label`}
            hideLabel={false}
            softRequired={true}
          />
        </div>
      </div>

      {marriedBefore === '1' && marrigeNumInput(marriageNumb)}

      {marriageNumb &&
        marriageNumb !== '' &&
        $lastMarriageStatus({
          partnerFlag,
          handleChange,
          lastMarriageStatus,
        })}

      {$partnershipType({
        partnerFlag,
        partnershipType,
        partnershipState,
        partnershipTypeDissolved,
        handleChange,
      })}
    </div>
  );
};

export const $lastMarriageStatus = (data: {
  partnerFlag: string;
  handleChange: ((e: any) => void) | undefined;
  lastMarriageStatus: string;
}) => {
  const { partnerFlag, handleChange, lastMarriageStatus } = data;
  return (
    <div css={SECTION_WRAPPER_STYLING}>
      <div css={[NAME_FIELDS_BASIC_CONTAINER_STYLING]}>
        <div css={RADIOGROUP_CONTAINER_STYLING}>
          <div css={ONE_AND_HALF_MARGINBOTTOM}>
            <RadioGroup
              items={LAST_MARRIAGE_STATUS}
              name={`partner${partnerFlag}_lastMarriageStatus`}
              checkedValue={lastMarriageStatus}
              groupLabel="If Applicable, Status of Last Marriage"
              handleItemChange={handleChange}
              className={`radio-group__label`}
              softRequired={true}
            />

            <label className="notice">
              If void, please provide clerk with evidence.
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export const $partnershipType = (data: {
  partnerFlag: string;
  partnershipType: string;
  partnershipState: string;
  partnershipTypeDissolved: string;
  handleChange: ((e: any) => void) | undefined;
}) => {
  const {
    partnerFlag,
    partnershipType,
    partnershipState,
    partnershipTypeDissolved,
    handleChange,
  } = data;

  return (
    <div css={SECTION_WRAPPER_STYLING}>
      <div
        css={[
          NAME_FIELDS_BASIC_CONTAINER_STYLING,
          HEADER_SPACING_STYLING,
          BOTTOM_SPACING_STYLING,
        ]}
      >
        <div css={RADIOGROUP_CONTAINER_STYLING}>
          <RadioGroup
            items={PARTNERSHIP_TYPE2}
            name={`partner${partnerFlag}_partnershipType`}
            checkedValue={partnershipType}
            handleItemChange={handleChange}
            groupLabel="Were you ever a member of a civil union or domestic partnership?"
            className={`radio-group__label`}
            hideLabel={false}
            softRequired={true}
            toolTip={{
              icon: '?',
              msg:
                'This information is collected as required by the Massachusetts State Marriage Intention Form.',
            }}
          />
        </div>
      </div>

      {partnershipType &&
        (partnershipType === 'CIV' || partnershipType === 'DOM') &&
        $dissolved({
          partnerFlag,
          partnershipState,
          partnershipTypeDissolved,
          handleChange,
        })}
    </div>
  );
};

const $dissolved = (data: {
  partnerFlag: string;
  partnershipState: string;
  partnershipTypeDissolved: string;
  handleChange: ((e: any) => void) | undefined;
}) => {
  const {
    partnerFlag,
    partnershipTypeDissolved,
    partnershipState,
    handleChange,
  } = data;

  return (
    <div
      css={[
        NAME_FIELDS_BASIC_CONTAINER_STYLING,
        HEADER_SPACING_STYLING,
        BOTTOM_SPACING_STYLING,
      ]}
    >
      <div css={RADIOGROUP_CONTAINER_STYLING}>
        <RadioGroup
          items={PARTNERSHIP_TYPE_DISSOLVED}
          name={`partner${partnerFlag}_partnershipTypeDissolved`}
          checkedValue={partnershipTypeDissolved}
          handleItemChange={handleChange}
          groupLabel="Civil Union Or Domestic Partnership: Dissolved"
          className={`radio-group__label`}
          softRequired={true}
          hideLabel={false}
        />
      </div>

      <TextInput
        label="Partnership State/Country"
        name={`partner${partnerFlag}_partnershipState`}
        value={partnershipState}
        onChange={handleChange}
        disableLabelNoWrap={true}
        maxLength={100}
      />
    </div>
  );
};

export const bloodRelDesc = (data: {
  partnerFlag: string;
  bloodRelationDesc: string;
  handleBloodRelDescChange: ((e: any) => void) | undefined;
}) => {
  const { partnerFlag, bloodRelationDesc, handleBloodRelDescChange } = data;

  return (
    <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
      <TextInput
        label="Blood Relation: If yes, how?"
        name={`partner${partnerFlag}_bloodRelationDesc`}
        value={bloodRelationDesc}
        onChange={handleBloodRelDescChange}
        disableLabelNoWrap={true}
        maxLength={100}
      />
    </div>
  );
};

export const parentsMarried = (data: {
  partnerFlag: string;
  parentsMarriedAtBirth: string;
  handleChange: ((e: any) => void) | undefined;
}) => {
  const { partnerFlag, parentsMarriedAtBirth, handleChange } = data;

  return (
    <div css={SECTION_WRAPPER_STYLING}>
      <div css={[NAME_FIELDS_BASIC_CONTAINER_STYLING, HEADER_SPACING_STYLING]}>
        <div css={RADIOGROUP_CONTAINER_STYLING}>
          <div css={ONE_AND_HALF_MARGINBOTTOM}>
            <RadioGroup
              items={BOOL_RADIOGROUP}
              groupLabel="Were your parents married at the time of your birth?"
              name={`partner${partnerFlag}_parentsMarriedAtBirth`}
              checkedValue={parentsMarriedAtBirth}
              handleItemChange={handleChange}
              className={`radio-group__label`}
              hideLabel={false}
              softRequired={true}
              toolTip={{
                icon: '?',
                msg:
                  'This information is collected as required by Massachusetts State Law Chapter 46 Section 2A. This question ensures that restrictions about impounded records are maintained for marriage information.',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const parents = (data: {
  partnerFlag: string;
  parentA_Name: string;
  parentA_Surname: string;
  parentB_Name: string;
  parentB_Surname: string;
  additionalParent: string;
  parentsMarriedAtBirth: string;
  handleChange: ((e: any) => void) | undefined;
  handleAdditionalParentChange: ((e: any) => void) | undefined;
}) => {
  const {
    partnerFlag,
    parentA_Name,
    parentA_Surname,
    parentB_Name,
    parentB_Surname,
    additionalParent,
    parentsMarriedAtBirth,
    handleChange,
    handleAdditionalParentChange,
  } = data;
  return (
    <div css={SECTION_WRAPPER_STYLING}>
      <h1 css={[PARTNERFORM_SECTION_HEADING_STYLING]}>
        Parents
        <div className="notice">
          Please enter the full names of your parent(s) as they appear on your
          birth certificate. It’s important to note that marriage licenses
          contain details about your parents and are accessible as public
          records, but they cannot be searched for by the general public.
          {ToolTip({
            icon: '?',
            msg:
              'This information is collected as required by Massachusetts State Law Chapter 46 Section 1. Marriage licenses include parental details and are public records, but not publicly searchable.',
          })}
        </div>
      </h1>

      <div
        css={[
          MARRIAGE_INTENTION_FORM_STYLING,
          TWO_AND_HALF_MARGINBOTTOM,
          NAME_FIELDS_BASIC_CONTAINER_STYLING,
        ]}
      >
        <TextInput
          label="Parent 1 - First Middle Last Name"
          name={`partner${partnerFlag}_parentA_Name`}
          value={parentA_Name}
          onChange={handleChange}
          disableLabelNoWrap={true}
          maxLength={38}
          softRequired={true}
        />

        <TextInput
          label="Parent 1 - Family Name/Last Name At the time of their birth or adoption"
          name={`partner${partnerFlag}_parentA_Surname`}
          value={parentA_Surname}
          onChange={handleChange}
          disableLabelNoWrap={true}
          maxLength={38}
          optionalDescription={
            'This information might be found on your birth certificate.'
          }
          softRequired={true}
        />

        <div css={RADIOGROUP_CONTAINER_STYLING}>
          <RadioGroup
            items={BOOL_RADIOGROUP}
            name={`partner${partnerFlag}_additionalParent`}
            checkedValue={additionalParent}
            handleItemChange={handleAdditionalParentChange}
            groupLabel="Do you have a second parent?"
            className={`radio-group__label`}
            softRequired={true}
            hideLabel={false}
          />
        </div>

        {additionalParent === '1' &&
          $additionalParent({
            partnerFlag,
            parentB_Name,
            parentB_Surname,
            handleChange,
          })}

        {parentsMarried({
          partnerFlag,
          parentsMarriedAtBirth,
          handleChange,
        })}
      </div>
    </div>
  );
};

export const $additionalParent = (data: {
  partnerFlag: string;
  parentB_Name: string;
  parentB_Surname: string;
  handleChange: ((e: any) => void) | undefined;
}) => {
  const { partnerFlag, parentB_Name, parentB_Surname, handleChange } = data;
  return (
    <>
      <TextInput
        label="Parent 2 - First Middle Last Name"
        name={`partner${partnerFlag}_parentB_Name`}
        value={parentB_Name}
        onChange={handleChange}
        disableLabelNoWrap={true}
        maxLength={38}
      />

      <TextInput
        label="Parent 2 - Family Name/Last Name At the time of their birth or adoption"
        name={`partner${partnerFlag}_parentB_Surname`}
        value={parentB_Surname}
        onChange={handleChange}
        disableLabelNoWrap={true}
        maxLength={38}
        optionalDescription={
          "This should be your parent's last name at the time of their birth or adoption."
        }
      />
    </>
  );
};
