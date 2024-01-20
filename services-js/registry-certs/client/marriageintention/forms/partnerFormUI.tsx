/** @jsx jsx */
import { jsx } from '@emotion/core';

import {
  RadioGroup,
  TextInput,
  SelectDropdown,
  MemorableDateInput,
} from '@cityofboston/react-fleet';

import {
  SECTION_HEADING_STYLING,
  SECTION_WRAPPER_STYLING,
  NAME_FIELDS_CONTAINER_STYLING,
  NAME_FIELDS_BASIC_CONTAINER_STYLING,
  HEADER_SPACING_STYLING,
  RADIOGROUP_CONTAINER_STYLING,
  OVERRIDE_SELECT_DISPLAY_STYLING,
  HEADER_PADDING_TOP_STYLING,
  MARRIAGE_INTENTION_FORM_STYLING,
} from '../../common/question-components/styling';

import {
  BOTTOM_SPACING_STYLING,
  ONE_AND_HALF_MARGINBOTTOM,
  TWO_AND_HALF_MARGINBOTTOM,
} from './styling';

import {
  SUFFIX_OPTIONS,
  LAST_MARRIAGE_STATUS,
  US_STATES,
  COUNTRIES,
  MARRIAGE_COUNT,
  BOOL_RADIOGROUP,
  PARTNERSHIP_TYPE_DISSOLVED,
  PARTNERSHIP_TYPE,
} from './inputData';

export const nameFields = (data: {
  partnerFlag: string;
  handleChange: ((e: any) => void) | undefined;
  handleResidenceStateChange: ((e: any) => void) | undefined;
  firstName: string;
  lastName: string;
  middleName: string;
  surName: string;
  occupation: string;
  suffix: string;
}) => {
  const {
    partnerFlag,
    firstName,
    lastName,
    middleName,
    surName,
    occupation,
    suffix,
    handleChange,
    handleResidenceStateChange,
  } = data;
  return (
    <div css={[SECTION_WRAPPER_STYLING, NAME_FIELDS_BASIC_CONTAINER_STYLING]}>
      <TextInput
        label="First Name"
        name={`partner${partnerFlag}_firstName`}
        value={firstName}
        onChange={handleChange}
        disableLabelNoWrap={true}
        maxLength={100}
      />

      <TextInput
        label="Middle Name"
        name={`partner${partnerFlag}_middleName`}
        value={middleName}
        onChange={handleChange}
        disableLabelNoWrap={true}
        optionalDescription={
          'This is your current middle name if you have one. You may not list a new middle name.'
        }
        maxLength={50}
      />

      <TextInput
        label="Last Name"
        name={`partner${partnerFlag}_lastName`}
        value={lastName}
        onChange={handleChange}
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
          name={`partner${partnerFlag}_surName`}
          value={surName}
          onChange={handleChange}
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
          options={SUFFIX_OPTIONS}
          name={`partner${partnerFlag}_suffix`}
          value={suffix}
          onChange={handleResidenceStateChange}
        />
      </div>

      <TextInput
        label="Occupation"
        name={`partner${partnerFlag}_occupation`}
        value={occupation}
        onChange={handleChange}
        disableLabelNoWrap={true}
        maxLength={100}
      />
    </div>
  );
};

export const dateOfBirth = (data: {
  partnerDOB: Date | null | undefined;
  partnerAge: string;
  partnerFlag: string;
  handleChange: ((e: any) => void) | undefined;
  handleBirthDateChange: (newDate: Date | null) => void;
}) => {
  const {
    partnerDOB,
    partnerAge,
    partnerFlag,
    handleChange,
    handleBirthDateChange,
  } = data;

  return (
    <div css={SECTION_WRAPPER_STYLING}>
      <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
        <h2 css={SECTION_HEADING_STYLING} style={{ marginBottom: '1.5rem' }}>
          Date of Birth
        </h2>
        <MemorableDateInput
          hideLengend={true}
          legend={`Person ${partnerFlag} Date of Birth`}
          initialDate={partnerDOB || undefined}
          componentId="dob"
          onlyAllowPast={true}
          handleDate={handleBirthDateChange}
        />
      </div>

      <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
        <TextInput
          label="Age"
          name={`partner${partnerFlag}_age`}
          value={partnerAge}
          onChange={handleChange}
          maxLength={2}
          disabled={true}
          disableLabelNoWrap={true}
          optionalDescription={
            'Your age will be automatically calculated based on your date of birth.'
          }
        />
      </div>
    </div>
  );
};

