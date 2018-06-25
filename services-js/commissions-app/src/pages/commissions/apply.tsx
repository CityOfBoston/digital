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

export interface State {
  emailMatch: boolean;
}

export default class IndexPage extends React.Component<Props, State> {
  static async getInitialProps(): Promise<Props> {
    const commissions = await fetchCommissions();
    return { commissions };
  }

  state: State = {
    emailMatch: true,
  };

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
                .min(5, 'Zip Codes Contains 5 Digits'),
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
                  onBlur={handleBlur}
                />

                <TextInput
                  title="Middle Name"
                  name="middleName"
                  placeholder="Middle Name"
                  value={values.middleName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <TextInput
                  title="Last Name"
                  name="lastName"
                  placeholder="Last Name"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <TextInput
                  title="Address"
                  name="address"
                  placeholder="Address"
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <TextInput
                  title="Unit"
                  name="unit"
                  placeholder="Unit or Apartment #"
                  value={values.unit}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <TextInput
                  title="City"
                  name="city"
                  placeholder="City"
                  value={values.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <TextInput
                  title="State"
                  name="state"
                  placeholder="State"
                  value={values.state}
                  onChange={handleChange}
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
                  onBlur={handleBlur}
                />
                <TextInput
                  title="Email"
                  name="email"
                  placeholder="Email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <TextInput
                  title="Confirm Email"
                  name="confirmEmail"
                  placeholder="Confirm Email"
                  value={values.confirmEmail}
                  onChange={handleChange}
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
  renderEmailError() {
    if (!this.state.emailMatch) {
      return (
        <div>
          <label className="error">
            Please Make Sure Emails Match, Thank You.
          </label>
        </div>
      );
    }
    return null;
  }
  renderCommission(commission: Commission) {
    return <li key={commission.id}>{commission.name}</li>;
  }
}
