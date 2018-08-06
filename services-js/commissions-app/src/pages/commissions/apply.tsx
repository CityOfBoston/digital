import React from 'react';
import TextInput from '../../client/common/TextInput';
import CommentInput from '../../client/common/CommentInput';
import { Formik, FieldArray } from 'formik';
import * as Yup from 'yup';
import Head from 'next/head';
import { SectionHeader, PUBLIC_CSS_URL } from '@cityofboston/react-fleet';
import Checkbox from '../../client/common/Checkbox';

import fetchCommissions, {
  Commission,
} from '../../client/graphql/fetch-commissions';

export interface Props {
  commissions: Commission[];
}

export default class ApplyPage extends React.Component<Props> {
  static async getInitialProps(): Promise<Props> {
    const commissions = await fetchCommissions();
    return { commissions };
  }

  renderCommission(
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

  render() {
    const { commissions } = this.props;

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
        </Head>
        <div className="b b-c">
          <SectionHeader title="Applicant Information" />
          <Formik
            initialValues={{
              firstName: '',
              middleName: '',
              lastName: '',
              address: '',
              unit: '',
              state: '',
              city: '',
              zip: '',
              phone: '',
              email: '',
              confirmEmail: '',
              commissionIds: [] as string[],
              typeOfDegree: '',
              degreeAttained: '',
              educationalInstitution: '',
              otherInformation: '',
              comments: '',
            }}
            validationSchema={Yup.object().shape({
              zip: Yup.string()
                .required('Zip Code Is Required')
                .matches(new RegExp(/^\d{5}$/), 'Zip Codes Contains 5 Digits'),
              firstName: Yup.string()
                .required('Your First Name Is Required!')
                .min(2, 'Your First Name Needs To Be Valid'),
              lastName: Yup.string()
                .required('Your Last Name Is Required!')
                .min(2, 'Your Last Name Needs To Be Valid'),
              address: Yup.string()
                .required('Your Address Is Required!')
                .min(2, 'Your Address Needs To Be Valid'),
              unit: Yup.string().min(1),
              city: Yup.string()
                .required('Your City Name Is Required!')
                .min(3),
              state: Yup.string()
                .required('Your State Name Is Required!')
                .min(4),
              phone: Yup.number()
                .required('Your Telephone Number Is Required!')
                .positive()
                .integer(),
              email: Yup.string()
                .email()
                .required('Your Email Is Required!'),
              confirmEmail: Yup.string()
                .email()
                .required('Your Confirm Email Is Required!')
                .oneOf(
                  [Yup.ref('email', undefined)],
                  'Make Sure Emails Match!'
                ),
              commissionIds: Yup.array()
                .max(5, 'Maximium Of Five Selections.')
                .required('One To Five Selections Is Required.'),
              typeOfDegree: Yup.string()
                .required('Type of Degree Is Required!')
                .min(2, 'Type of Degree Needs To Be Valid'),
              degreeAttained: Yup.string()
                .required('Degree Attained Is Required!')
                .min(2, 'Degree Attained Needs To Be Valid'),
              educationalInstitution: Yup.string()
                .required('EducationalInstitution Is Required!')
                .min(2, 'Educational Institution Needs To Be Valid'),
              otherInformation: Yup.string().min(
                2,
                'Other Information Needs To Be Valid'
              ),
              comments: Yup.string().required(),
            })}
            onSubmit={() => {}}
            render={({
              handleSubmit,
              values,
              handleChange,
              errors,
              touched,
              handleBlur,
            }) => (
              <form onSubmit={handleSubmit}>
                <div className="g">
                  <div className="sel">
                    <label
                      htmlFor="FeedbackForm-${this.props.name}"
                      className="txt-l txt-l--sm"
                    >
                      Prefix{' '}
                    </label>
                    <div
                      className="sel-c sel-c--thin"
                      style={{ marginRight: 14 }}
                    >
                      <select className="sel-f sel-f--thin">
                        <option>Mr</option>
                        <option>Mrs</option>
                        <option>Miss</option>
                        <option>Mx</option>
                      </select>
                    </div>
                  </div>
                  <div className="g--3 m-b300">
                    <TextInput
                      title="First Name"
                      name="firstName"
                      placeholder="First Name"
                      value={values.firstName}
                      onChange={handleChange}
                      error={touched.firstName && errors.firstName}
                      onBlur={handleBlur}
                    />
                  </div>
                  <div className="g--1 m-b300">
                    <TextInput
                      title="Initial"
                      name="middleName"
                      placeholder="Middle Initial"
                      value={values.middleName}
                      onChange={handleChange}
                      error={touched.middleName && errors.middleName}
                      onBlur={handleBlur}
                    />
                  </div>
                  <div className="g--6 m-b300">
                    <TextInput
                      title="Last Name"
                      name="lastName"
                      placeholder="Last Name"
                      value={values.lastName}
                      onChange={handleChange}
                      error={touched.lastName && errors.lastName}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>
                <div className="g">
                  <div className="g--9 m-b300">
                    <TextInput
                      title="Street Address"
                      name="StreetAddress"
                      placeholder="Street Address"
                      value={values.address}
                      onChange={handleChange}
                      error={touched.address && errors.address}
                      onBlur={handleBlur}
                    />
                  </div>
                  <div className="g--3 m-b300">
                    <TextInput
                      title="Unit"
                      name="unit"
                      placeholder="Unit or Apartment #"
                      value={values.unit}
                      onChange={handleChange}
                      error={touched.unit && errors.unit}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>
                <div className="g">
                  <div className="g--7 m-b300">
                    <TextInput
                      title="City"
                      name="city"
                      placeholder="City"
                      value={values.city}
                      onChange={handleChange}
                      error={touched.city && errors.city}
                      onBlur={handleBlur}
                    />
                  </div>
                  <div className="g--2 m-b300">
                    <TextInput
                      title="State"
                      name="state"
                      placeholder="State"
                      value={values.state}
                      onChange={handleChange}
                      error={touched.state && errors.state}
                      onBlur={handleBlur}
                    />
                  </div>
                  <div className="g--3 m-b300">
                    <TextInput
                      title="Zip"
                      name="zip"
                      placeholder="Zip Code"
                      value={values.zip}
                      onChange={handleChange}
                      error={touched.zip && errors.zip}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>
                <TextInput
                  title="Phone"
                  name="phone"
                  placeholder="Phone Number"
                  value={values.phone}
                  onChange={handleChange}
                  error={touched.phone && errors.phone}
                  onBlur={handleBlur}
                />
                <TextInput
                  title="Email"
                  name="email"
                  placeholder="Email"
                  value={values.email}
                  onChange={handleChange}
                  error={touched.email && errors.email}
                  onBlur={handleBlur}
                />
                <TextInput
                  title="Confirm Email"
                  name="confirmEmail"
                  placeholder="Confirm Email"
                  value={values.confirmEmail}
                  onChange={handleChange}
                  error={touched.confirmEmail && errors.confirmEmail}
                  onBlur={handleBlur}
                />
                <hr className="hr hr--sq" />
                <SectionHeader title="Education and Experience" />
                <TextInput
                  title="Type of Degree"
                  name="typeOfDegree"
                  placeholder="Type of Degree"
                  value={values.typeOfDegree}
                  onChange={handleChange}
                  error={touched.typeOfDegree && errors.typeOfDegree}
                  onBlur={handleBlur}
                />
                <TextInput
                  title="Degree Attained"
                  name="degreeAttained"
                  placeholder="Degree Attained"
                  value={values.degreeAttained}
                  onChange={handleChange}
                  error={touched.degreeAttained && errors.degreeAttained}
                  onBlur={handleBlur}
                />
                <TextInput
                  title="Educational Institution"
                  name="educationalInstitution"
                  placeholder="Educational Institution"
                  value={values.educationalInstitution}
                  onChange={handleChange}
                  error={
                    touched.educationalInstitution &&
                    errors.educationalInstitution
                  }
                  onBlur={handleBlur}
                />
                <TextInput
                  title="Other Information"
                  name="otherInformation"
                  placeholder="Other Information"
                  value={values.otherInformation}
                  onChange={handleChange}
                  error={touched.otherInformation && errors.otherInformation}
                  onBlur={handleBlur}
                />

                <hr className="hr hr--sq" />
                <SectionHeader title="Boards and Commissions" />
                <h2>
                  Please note that many of these Boards and Commissions require
                  City of Boston residency.
                </h2>

                <SectionHeader title="Boards and Commissions without open positions" />
                <FieldArray
                  name="commissionIds"
                  render={({ push, remove }) => (
                    <ul>
                      {commissionsWithoutOpenSeats.map(commission =>
                        this.renderCommission(
                          commission,
                          values.commissionIds,
                          push,
                          remove,
                          handleBlur
                        )
                      )}
                      <div className="t--subinfo t--err m-t100">
                        {touched.commissionIds && errors.commissionIds}
                      </div>
                    </ul>
                  )}
                />

                <SectionHeader title="Boards and Commissions with open positions" />
                <FieldArray
                  name="commissionIds"
                  render={({ push, remove }) => (
                    <ul>
                      {commissionsWithOpenSeats.map(commission =>
                        this.renderCommission(
                          commission,
                          values.commissionIds,
                          push,
                          remove,
                          handleBlur
                        )
                      )}

                      <h4>
                        You can still apply for a board or commission that does
                        not currently have any open positions, and we will
                        review your application when a seat opens.
                      </h4>
                      <div className="t--subinfo t--err m-t100">
                        {touched.commissionIds && errors.commissionIds}
                      </div>
                    </ul>
                  )}
                />
                <hr className="hr hr--sq" />
                <SectionHeader title="Reference Information" />

                <hr className="hr hr--sq" />
                <SectionHeader title="Comments" />
                <CommentInput
                  title="comments"
                  name="comments"
                  placeholder="Other Comments"
                  value={values.comments}
                  onChange={handleChange}
                  error={touched.comments && errors.comments}
                  onBlur={handleBlur}
                />

                <button type="submit" className="btn btn--700">
                  Send Message
                </button>
              </form>
            )}
          />
        </div>
      </div>
    );
  }
}
