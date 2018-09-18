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


const NAME_PREFIX_STYLE = css({
  display: 'flex',
  justifyContent: 'space-between'
});

const NAME_STYLE = css({
  flexGrow: 1
});


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

    const commissionsWithoutOpenSeats = commissions
      .filter(commission => commission.openSeats === 0)
      .sort((current, next) => current.name.localeCompare(next.name));

    const commissionsWithOpenSeats = commissions
      .filter(commission => commission.openSeats > 0)
      .sort((current, next) => current.name.localeCompare(next.name));

    return (
      <div className="mn">
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          {/* todo: remove meta tag; for dev purposes only */}
          <meta name="viewport" content="width=device-width, initial-scale=1" />

        </Head>

        <div className="b b-c">
          <SectionHeader title="Applicant Information" />

          <Formik
            initialValues={{
              firstName: '',
              middleName: '',
              lastName: '',
              streetAddress: '',
              unit: '',
              state: '',
              city: '',
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
                <div className="g">

                  <div className={`g--6 m-b300 ${NAME_PREFIX_STYLE}`}>
                    <div style={{ marginRight: '1.5em' }}>
                      <label
                        htmlFor="FeedbackForm-prefix"
                        className="txt-l txt-l--sm"
                      >
                        Prefix
                      </label>

                      <div className="sel-c sel-c--thin">
                        <select id="FeedbackForm-prefix" className="sel-f sel-f--thin">
                          <option>Mr</option>
                          <option>Mrs</option>
                          <option>Miss</option>
                          <option>Mx</option>
                        </select>
                      </div>
                    </div>

                    <Field
                      component={TextInputContainer}
                      label="First Name"
                      name="firstName"

                      placeholder="First Name"
                      required
                      className={NAME_STYLE}
                    />
                  </div>

                  <div className="g--1 m-b300">
                    <Field
                      component={TextInputContainer}
                      label="Initial"
                      name="middleName"
                    />
                  </div>

                  <div className="g--5 m-b300">
                    <Field
                      component={TextInputContainer}
                      label="Last Name"
                      name="lastName"

                      placeholder="Last Name"
                      required
                    />
                  </div>
                </div>

                <div className="g">
                  <div className="g--9 m-b300">
                    <Field
                      component={TextInputContainer}
                      label="Street Address"
                      name="streetAddress"

                      placeholder="Street Address"
                      required
                    />
                  </div>

                  <div className="g--3 m-b300">
                    <Field
                      component={TextInputContainer}
                      label="Unit"
                      name="unit"
                      placeholder="Unit or Apartment #"
                    />
                  </div>
                </div>

                <div className="g">
                  <div className="g--7 m-b300">
                    <Field
                      component={TextInputContainer}
                      label="City"
                      name="city"

                      placeholder="City"
                      required
                    />
                  </div>

                  <div className="g--2 m-b300">
                    <Field
                      component={TextInputContainer}
                      label="State"
                      name="state"

                      placeholder="State"
                      required
                    />
                  </div>

                  <div className="g--3 m-b300">
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

                <p className="m-b500">
                  Please note that many of these Boards and Commissions require City of Boston residency.
                </p>


                <SectionHeader title="Boards and Commissions with open positions" subheader />

                <FieldArray
                  name="commissionIds"
                  render={({ push, remove }) => (
                    <ul style={{ margin: 0, padding: 0 }}>
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

                <hr className="hr hr--sq" />

                <SectionHeader title="Boards and Commissions without open positions" subheader />

                <p>
                  You can still apply for a board or commission that does not currently have any open positions, and we will review your application when a seat opens.
                </p>

                <FieldArray
                  name="commissionIds"
                  render={({ push, remove }) => (
                    <ul style={{ margin: 0, padding: 0 }}>
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

                <p>
                  Files must be in PDF format, and under 28MB in size.
                </p>

                <FileInput
                  name="coverLetter"
                  title="Cover Letter"
                  fileTypes={['application/pdf']}
                  sizeLimit={{ quantity: 28, unit: 'MB' }}
                />

                <FileInput
                  name="resume"
                  title="Resumé"
                  fileTypes={['application/pdf']}
                  sizeLimit={{ quantity: 28, unit: 'MB' }}
                />

                <hr className="hr hr--sq" />

                <SectionHeader title="Comments" />

                <Textarea
                  name="comments"
                  label="Additional Comments"
                  placeholder="Other Comments You Would Like Us to Know."
                  value={values.comments}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  variant="small"
                  hideLabel
                />

                <p>
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
