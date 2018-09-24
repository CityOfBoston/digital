import React from 'react';
import { Field } from 'formik';
import { css } from 'emotion';

import { MEDIA_MEDIUM } from '@cityofboston/react-fleet';

import TextInputContainer from './common/TextInputContainer';


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
      flex-basis: 7rem;
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


export default function ApplicantInformationSection(): JSX.Element {
  return (
    <section>
      <div className={SPLIT_STYLING}>
        <div className={NAME_STREET_STYLING}>
          <Field
            component={TextInputContainer}
            label="First Name"
            name="firstName"

            placeholder="First Name"
            required
          />

          <Field
            component={TextInputContainer}
            label="Initial"
            name="middleName"
          />
        </div>

        <Field
          component={TextInputContainer}
          label="Last Name"
          name="lastName"

          placeholder="Last Name"
          required
        />
      </div>

      <div className={NAME_STREET_STYLING}>
        <Field
          component={TextInputContainer}
          label="Street Address"
          name="streetAddress"

          placeholder="Street Address"
          required
        />

        <Field
          component={TextInputContainer}
          label="Unit"
          name="unit"
          placeholder="Unit or Apartment #"
        />
      </div>

      <div className={SPLIT_STYLING}>
        <Field
          component={TextInputContainer}
          label="City"
          name="city"

          placeholder="City"
          required
        />

        <div className={STATE_ZIP_STYLING}>
          <Field
            component={TextInputContainer}
            label="State"
            name="state"

            placeholder="State"
            required
          />

          <Field
            component={TextInputContainer}
            label="Zip"
            name="zip"

            placeholder="Zip Code"
            required
          />
        </div>
      </div>

      <Field
        component={TextInputContainer}
        label="Phone"
        name="phone"

        placeholder="Phone Number"
        required
      />

      <Field
        component={TextInputContainer}
        label="Email"
        name="email"

        placeholder="Email"
        required
      />

      <Field
        component={TextInputContainer}
        label="Confirm Email"
        name="confirmEmail"

        placeholder="Confirm Email"
        required
      />
    </section>
  );
}
