import React from 'react';
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
  //
  handleBlur = () => {
    if (this.email === null || this.confirmEmail === null) {
      return;
    }
    this.setState({
      emailMatch: this.email.value === this.confirmEmail.value,
    });
    this.handleBlur = this.handleBlur.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  };

  fullName: HTMLInputElement | null = null;
  middleName: HTMLInputElement | null = null;
  lastName: HTMLInputElement | null = null;
  address: HTMLInputElement | null = null;
  unit: HTMLInputElement | null = null;
  where: HTMLInputElement | null = null;
  city: HTMLInputElement | null = null;
  zip: HTMLInputElement | null = null;
  tel: HTMLInputElement | null = null;
  phone: HTMLInputElement | null = null;
  email: HTMLInputElement | null = null;
  confirmEmail: HTMLInputElement | null = null;

  handleSubmit() {}

  render() {
    const { commissions } = this.props;
    return (
      <div className="mn">
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
        </Head>
        <div className="b b-c">
          <SectionHeader title="Commissions Page Scaffold 2018" />
          <form className="m-t700" action="javascript:void(0)" method="POST">
            <fieldset className="fs m-v700">
              <legend className="fs-l">Application Information</legend>
              <div className="fs">
                <div className="fs-c">
                  <div className="txt m-b300">
                    <label
                      htmlFor="FeedbackForm-firstName"
                      className="txt-l txt-l--sm"
                    >
                      First Name
                      <span className="t--req" aria-hidden="true">
                        {' '}
                        Required
                      </span>
                    </label>
                    <input
                      ref={fullName => (this.fullName = fullName)}
                      id="FeedbackForm-name"
                      name="fullName"
                      type="text"
                      className="txt-f txt-f--sm"
                      size={10}
                      placeholder="Your Full Name"
                    />
                  </div>
                  <div className="txt m-b300">
                    <label
                      htmlFor="FeedbackForm-middleName"
                      className="txt-l txt-l--sm"
                    >
                      Middle Name
                      <span className="t--req" aria-hidden="true">
                        {' '}
                        Required
                      </span>
                    </label>
                    <input
                      ref={middleName => (this.middleName = middleName)}
                      id="FeedbackForm-middleName"
                      name="middleName"
                      type="text"
                      className="txt-f txt-f--sm"
                      size={10}
                      placeholder="Your Middle Name"
                    />
                  </div>
                  <div className="txt m-b300">
                    <label
                      htmlFor="FeedbackForm-lastName"
                      className="txt-l txt-l--sm"
                    >
                      Last Name
                      <span className="t--req" aria-hidden="true">
                        {' '}
                        Required
                      </span>
                    </label>
                    <input
                      ref={lastName => (this.lastName = lastName)}
                      id="FeedbackForm-lastName"
                      name="lastName"
                      type="text"
                      className="txt-f txt-f--sm"
                      size={10}
                      placeholder="Your Last Name"
                    />
                  </div>
                  <div className="txt m-b300">
                    <label
                      htmlFor="FeedbackForm-Address"
                      className="txt-l txt-l--sm"
                    >
                      Address
                      <span className="t--req" aria-hidden="true">
                        {' '}
                        Required
                      </span>
                    </label>
                    <input
                      ref={address => (this.address = address)}
                      id="FeedbackForm-Address"
                      name="address"
                      type="text"
                      className="txt-f txt-f--sm"
                      size={10}
                      placeholder="Your Address"
                    />
                  </div>
                  <div className="txt m-b300">
                    <label
                      htmlFor="FeedbackForm-unit"
                      className="txt-l txt-l--sm"
                    >
                      Unit or Suite
                      <span className="t--req" aria-hidden="true">
                        {' '}
                        Required
                      </span>
                    </label>
                    <input
                      ref={unit => (this.unit = unit)}
                      id="FeedbackForm-unit"
                      name="unitOrSuite"
                      type="text"
                      className="txt-f txt-f--sm"
                      size={10}
                      placeholder="Your Unit or Suite #"
                    />
                  </div>
                  <div className="txt m-b300">
                    <label
                      htmlFor="FeedbackForm-city"
                      className="txt-l txt-l--sm"
                    >
                      City
                      <span className="t--req" aria-hidden="true">
                        {' '}
                        Required
                      </span>
                    </label>
                    <input
                      ref={city => (this.city = city)}
                      id="FeedbackForm-city"
                      name="city"
                      type="text"
                      className="txt-f txt-f--sm"
                      size={10}
                      placeholder="Your city"
                    />
                  </div>
                  <div className="txt m-b300">
                    <label
                      htmlFor="FeedbackForm-where"
                      className="txt-l txt-l--sm"
                    >
                      State
                      <span className="t--req" aria-hidden="true">
                        {' '}
                        Required
                      </span>
                    </label>
                    <input
                      ref={where => (this.where = where)}
                      id="FeedbackForm-state"
                      name="State"
                      type="text"
                      className="txt-f txt-f--sm"
                      size={5}
                      placeholder="Your State"
                    />
                  </div>
                  <div className="txt m-b300">
                    <label
                      htmlFor="FeedbackForm-Zip"
                      className="txt-l txt-l--sm"
                    >
                      "Zip"
                      <span className="t--req" aria-hidden="true">
                        {' '}
                        Required
                      </span>
                    </label>
                    <input
                      ref={zip => (this.zip = zip)}
                      id="FeedbackForm-zip"
                      name="zip"
                      type="text"
                      className="txt-f txt-f--sm"
                      size={10}
                      placeholder="Your Zip Code"
                    />
                  </div>
                  <div className="txt m-b300">
                    <label
                      htmlFor="FeedbackForm-tel"
                      className="txt-l txt-l--sm"
                    >
                      Phone
                      <span className="t--req" aria-hidden="true">
                        {' '}
                        Required
                      </span>
                    </label>
                    <input
                      ref={tel => (this.tel = tel)}
                      id="FeedbackForm-tel"
                      name="phone"
                      type="text"
                      className="txt-f txt-f--sm"
                      size={10}
                      placeholder="Your Phone #"
                    />
                  </div>
                  <div className="txt m-b300">
                    <label
                      htmlFor="FeedbackForm-email"
                      className="txt-l txt-l--sm"
                    >
                      Email
                      <span className="t--req" aria-hidden="true">
                        {' '}
                        Required
                      </span>
                    </label>
                    <input
                      ref={email => (this.email = email)}
                      id="FeedbackForm-email"
                      name="email"
                      type="text"
                      className="txt-f txt-f--sm"
                      size={10}
                      placeholder="Your Email"
                      onBlur={this.handleBlur}
                    />
                  </div>
                  <div className="txt m-b300">
                    <label
                      htmlFor="FeedbackForm-confirmEmail"
                      className="txt-l txt-l--sm"
                    >
                      Confirm Email
                      <span className="t--req" aria-hidden="true">
                        {' '}
                        Required
                      </span>
                    </label>
                    <input
                      ref={confirmEmail => (this.confirmEmail = confirmEmail)}
                      id="FeedbackForm-confirmEmail"
                      name="confirmEmail"
                      type="text"
                      className="txt-f txt-f--sm"
                      size={10}
                      placeholder="Confirm Email"
                      onBlur={this.handleBlur}
                    />
                  </div>
                </div>
                <div className="bc bc--r p-t500">
                  <button
                    type="submit"
                    className="btn btn--700"
                    onSubmit={this.handleSubmit}
                  >
                    Send Message
                  </button>
                  {this.renderEmailError()}
                </div>
              </div>
            </fieldset>
          </form>
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
