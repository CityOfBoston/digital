import React from 'react';
import Head from 'next/head';
import { Formik, FormikProps, Form, FieldArray, Field } from 'formik';
import { css } from 'emotion';

import fetchCommissions, { Commission } from '../../client/graphql/fetch-commissions';
import { applicationForm as validationSchema } from '../../lib/validationSchema';

import {
  Checkbox,
  FileInput,
  SectionHeader,
  Textarea,
  FREEDOM_RED as A11Y_RED,
  PUBLIC_CSS_URL
} from '@cityofboston/react-fleet';

import TextInputContainer from '../../client/common/TextInputContainer';
import ApplicantInformationSection from '../../client/ApplicantInformationSection';


interface Props {
  commissions: Commission[];
  commissionID: string | undefined;
}

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
  commissionIds: string[],
  typeOfDegree: string;
  degreeAttained: string;
  educationalInstitution: string;
  otherInformation: string;
  comments: string;
}

const LIST_STYLING = css({
  padding: 0,
  marginBottom: '3rem'
});

const PARAGRAPH_STYLING = css({
  marginTop: '1.25rem',
  marginBottom: '2rem'
});

export default class ApplyPage extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.state = {
      sendingFiles: false,
      submittingForm: false
    };
  }

  static async getInitialProps({ query: { commissionID } }): Promise<Props> {
    const commissions = await fetchCommissions();

    return { commissions, commissionID };
  }

  render() {
    const { commissions, commissionID } = this.props;

    const commissionsWithoutOpenSeats = commissions.filter(
      commission => commission.openSeats === 0
    );
    const commissionsWithOpenSeats = commissions.filter(
      commission => commission.openSeats > 0
    );

    return (
      <div className="mn">
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          {/* todo: remove meta tag; for dev purposes only */}
          <meta name="viewport" content="width=device-width, initial-scale=1" />

        </Head>

        <div className="b b-c">
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
              commissionIds: commissionID ? [commissionID] : [],
              typeOfDegree: '',
              degreeAttained: '',
              educationalInstitution: '',
              otherInformation: '',
              comments: '',
            }}
            validationSchema={validationSchema}
            onSubmit={() => {}}
            render={({
               values,
               errors,
               touched,
               handleBlur,
               handleChange,
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

                <SectionHeader title="Boards and Commissions" />

                <p className={PARAGRAPH_STYLING}>
                  Please note that many of these Boards and Commissions require City of Boston residency.
                </p>


                <SectionHeader title="Boards and Commissions with open positions" subheader />

                <FieldArray
                  name="commissionIds"
                  render={({ push, remove }) => (
                    <ul className={LIST_STYLING}>
                      {commissionsWithOpenSeats.map(commission =>
                        renderCommission(
                          commission,
                          values.commissionIds,
                          push,
                          remove,
                          handleBlur
                        )
                      )}
                    </ul>
                  )}
                />

                {commissionsSelectionError(touched, errors)}

                <SectionHeader title="Boards and Commissions without open positions" subheader />

                <p className={PARAGRAPH_STYLING}>
                  You can still apply for a board or commission that does not currently have any open positions, and we will review your application when a seat opens.
                </p>

                <FieldArray
                  name="commissionIds"
                  render={({ push, remove }) => (
                    <ul className={LIST_STYLING}>
                      {commissionsWithoutOpenSeats.map(commission =>
                        renderCommission(
                          commission,
                          values.commissionIds,
                          push,
                          remove,
                          handleBlur
                        )
                      )}
                    </ul>
                  )}
                />

                {commissionsSelectionError(touched, errors)}

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
                />

                <FileInput
                  name="resume"
                  title="Resumé"
                  fileTypes={['application/pdf']}
                  sizeLimit={{ amount: 28, unit: 'MB' }}
                />

                <hr className="hr hr--sq" style={{ marginTop: '3rem' }} />

                <SectionHeader title="Comments" />

                <Textarea
                  name="comments"
                  label="Additional Comments"
                  placeholder="Other Comments You Would Like Us to Know."
                  value={values.comments}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  small
                  hideLabel
                />

                <p className={PARAGRAPH_STYLING}>
                  Please note that many Boards and Commissions require specifically prescribed qualifications for members. You should familiarize yourself with the Enabling Legislation before applying.
                </p>

                <button type="submit" className="btn btn--700">
                  Submit Application
                </button>
              </Form>
            )}
          />
        </div>
      </div>
    );
  }
}

function renderCommission(
  commission: Commission,
  checkedCommissionIds: string[],
  push,
  remove,
  handleBlur
) {
  const checked = checkedCommissionIds.includes(commission.id.toString());

  return (
    <li
      style={{ listStyleType: 'none' }}
      key={`commissionIds.${commission.id}`}
      className="m-b500"
    >
      <Checkbox
        name={`commissionIds.${commission.id}`}
        value={commission.id.toString()}
        title={commission.name}
        onChange={() => {
          if (!checked) {
            push(commission.id.toString());
          } else {
            remove(checkedCommissionIds.indexOf(commission.id.toString()));
          }
        }}
        onBlur={handleBlur}
        checked={checked}
      />
    </li>
  );
}

function commissionsSelectionError(touched, errors) {
  return (
    <p className="t--subinfo t--err" style={{ marginTop: '-0.5em', color: A11Y_RED }}>
      {touched.commissionIds && errors.commissionIds}
    </p>
  );
}
