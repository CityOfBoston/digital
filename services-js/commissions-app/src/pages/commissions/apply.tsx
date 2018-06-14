import React from 'react';
import TextInput from '../../client/common/TextInput';

import { SectionHeader } from '@cityofboston/react-fleet';

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
        <div className="b b-c">
          <SectionHeader title="Commissions Page Scaffold" />
          <form className="m-t700" action="javascript:void(0)" method="POST">
            <fieldset className="fs m-v700">
              <legend className="fs-l">Application Information</legend>
              <div className="fs">
                <div className="fs-c">
                  <TextInput
                    title="First Name"
                    name="firstName"
                    placeholder="First Name"
                    required
                  />
                  <TextInput
                    title="Middle Name"
                    name="middleName"
                    placeholder="Middle Name"
                    required
                  />
                  <TextInput
                    title="Last Name"
                    name="lastName"
                    placeholder="Last Name"
                    required
                  />
                  <TextInput
                    title="Address"
                    name="address"
                    placeholder="Address"
                    required
                  />

                  <TextInput
                    title="Unit"
                    name="unit"
                    placeholder="Unit or Apartment # "
                    required
                  />

                  <TextInput
                    title="City"
                    name="city"
                    placeholder="City"
                    required
                  />

                  <TextInput
                    title="State"
                    name="state"
                    placeholder="State"
                    required
                  />

                  <TextInput
                    title="Zip"
                    name="zip"
                    placeholder="Zip Code"
                    required
                  />

                  <TextInput
                    title="Phone"
                    name="phone"
                    placeholder="Phone Number"
                    required
                  />

                  <TextInput
                    title="Email"
                    name="email"
                    placeholder="Email "
                    required
                  />

                  <TextInput
                    title="Confirm Email"
                    name="Confirm Email"
                    placeholder="Confirm Email"
                    required
                  />
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
