import React from 'react';
import { css } from 'emotion';

import { MEDIA_MEDIUM, SectionHeader } from '@cityofboston/react-fleet';

import { FieldProps } from './ApplicationForm';

/**
 * Fleet grid classes behave as block elements at narrow viewports, which
 * prevents fields from being positioned in the same row when on mobile.
 *
 * If flexbox support is not available, fields will be treated as block elements.
 */

const COLUMN_GAP = 0.75;

const COMMON_GROUP_STYLING = `
  display: flex;
  
  > div:not(:last-of-type) {
    margin-right: ${COLUMN_GAP}rem;
    
    ${MEDIA_MEDIUM} {
      margin-right: ${COLUMN_GAP * 2}rem;  
    }
  }
`;

const NAME_STREET_STYLING = css(`
  ${COMMON_GROUP_STYLING}
  
  > div {
    &:first-of-type {
      flex-grow: 1;
    }
    
    &:last-of-type {
      flex-basis: 4rem;
    }
  }
`);

const STATE_ZIP_STYLING = css(`
  ${COMMON_GROUP_STYLING}
  
  > div {
    &:first-of-type {
      flex-basis: 8rem;
      white-space: nowrap;
    }
    
    &:last-of-type {
      flex-grow: 1;
    }
  }
`);

const SPLIT_STYLING = css(`  
  ${MEDIA_MEDIUM} {
    display: flex;
    
    > div {
      flex-basis: 50%;
      
      &:first-of-type {
        margin-right: ${COLUMN_GAP * 2}rem;
      }
    }
  }
`);

interface Props {
  // Slight hackery to avoid passing all the Formik props this deeply. We prefer
  // this over Formik’s built-in Field component because that requires context
  // to work.
  Field: (props: FieldProps) => JSX.Element;
}

export default function ApplicantInformationSection({
  Field,
}: Props): JSX.Element {
  return (
    <section>
      <SectionHeader title="Applicant Information" />

      <div className={SPLIT_STYLING}>
        <div className={NAME_STREET_STYLING}>
          <Field
            label="First Name"
            name="firstName"
            placeholder="First Name"
            required
          />

          <Field label="Initial" name="middleName" />
        </div>

        <Field
          label="Last Name"
          name="lastName"
          placeholder="Last Name"
          required
        />
      </div>

      <div className={NAME_STREET_STYLING}>
        <Field
          label="Street Address"
          name="streetAddress"
          placeholder="Street Address"
          required
        />

        <Field label="Unit" name="unit" placeholder="Unit or Apartment #" />
      </div>

      <div className={SPLIT_STYLING}>
        <Field label="City" name="city" placeholder="City" required />

        <div className={STATE_ZIP_STYLING}>
          <Field label="State" name="state" placeholder="State" required />

          <Field label="Zip" name="zip" placeholder="Zip Code" required />
        </div>
      </div>

      <Field label="Phone" name="phone" placeholder="Phone Number" />

      <Field label="Email" name="email" placeholder="Email" required />

      <Field
        label="Confirm Email"
        name="confirmEmail"
        placeholder="Confirm Email"
        required
      />
    </section>
  );
}
