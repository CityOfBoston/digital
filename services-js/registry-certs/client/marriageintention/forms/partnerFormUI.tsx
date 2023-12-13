/** @jsx jsx */
import { jsx } from '@emotion/core';

import {
  RadioGroup,
  TextInput,
  SelectDropdown,
  // MemorableDateInput,
} from '@cityofboston/react-fleet';

import {
  SECTION_HEADING_STYLING,
  SECTION_WRAPPER_STYLING,
  // NAME_FIELDS_CONTAINER_STYLING,
  NAME_FIELDS_BASIC_CONTAINER_STYLING,
  HEADER_SPACING_STYLING,
  RADIOGROUP_CONTAINER_STYLING,
  // HEADER_PADDING_TOP_STYLING,
  OVERRIDE_SELECT_DISPLAY_STYLING,
  // MARRIAGE_INTENTION_FORM_STYLING,
} from '../../common/question-components/styling';

import {
  BOTTOM_SPACING_STYLING,
  // ONE_AND_HALF_MARGINBOTTOM,
  // TWO_AND_HALF_MARGINBOTTOM,
} from './styling';

import {
  SUFFIX_OPTIONS,
  LAST_MARRIAGE_STATUS,
  // BOOL_RADIOGROUP,
  // COUNTRIES,
  // PARTNERSHIP_TYPE_DISSOLVED,
  // PARTNERSHIP_TYPE,
  // MARRIAGE_COUNT,
  // US_STATES,
  // BOSTON_NEIGHBORHOODS,
} from './inputData';

export const lastMarriageStatus = (data: {
  handleChange: ((e: any) => void) | undefined;
  partnerA_lastMarriageStatus: string;
}) => {
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
            checkedValue={data.partnerA_lastMarriageStatus}
            handleItemChange={data.handleChange}
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

export const nameFields = (
  handleChange: ((e: any) => void) | undefined,
  handleResidenceStateChange: ((e: any) => void) | undefined,
  partnerA_firstName: string,
  partnerA_lastName: string,
  partnerA_middleName: string,
  partnerA_surName: string,
  partnerA_occupation: string,
  partnerA_suffix: string
) => {
  return (
    <div css={[SECTION_WRAPPER_STYLING, NAME_FIELDS_BASIC_CONTAINER_STYLING]}>
      <TextInput
        label="First Name"
        name="partnerA_firstName"
        value={partnerA_firstName}
        onChange={handleChange}
        disableLabelNoWrap={true}
        maxLength={100}
      />

      <TextInput
        label="Middle Name"
        name="partnerA_middleName"
        value={partnerA_middleName}
        onChange={handleChange}
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
          name="partnerA_surName"
          value={partnerA_surName}
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
          // hideBlankOption
          options={SUFFIX_OPTIONS}
          name={'partnerA_suffix'}
          value={partnerA_suffix}
          onChange={handleResidenceStateChange}
        />
      </div>

      <TextInput
        label="Occupation"
        name="partnerA_occupation"
        value={partnerA_occupation}
        onChange={handleChange}
        disableLabelNoWrap={true}
        maxLength={100}
      />
    </div>
  );
};
