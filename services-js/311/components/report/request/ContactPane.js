// @flow

import React from 'react';
import { css } from 'glamor';
import { action } from 'mobx';
import { observer } from 'mobx-react';

import SectionHeader from '../../common/SectionHeader';
import type { AppStore } from '../../../data/store';

const FIELD_STYLE = {
  width: '100%',
};

const BOTTOM_ROW_STYLE = css({
  alignItems: 'center',
});

export type Props = {|
  store: AppStore,
  nextFunc: (contactInfo: ?boolean) => void,
|}

function renderRequired() {
  return <span className="t--req">Required</span>;
}

@observer
export default class ContactPane extends React.Component {
  @action.bound
  handleChange(ev: SyntheticInputEvent) {
    const { store } = this.props;
    const { requestForm: { contactInfo } } = store;

    const value = ev.target.value;
    switch (ev.target.name) {
      case 'firstName':
        contactInfo.firstName = value;
        break;
      case 'lastName':
        contactInfo.lastName = value;
        break;
      case 'email':
        contactInfo.email = value;
        break;
      case 'phone':
        contactInfo.phone = value;
        break;
      case 'remember':
        contactInfo.rememberInfo = ev.target.checked;
        break;
      default:
        break;
    }
  }

  submitWithContactInfo() {
    const { nextFunc } = this.props;
    nextFunc(true);
  }

  render() {
    const { store, nextFunc } = this.props;
    const { currentService, requestForm: { contactInfo } } = store;
    const { firstName, lastName, email, phone, required, requirementsMet, rememberInfo } = contactInfo;

    const title = currentService ? currentService.name : 'Contact Info';

    return (
      <div>
        <div>
          <SectionHeader>{ title }</SectionHeader>
          <p className="m-v300 t--info">
          We’ll use your contact info to send you email about the status of your
          report and to follow up with you if necessary.
        </p>

          <p className="m-v300" style={{ fontStyle: 'italic' }}>
          Your contact info will not be made public.{' '}

            { !required && (
            <span>
              You can also <a href="javascript:void(0)" onClick={nextFunc}>submit
              without providing contact info</a>.
            </span>
          )}
          </p>

          <label className="txt">
            <span className="txt-l">First Name {renderRequired()}</span>
            <input type="text" className="txt-f" placeholder="First Name" name="firstName" value={firstName} onChange={this.handleChange} style={FIELD_STYLE} />
          </label>

          <label className="txt">
            <span className="txt-l">Last Name {renderRequired()}</span>
            <input type="text" className="txt-f" placeholder="Last Name" name="lastName" value={lastName} onChange={this.handleChange} style={FIELD_STYLE} />
          </label>

          <label className="txt">
            <span className="txt-l">Email {renderRequired()}</span>
            <input className="txt-f" type="email" placeholder="Email" name="email" value={email} onChange={this.handleChange} style={FIELD_STYLE} />
          </label>

          <label className="txt">
            <span className="txt-l">Phone</span>
            <input className="txt-f" type="tel" placeholder="Phone" name="phone" value={phone} onChange={this.handleChange} style={FIELD_STYLE} />
          </label>

          <div className="m-v500">
            <label className="cb">
              <input name="remember" type="checkbox" value="true" className="cb-f" checked={rememberInfo} onChange={this.handleChange} />
              <span className="cb-l">Remember contact info on this computer</span>
            </label>
          </div>
        </div>

        <div className={`g m-v500 ${BOTTOM_ROW_STYLE.toString()}`}>
          <div className="g--8 t--info" style={{ textAlign: 'right' }}>
            {!requirementsMet && <span>Please fill out <span className="t--req">required</span> fields to continue</span>}
          </div>
          <button className="btn g--4" onClick={this.submitWithContactInfo} disabled={!requirementsMet}>Submit Report</button>
        </div>
      </div>
    );
  }
}
