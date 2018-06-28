import React from 'react';
import TextInput from '../../client/common/TextInput';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Head from 'next/head';
import { SectionHeader, PUBLIC_CSS_URL } from '@cityofboston/react-fleet';

import fetchCommissions, {
  Commission,
} from '../../client/graphql/fetch-commissions';

export interface Props {
  commissions: Commission[];
}

export default class IndexPage extends React.Component<Props> {
  static async getInitialProps(): Promise<Props> {
    const commissions = await fetchCommissions();
    return { commissions };
  }

  render() {
    const { commissions } = this.props;
    return (
      <div className="mn">
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
        </Head>

        <div className="b b-c">
          <SectionHeader title="Commissions Page Scaffold" />

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
                .oneOf([Yup.ref('email', null)], 'Make Sure Emails Match!'),
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
                <TextInput
                  title="First Name"
                  name="firstName"
                  placeholder="First Name"
                  value={values.firstName}
                  onChange={handleChange}
                  error={touched.firstName && errors.firstName}
                  onBlur={handleBlur}
                />

                <TextInput
                  title="Middle Name"
                  name="middleName"
                  placeholder="Middle Name"
                  value={values.middleName}
                  onChange={handleChange}
                  error={touched.middleName && errors.middleName}
                  onBlur={handleBlur}
                />
                <TextInput
                  title="Last Name"
                  name="lastName"
                  placeholder="Last Name"
                  value={values.lastName}
                  onChange={handleChange}
                  error={touched.lastName && errors.lastName}
                  onBlur={handleBlur}
                />
                <TextInput
                  title="Address"
                  name="address"
                  placeholder="Address"
                  value={values.address}
                  onChange={handleChange}
                  error={touched.address && errors.address}
                  onBlur={handleBlur}
                />
                <TextInput
                  title="Unit"
                  name="unit"
                  placeholder="Unit or Apartment #"
                  value={values.unit}
                  onChange={handleChange}
                  error={touched.unit && errors.unit}
                  onBlur={handleBlur}
                />
                <TextInput
                  title="City"
                  name="city"
                  placeholder="City"
                  value={values.city}
                  onChange={handleChange}
                  error={touched.city && errors.city}
                  onBlur={handleBlur}
                />
                <TextInput
                  title="State"
                  name="state"
                  placeholder="State"
                  value={values.state}
                  onChange={handleChange}
                  error={touched.state && errors.state}
                  onBlur={handleBlur}
                />
                <TextInput
                  title="Zip"
                  name="zip"
                  placeholder="Zip Code"
                  value={values.zip}
                  onChange={handleChange}
                  error={touched.zip && errors.zip}
                  onBlur={handleBlur}
                />
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
                <button type="submit" className="btn btn--700">
                  Send Message
                </button>
              </form>
            )}
          />

          <ul>
            {commissions.map(commission => this.renderCommission(commission))}
          </ul>
        </div>
      </div>
    );
  }

  renderCommission(commission: Commission) {
    return <li key={commission.id}>{commission.name}</li>;
  }
}
