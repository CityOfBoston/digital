import React from 'react';
import { FormikProps } from 'formik';
import { css } from 'emotion';

import { ApplyFormValues } from '../lib/validationSchema';

import { Commission } from './graphql/fetch-commissions';

import {
  FileInput,
  SectionHeader,
  Textarea,
  TextInput,
  StatusModal,
} from '@cityofboston/react-fleet';

import ApplicantInformationSection from './ApplicantInformationSection';
import CommissionsListSection from './CommissionsListSection';
import { PARAGRAPH_STYLING } from './common/style-common';

type RequiredFormikProps = Pick<
  FormikProps<ApplyFormValues>,
  | 'values'
  | 'errors'
  | 'touched'
  | 'handleBlur'
  | 'handleChange'
  | 'handleSubmit'
  | 'setFieldValue'
  | 'isSubmitting'
  | 'isValid'
>;

export interface Props extends RequiredFormikProps {
  commissions: Commission[];
  submissionError?: boolean;
  clearSubmissionError: () => void;
}

export interface FieldProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
}

// todo: https://github.com/CityOfBoston/digital/pull/97/files#r224776915

const FORM_STYLING = css({
  WebkitTextSizeAdjust:
    '100%' /* Prevent font scaling in OSX landscape while allowing user zoom */,
  'input, textarea': {
    borderRadius: 0,
  },
});

export default function ApplicationForm(props: Props): JSX.Element {
  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
    isSubmitting,
    isValid,
    submissionError,
    clearSubmissionError,
  } = props;

  const makeField = ({
    name,
    label,
    placeholder,
    required,
    maxLength,
  }: FieldProps) => (
    <TextInput
      small
      name={name}
      label={label}
      placeholder={placeholder}
      error={touched[name] && errors[name]}
      value={values[name]}
      id={`ApplicationForm-${name}`}
      onBlur={handleBlur}
      onChange={handleChange}
      required={required}
      maxLength={maxLength}
    />
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={FORM_STYLING}
      aria-labelledby="form-title"
    >
      <h1 className="sh-title" id="form-title">
        Boards and Commissions Application Form
      </h1>

      <p className={PARAGRAPH_STYLING}>
        Please note that many of these Boards and Commissions require City of
        Boston residency as well as specific qualifications for members. Please
        familiarize yourself with each board or commissions’s enabling
        legislation. If you have any questions, email{' '}
        <a href="mailto:boardsandcommissions@boston.gov">
          boardsandcommissions@boston.gov
        </a>
        .
      </p>

      <ApplicantInformationSection makeField={makeField} />

      <hr className="hr hr--sq" aria-hidden />

      <section
        aria-labelledby={SectionHeader.makeId('Education and Experience')}
      >
        <SectionHeader title="Education and Experience" />

        {makeField({
          label: 'Degree Attained',
          name: 'degreeAttained',
          placeholder: 'Degree Attained',
          maxLength: 100,
        })}

        {makeField({
          label: 'Educational Institution',
          name: 'educationalInstitution',
          placeholder: 'Educational Institution',
          maxLength: 100,
        })}

        <Textarea
          name="otherInformation"
          label="Relevant Work Experience"
          placeholder="Other information..."
          value={values.otherInformation}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched['otherInformation'] && errors['otherInformation']}
          rows={3}
          maxLength={1000}
          small
        />
      </section>

      <hr className="hr hr--sq" aria-hidden />

      <CommissionsListSection
        commissions={props.commissions}
        selectedCommissionIds={values.commissionIds}
        setSelectedIds={ids => setFieldValue('commissionIds', ids)}
      />

      <hr className="hr hr--sq" aria-hidden />

      <section aria-labelledby={SectionHeader.makeId('Reference Information')}>
        <SectionHeader title="Reference Information" />

        <p className="m-b400">Files must be PDFs and under 5MB each in size.</p>

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

      <hr className="hr hr--sq" aria-hidden style={{ marginTop: '3rem' }} />

      <button
        type="submit"
        className="btn btn--700"
        disabled={isSubmitting || !isValid || submissionError}
      >
        {isSubmitting ? 'Submitting…' : 'Submit Application'}
      </button>

      {isSubmitting && (
        <StatusModal message="Submitting application…" waiting>
          <div className="t--info m-t300">
            Please be patient and don’t refresh your browser. This might take a
            bit.
          </div>
        </StatusModal>
      )}

      {submissionError && (
        <StatusModal
          message="Something went wrong!"
          error
          onClose={clearSubmissionError}
        >
          <div className="t--info m-t300">
            You can try again. If this keeps happening, please contact{' '}
            <a href="mailto:boardsandcommissions@boston.gov">
              boardsandcommissions@boston.gov
            </a>
            .
          </div>
        </StatusModal>
      )}
    </form>
  );
}
