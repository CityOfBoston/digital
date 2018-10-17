import React from 'react';
import { Formik, FormikProps, Field } from 'formik';
import { css } from 'emotion';

import {
  applyFormSchema as validationSchema,
  ApplyFormValues,
} from '../lib/validationSchema';

import { Commission } from './graphql/fetch-commissions';

import { FileInput, SectionHeader, Textarea } from '@cityofboston/react-fleet';

import TextInputContainer from './common/TextInputContainer';
import ApplicantInformationSection from './ApplicantInformationSection';
import CommissionsListSection from './CommissionsListSection';

interface Props {
  selectedCommissionId: string | null;
  commissionsWithOpenSeats: Commission[];
  commissionsWithoutOpenSeats: Commission[];
  handleSubmit(): Promise<void>;
  formRef: React.RefObject<HTMLFormElement>;
}

const PARAGRAPH_STYLING = css({
  marginTop: '1.25rem',
  marginBottom: '2rem',
});

// todo: https://github.com/CityOfBoston/digital/pull/97/files#r224776915

export default function ApplicationForm(props: Props): JSX.Element {
  const enablingLegislationText: JSX.Element = (
    <p className={PARAGRAPH_STYLING}>
      Please note that many of these Boards and Commissions require City of
      Boston residency as well as specific qualifications for members. Please
      familiarize yourself with each{' '}
      <a href="#">Board or Commissions’s Enabling Legislation</a>. If you have
      any questions, email{' '}
      <a href="mailto:boardsandcommissions@boston.gov">
        boardsandcommissions@boston.gov
      </a>.
    </p>
  );

  const canStillApplyText: JSX.Element = (
    <p className={PARAGRAPH_STYLING}>
      You can apply for a board or commission that does not currently have any
      open positions, and we will review your application when a seat opens.
    </p>
  );

  const initialFormValues: ApplyFormValues = {
    firstName: '',
    middleName: '',
    lastName: '',
    streetAddress: '',
    unit: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    confirmEmail: '',
    commissionIds: props.selectedCommissionId
      ? [props.selectedCommissionId]
      : [],
    degreeAttained: '',
    educationalInstitution: '',
    otherInformation: '',
    coverLetter: null,
    resume: null,
  };

  return (
    <Formik
      initialValues={initialFormValues}
      validationSchema={validationSchema}
      onSubmit={async (_, { setSubmitting }) => {
        try {
          await props.handleSubmit();
        } finally {
          setSubmitting(false);
        }
      }}
      render={({
        values,
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        setFieldValue,
        isSubmitting,
        isValid,
      }: FormikProps<ApplyFormValues>) => (
        <form onSubmit={handleSubmit} ref={props.formRef}>
          <h1 className="sh-title">Boards and Commissions Application Form</h1>

          {enablingLegislationText}

          {canStillApplyText}

          <ApplicantInformationSection />

          <hr className="hr hr--sq" />

          <section>
            <SectionHeader title="Education and Experience" />

            <Field
              component={TextInputContainer}
              label="Degree Attained"
              name="degreeAttained"
              placeholder="Degree Attained"
            />

            <Field
              component={TextInputContainer}
              label="Educational Institution"
              name="educationalInstitution"
              placeholder="Educational Institution"
            />

            <Textarea
              name="otherInformation"
              label="Relevant Work Experience"
              placeholder="Other information..."
              value={values.otherInformation}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
              small
            />
          </section>

          <hr className="hr hr--sq" />

          <CommissionsListSection
            commissionsWithOpenSeats={props.commissionsWithOpenSeats}
            commissionsWithoutOpenSeats={props.commissionsWithoutOpenSeats}
            selectedCommissionIds={values.commissionIds}
            errors={errors}
            paragraphElement={canStillApplyText}
          />

          <hr className="hr hr--sq" />

          <section>
            <SectionHeader title="Reference Information" />

            <p className="m-b400">
              Files must be PDFs and under 5MB each in size.
            </p>

            <FileInput
              name="coverLetter"
              title="Cover Letter"
              fileTypes={['application/pdf']}
              sizeLimit={{ amount: 5, unit: 'MB' }}
              handleChange={setFieldValue}
            />

            <FileInput
              name="resume"
              title="Resumé"
              fileTypes={['application/pdf']}
              sizeLimit={{ amount: 5, unit: 'MB' }}
              handleChange={setFieldValue}
            />
          </section>

          <hr className="hr hr--sq" style={{ marginTop: '3rem' }} />

          {enablingLegislationText}

          <button
            type="submit"
            className="btn btn--700"
            disabled={isSubmitting || !isValid}
          >
            Submit Application
          </button>
        </form>
      )}
    />
  );
}
