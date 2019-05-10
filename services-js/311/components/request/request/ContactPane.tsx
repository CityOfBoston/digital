import React, { SyntheticEvent, ChangeEvent } from 'react';
import { css } from 'emotion';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import InputMask from 'react-input-mask';

import { MEDIA_LARGE } from '@cityofboston/react-fleet';

import LocalStorageContactInfo from '../../../data/external/LocalStorageContactInfo';

import SectionHeader from '../../common/SectionHeader';
import RequestForm from '../../../data/store/RequestForm';

const BOTTOM_ROW_STYLE = css({
  alignItems: 'center',
});

const RIGHT_ON_LARGE_STYLE = css({
  [MEDIA_LARGE]: {
    textAlign: 'right',
  },
});

export type Props = {
  requestForm: RequestForm;
  serviceName: string;
  nextFunc: () => unknown;
  noLocalStorage?: boolean;
};

function renderRequired() {
  return <span className="t--req">Required</span>;
}

@observer
export default class ContactPane extends React.Component<Props> {
  localStorageContactInfo: LocalStorageContactInfo | null = null;

  componentWillMount() {
    const { requestForm, noLocalStorage } = this.props;
    if (!noLocalStorage) {
      this.localStorageContactInfo = new LocalStorageContactInfo(requestForm);
    }
  }

  componentWillUnmount() {
    if (this.localStorageContactInfo) {
      this.localStorageContactInfo.dispose();
    }
  }

  @action.bound
  continueWithContactInfo(ev: SyntheticEvent) {
    const { requestForm, nextFunc } = this.props;

    ev.preventDefault();

    requestForm.sendContactInfo = true;
    nextFunc();
  }

  @action.bound
  continueWithoutContactInfo() {
    const { requestForm, nextFunc } = this.props;
    requestForm.sendContactInfo = false;
    nextFunc();
  }

  @action.bound
  handleChange(ev: ChangeEvent<HTMLInputElement>) {
    const { requestForm } = this.props;

    const value = ev.target.value;
    switch (ev.target.name) {
      case 'firstName':
        requestForm.firstName = value;
        break;
      case 'lastName':
        requestForm.lastName = value;
        break;
      case 'email':
        requestForm.email = value;
        break;
      case 'phone':
        requestForm.phone = value;
        break;
      case 'remember':
        if (this.localStorageContactInfo) {
          this.localStorageContactInfo.rememberInfo = ev.target.checked;
        }
        break;
      default:
        break;
    }
  }

  cancelSubmit = (ev: SyntheticEvent) => {
    ev.preventDefault();
  };

  render() {
    const { serviceName, requestForm } = this.props;
    const {
      firstName,
      lastName,
      email,
      phone,
      contactInfoRequired,
      contactInfoRequirementsMet,
    } = requestForm;
    const { rememberInfo } = this.localStorageContactInfo || {
      rememberInfo: false,
    };

    return (
      <form onSubmit={this.continueWithContactInfo}>
        <div>
          <SectionHeader>{serviceName}</SectionHeader>
          <p className="m-v300 t--info">
            Why are we asking for your contact information? We’ll use it to
            email you about the status of your report. We may also have to
            follow up with you.
          </p>

          <p className="m-v300 t--subinfo">
            <strong>We won’t make your information public.</strong>{' '}
            {!contactInfoRequired && (
              <span>
                You can also{' '}
                <button
                  type="button"
                  className="lnk"
                  onClick={this.continueWithoutContactInfo}
                >
                  send a report without giving us your information
                </button>
                .
              </span>
            )}
          </p>

          <div className="txt">
            <label className="txt-l" htmlFor="ContactPane-firstName">
              First Name {renderRequired()}
            </label>
            <input
              type="text"
              className="txt-f"
              id="ContactPane-firstName"
              placeholder="First Name"
              name="firstName"
              value={firstName}
              onChange={this.handleChange}
              aria-required
            />
          </div>

          <div className="txt">
            <label className="txt-l" htmlFor="ContactPane-lastName">
              Last Name {renderRequired()}
            </label>
            <input
              type="text"
              className="txt-f"
              id="ContactPane-lastName"
              placeholder="Last Name"
              name="lastName"
              value={lastName}
              onChange={this.handleChange}
              aria-required
            />
          </div>

          <div className="txt">
            <label className="txt-l" htmlFor="ContactPane-email">
              Email {renderRequired()}
            </label>
            <input
              className="txt-f"
              type="email"
              id="ContactPane-email"
              placeholder="Email"
              name="email"
              value={email}
              onChange={this.handleChange}
              aria-required
            />
          </div>

          <div className="txt">
            <label className="txt-l" htmlFor="ContactPane-phone">
              Phone
            </label>
            <InputMask
              className="txt-f"
              mask="+1 (999) 999-9999"
              id="ContactPane-phone"
              type="tel"
              placeholder="Phone"
              name="phone"
              value={phone}
              onChange={this.handleChange}
            />
          </div>

          <div className="m-v500 g">
            <div className="cb">
              <input
                name="remember"
                id="ContactPane-remember"
                type="checkbox"
                value="true"
                className="cb-f"
                checked={rememberInfo}
                onChange={this.handleChange}
              />
              <label className="cb-l" htmlFor="ContactPane-remember">
                Remember contact info on this computer
              </label>
            </div>
          </div>
        </div>

        <div className={`g m-v500 ${BOTTOM_ROW_STYLE.toString()}`}>
          <div
            className={`g--8 t--info m-v200 ${RIGHT_ON_LARGE_STYLE.toString()}`}
          >
            {!contactInfoRequirementsMet && (
              <span>
                Please fill out <span className="t--req">required</span> fields
                to continue
              </span>
            )}
          </div>

          <button
            className="btn g--4"
            type="submit"
            disabled={!contactInfoRequirementsMet}
          >
            Submit Request
          </button>
        </div>
      </form>
    );
  }
}
