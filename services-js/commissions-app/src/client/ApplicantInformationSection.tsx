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
  makeField: (props: FieldProps) => JSX.Element;
}

export default function ApplicantInformationSection({
  makeField,
}: Props): JSX.Element {
  return (
    <section aria-labelledby={SectionHeader.makeId('Applicant Information')}>
      <SectionHeader title="Applicant Information" />

      <div className={SPLIT_STYLING}>
        <div className={NAME_STREET_STYLING}>
          {makeField({
            label: 'First Name',
            name: 'firstName',
            placeholder: 'First Name',
            required: true,
            maxLength: 25,
          })}

          {makeField({ label: 'Initial', name: 'middleName', maxLength: 50 })}
        </div>

        {makeField({
          label: 'Last Name',
          name: 'lastName',
          placeholder: 'Last Name',
          required: true,
          maxLength: 50,
        })}
      </div>

      <div className={NAME_STREET_STYLING}>
        {makeField({
          label: 'Street Address',
          name: 'streetAddress',
          placeholder: 'Street Address',
          required: true,
          maxLength: 50,
        })}

        {makeField({
          label: 'Unit',
          name: 'unit',
          placeholder: 'Unit',
          maxLength: 50,
        })}
      </div>

      <div className={SPLIT_STYLING}>
        {makeField({
          label: 'City',
          name: 'city',
          placeholder: 'City',
          required: true,
          maxLength: 50,
        })}

        <div className={STATE_ZIP_STYLING}>
          {makeField({
            label: 'State',
            name: 'state',
            placeholder: 'State',
            required: true,
            maxLength: 50,
          })}

          {makeField({
            label: 'Zip',
            name: 'zip',
            placeholder: 'Zip Code',
            required: true,
            maxLength: 5,
          })}
        </div>
      </div>

      {makeField({
        label: 'Phone',
        name: 'phone',
        placeholder: '(XXX) XXX-XXXX',
        maxLength: 50,
      })}

      {makeField({
        label: 'Email',
        name: 'email',
        placeholder: 'Email',
        required: true,
        maxLength: 50,
      })}

      {makeField({
        label: 'Confirm Email',
        name: 'confirmEmail',
        placeholder: 'Confirm Email',
        required: true,
        maxLength: 50,
      })}
    </section>
  );
}
