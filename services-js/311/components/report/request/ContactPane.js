// @flow

import React from 'react';
import { css } from 'glamor';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import InputMask from 'react-input-mask';

import LocalStorageContactInfo from '../../../data/external/LocalStorageContactInfo';

import SectionHeader from '../../common/SectionHeader';
import { MEDIA_LARGE } from '../../style-constants';
import type RequestForm from '../../../data/store/RequestForm';

const FIELD_STYLE = {
  width: '100%',
};

const BOTTOM_ROW_STYLE = css({
  alignItems: 'center',
});

const RIGHT_ON_LARGE_STYLE = css({
  [MEDIA_LARGE]: {
    textAlign: 'right',
  },
});

export type Props = {|
  requestForm: RequestForm,
  serviceName: string,
  nextFunc: () => mixed,
|}

function renderRequired() {
  return <span className="t--req">Required</span>;
}

@observer
export default class ContactPane extends React.Component {
  props: Props;

  localStorageContactInfo: LocalStorageContactInfo;

  componentWillMount() {
    const { requestForm } = this.props;
    this.localStorageContactInfo = new LocalStorageContactInfo(requestForm);
  }

  componentWillUnmount() {
    this.localStorageContactInfo.dispose();
  }

  @action.bound
  continueWithContactInfo(ev: SyntheticInputEvent) {
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
  handleChange(ev: SyntheticInputEvent) {
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
        this.localStorageContactInfo.rememberInfo = ev.target.checked;
        break;
      default:
        break;
    }
  }

  cancelSubmit = (ev: SyntheticInputEvent) => {
    ev.preventDefault();
  };

  render() {
    const { serviceName, requestForm } = this.props;
    const { firstName, lastName, email, phone, contactInfoRequired, contactInfoRequirementsMet } = requestForm;
    const { rememberInfo } = this.localStorageContactInfo;

    return (
      <form onSubmit={this.continueWithContactInfo}>
        <div>
          <SectionHeader>{ serviceName }</SectionHeader>
          <p className="m-v300 t--info">
            We’ll use your contact info to send you email about the status of your
            report and to follow up with you if necessary.
          </p>

          <p className="m-v300 t--subinfo">
            <strong>Your contact info will not be made public.</strong>{' '}

            { !contactInfoRequired && (
            <span>
              You can also <a href="javascript:void(0)" onClick={this.continueWithoutContactInfo}>submit
              without providing contact info</a>.
            </span>
          )}
          </p>

          <div className="txt">
            <label className="txt-l" htmlFor="ContactPane-firstName">First Name {renderRequired()}</label>
            <input type="text" className="txt-f" id="ContactPane-firstName" placeholder="First Name" name="firstName" value={firstName} onChange={this.handleChange} style={FIELD_STYLE} aria-required />
          </div>

          <div className="txt">
            <label className="txt-l" htmlFor="ContactPane-lastName">Last Name {renderRequired()}</label>
            <input type="text" className="txt-f" id="ContactPane-lastName" placeholder="Last Name" name="lastName" value={lastName} onChange={this.handleChange} style={FIELD_STYLE} aria-required />
          </div>

          <div className="txt">
            <label className="txt-l" htmlFor="ContactPane-email">Email {renderRequired()}</label>
            <input className="txt-f" type="email" id="ContactPane-email" placeholder="Email" name="email" value={email} onChange={this.handleChange} style={FIELD_STYLE} aria-required />
          </div>

          <div className="txt">
            <label className="txt-l" htmlFor="ContactPane-phone">Phone</label>
            <InputMask className="txt-f" mask="(999) 999-9999" id="ContactPane-phone" type="tel" placeholder="Phone" name="phone" value={phone} onChange={this.handleChange} style={FIELD_STYLE} />
          </div>

          <div className="m-v500 g">
            <div className="cb">
              <input name="remember" id="ContactPane-remember" type="checkbox" value="true" className="cb-f" checked={rememberInfo} onChange={this.handleChange} />
              <label className="cb-l" htmlFor="ContactPane-remember">Remember contact info on this computer</label>
            </div>
          </div>
        </div>

        <div className={`g m-v500 ${BOTTOM_ROW_STYLE.toString()}`}>
          <div className={`g--8 t--info m-v200 ${RIGHT_ON_LARGE_STYLE.toString()}`}>
            {!contactInfoRequirementsMet && <span>Please fill out <span className="t--req">required</span> fields to continue</span>}
          </div>

          <button className="btn g--4" type="submit" disabled={!contactInfoRequirementsMet}>Submit Report</button>
        </div>
      </form>
    );
  }
}