export const birthCity = (data: {
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
      />
    </div>
  );
};

export const birthStateZip = (data: {
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
    <div css={SECTION_WRAPPER_STYLING}>
      <div css={NAME_FIELDS_CONTAINER_STYLING}>
        <div css={OVERRIDE_SELECT_DISPLAY_STYLING}>
          <div className="fs-c m-b300">
            <div className="sel">
              <SelectDropdown
                label="Birthplace State/Province"
                hideBlankOption
                options={US_STATES}
                name={`partner${partnerFlag}_birthState`}
                value={birthStateStr}
                onChange={handleChange}
                onBlur={checkBirthCityForNeighborhood}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const birthPlace = (data: {
  partnerFlag: string;
  birthCityStr: string;
  birthCountryStr: string;
  birthStateStr: string;
  handleChange: ((e: any) => void) | undefined;
  handleBirthplaceCountryChange: ((e: any) => void) | undefined;
  checkBirthCityForNeighborhood: ((e: any) => void) | undefined;
}) => {
  const {
    birthCountryStr,
    birthCityStr,
    birthStateStr,
    partnerFlag,
    handleChange,
    handleBirthplaceCountryChange,
    checkBirthCityForNeighborhood,
  } = data;
  return (
    <div css={SECTION_WRAPPER_STYLING}>
      <div css={[NAME_FIELDS_BASIC_CONTAINER_STYLING, HEADER_SPACING_STYLING]}>
        <h2 css={SECTION_HEADING_STYLING}>Birthplace</h2>

        <div
          css={[
            NAME_FIELDS_BASIC_CONTAINER_STYLING,
            OVERRIDE_SELECT_DISPLAY_STYLING,
          ]}
        >
          <SelectDropdown
            label="Birthplace Country"
            name={`partner${partnerFlag}_birthCountry`}
            options={COUNTRIES}
            value={birthCountryStr}
            onChange={handleBirthplaceCountryChange}
            onBlur={checkBirthCityForNeighborhood}
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
    </div>
  );
};

export const residenceZip = (data: {
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
      />
    </div>
  );
};

export const residenceState = (data: {
  partnerFlag: string;
  residenceStateStr: string;
  handleResidenceStateChange: ((e: any) => void) | undefined;
}) => {
  const { partnerFlag, residenceStateStr, handleResidenceStateChange } = data;

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
                name={`partner${partnerFlag}_residenceState`}
                value={residenceStateStr}
                onChange={handleResidenceStateChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const residenceCity = (data: {
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
      />
    </div>
  );
};

export const residence = (data: {
  partnerFlag: string;
  marriageNumb: string;
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
    marriageNumb,
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
  return (
    <div css={SECTION_WRAPPER_STYLING}>
      <div css={NAME_FIELDS_BASIC_CONTAINER_STYLING}>
        <h2 css={SECTION_HEADING_STYLING}>Residence</h2>
      </div>

      <div
        css={[TWO_AND_HALF_MARGINBOTTOM, NAME_FIELDS_BASIC_CONTAINER_STYLING]}
      >
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
                options={COUNTRIES}
                name={`partner${partnerFlag}_residenceCountry`}
                value={residenceCountryStr}
                onChange={handleResidenceCountryChange}
                disableLabelNoWrap={true}
              />
            </div>
          </div>
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
                options={MARRIAGE_COUNT}
                name={`partner${partnerFlag}_marriageNumb`}
                value={marriageNumb}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const lastMarriageStatus = (data: {
  partnerFlag: string;
  handleChange: ((e: any) => void) | undefined;
  lastMarriageStatus: string;
}) => {
  const { partnerFlag, handleChange, lastMarriageStatus } = data;
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
            name={`partner${partnerFlag}_lastMarriageStatus`}
            checkedValue={lastMarriageStatus}
            handleItemChange={handleChange}
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
};

export const bloodRelation = (data: {
  partnerFlag: string;
  bloodRelation: string;
  bloodRelationDesc: string;
  handleBloodRelChange: ((e: any) => void) | undefined;
  handleBloodRelDescChange: ((e: any) => void) | undefined;
}) => {
  const {
    partnerFlag,
    bloodRelation,
    bloodRelationDesc,
    handleBloodRelChange,
    handleBloodRelDescChange,
  } = data;
  return (
    <div css={SECTION_WRAPPER_STYLING}>
      <div css={[NAME_FIELDS_BASIC_CONTAINER_STYLING, HEADER_SPACING_STYLING]}>
        <h2 css={SECTION_HEADING_STYLING}>
          Related by blood or marriage to Person B
        </h2>

        <div css={RADIOGROUP_CONTAINER_STYLING}>
          <div css={ONE_AND_HALF_MARGINBOTTOM}>
            <RadioGroup
              items={BOOL_RADIOGROUP}
              name={`partner${partnerFlag}_bloodRelation`}
              groupLabel=""
              checkedValue={bloodRelation}
              handleItemChange={handleBloodRelChange}
              hideLabel
            />
          </div>
        </div>
      </div>

      {bloodRelation === '1' &&
        bloodRelDesc({
          partnerFlag,
          bloodRelationDesc,
          handleBloodRelDescChange,
        })}
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
        <h2 css={SECTION_HEADING_STYLING}>
          Were your parents married at the time of your birth?
        </h2>

        <div css={RADIOGROUP_CONTAINER_STYLING}>
          <div css={ONE_AND_HALF_MARGINBOTTOM}>
            <RadioGroup
              items={BOOL_RADIOGROUP}
              groupLabel=""
              name={`partner${partnerFlag}_parentsMarriedAtBirth`}
              checkedValue={parentsMarriedAtBirth}
              handleItemChange={handleChange}
              hideLabel
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
  handleChange: ((e: any) => void) | undefined;
}) => {
  const {
    partnerFlag,
    parentA_Name,
    parentA_Surname,
    parentB_Name,
    parentB_Surname,
    handleChange,
  } = data;
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
          name={`partner${partnerFlag}_parentA_Name`}
          value={parentA_Name}
          onChange={handleChange}
          disableLabelNoWrap={true}
          maxLength={38}
        />

        <TextInput
          label="Parent 1/Mother - Maiden Name/Surname at Birth or Adoption"
          name={`partner${partnerFlag}_parentA_Surname`}
          value={parentA_Surname}
          onChange={handleChange}
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
          name={`partner${partnerFlag}_parentB_Name`}
          value={parentB_Name}
          onChange={handleChange}
          disableLabelNoWrap={true}
          maxLength={38}
        />

        <TextInput
          label="Parent 2/Father - Maiden Name/Surname at Birth or Adoption"
          name={`partner${partnerFlag}_parentB_Surname`}
          value={parentB_Surname}
          onChange={handleChange}
          disableLabelNoWrap={true}
          maxLength={38}
          optionalDescription={
            "This should be your parent's last name at the time of their birth or adoption."
          }
        />
      </div>
    </div>
  );
};

const dissolved = (data: {
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
      <h3 css={SECTION_HEADING_STYLING}>
        Civil Union Or Domestic Partnership: Dissolved
      </h3>

      <div css={RADIOGROUP_CONTAINER_STYLING}>
        <RadioGroup
          items={PARTNERSHIP_TYPE_DISSOLVED}
          name={`partner${partnerFlag}_partnershipTypeDissolved`}
          checkedValue={partnershipTypeDissolved}
          handleItemChange={handleChange}
          groupLabel=""
          hideLabel
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

export const partnershipType = (data: {
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
        <h2 css={SECTION_HEADING_STYLING}>Were you ever a member of a ...</h2>

        <div css={RADIOGROUP_CONTAINER_STYLING}>
          <RadioGroup
            items={PARTNERSHIP_TYPE}
            name={`partner${partnerFlag}_partnershipType`}
            checkedValue={partnershipType}
            handleItemChange={handleChange}
            groupLabel=""
            hideLabel
          />
        </div>
      </div>

      {partnershipType &&
        (partnershipType === 'CIV' || partnershipType === 'DOM') &&
        dissolved({
          partnerFlag,
          partnershipState,
          partnershipTypeDissolved,
          handleChange,
        })}
    </div>
  );
};
