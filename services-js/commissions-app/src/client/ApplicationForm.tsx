import React from 'react';
import { Formik, FormikProps, Form, Field } from 'formik';
import { css } from 'emotion';

import { applicationForm as validationSchema } from '../lib/validationSchema';

import { Commission } from './graphql/fetch-commissions';

import { FileInput, SectionHeader, Textarea } from '@cityofboston/react-fleet';

import TextInputContainer from './common/TextInputContainer';
import ApplicantInformationSection from './ApplicantInformationSection';
import CommissionsListSection from './CommissionsListSection';

interface FormValues {
  firstName: string;
  middleName: string;
  lastName: string;
  streetAddress: string;
  unit: string;
  state: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
  confirmEmail: string;
  selectedCommissions: Commission[];
  typeOfDegree: string;
  degreeAttained: string;
  educationalInstitution: string;
  otherInformation: string;
  comments: string;
  coverLetter: any;
  resume: any;
}

interface Props {
  commissionsWithOpenSeats: Commission[];
  commissionsWithoutOpenSeats: Commission[];
  handleSubmit(values: FormValues): void;
}

const PARAGRAPH_STYLING = css({
  marginTop: '1.25rem',
  marginBottom: '2rem',
});

// todo: https://github.com/CityOfBoston/digital/pull/97/files#r224776915

export default function ApplicationForm(props: Props): JSX.Element {
  return (
    <Formik
      initialValues={{
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
        selectedCommissions: [],
        typeOfDegree: '',
        degreeAttained: '',
        educationalInstitution: '',
        otherInformation: '',
        comments: '',
        coverLetter: null,
        resume: null,
      }}
      validationSchema={validationSchema}
      onSubmit={values => props.handleSubmit(values)}
      render={({
        values,
        errors,
        touched,
        handleBlur,
        handleChange,
        setFieldValue,
      }: FormikProps<FormValues>) => (
        <Form>
          <SectionHeader title="Applicant Information" />

          <ApplicantInformationSection />

          <hr className="hr hr--sq" />

          <SectionHeader title="Education and Experience" />

          <Field
            component={TextInputContainer}
            label="Type of Degree"
            name="typeOfDegree"
            placeholder="Type of Degree"
          />

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

          <Field
            component={TextInputContainer}
            label="Other Information"
            name="otherInformation"
            placeholder="Other Information"
          />

          <hr className="hr hr--sq" />

          <CommissionsListSection
            commissionsWithOpenSeats={props.commissionsWithOpenSeats}
            commissionsWithoutOpenSeats={props.commissionsWithoutOpenSeats}
            selectedCommissions={values.selectedCommissions}
            errors={errors}
            touched={touched}
            handleBlur={handleBlur}
            paragraphClassName={PARAGRAPH_STYLING}
          />

          <hr className="hr hr--sq" />

          <SectionHeader title="Reference Information" />

          <p className="m-b400">
            Files must be in PDF format, and under 28MB in size.
          </p>

          <FileInput
            name="coverLetter"
            title="Cover Letter"
            fileTypes={['application/pdf']}
            sizeLimit={{ amount: 28, unit: 'MB' }}
            handleChange={setFieldValue}
          />

          <FileInput
            name="resume"
            title="Resumé"
            fileTypes={['application/pdf']}
            sizeLimit={{ amount: 28, unit: 'MB' }}
            handleChange={setFieldValue}
          />

          <hr className="hr hr--sq" style={{ marginTop: '3rem' }} />

          <SectionHeader title="Relevant Work Experience" />

          <Textarea
            name="comments"
            label="Relevant Work Experience"
            placeholder="Other information..."
            value={values.comments}
            onChange={handleChange}
            onBlur={handleBlur}
            small
            hideLabel
          />

          <p className={PARAGRAPH_STYLING}>
            Please note that many Boards and Commissions require specifically
            prescribed qualifications for members. You should familiarize
            yourself with the Enabling Legislation before applying.
          </p>

          <button type="submit" className="btn btn--700">
            Submit Application
          </button>
        </Form>
      )}
    />
  );
}
