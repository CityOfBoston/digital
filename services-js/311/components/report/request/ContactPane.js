// @flow

import React from 'react';
import { css } from 'glamor';
import { action } from 'mobx';
import { observer } from 'mobx-react';

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
  continueWithContactInfo() {
    const { requestForm, nextFunc } = this.props;
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

  render() {
    const { serviceName, requestForm } = this.props;
    const { firstName, lastName, email, phone, contactInfoRequired, contactInfoRequirementsMet } = requestForm;
    const { rememberInfo } = this.localStorageContactInfo;

    return (
      <div>
        <div>
          <SectionHeader>{ serviceName }</SectionHeader>
          <p className="m-v300 t--info">
          We’ll use your contact info to send you email about the status of your
          report and to follow up with you if necessary.
        </p>

          <p className="m-v300 t--subinfo">
          Your contact info will not be made public.{' '}

            { !contactInfoRequired && (
            <span>
              You can also <a href="javascript:void(0)" onClick={this.continueWithoutContactInfo}>submit
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
          <div className={`g--8 t--info m-v200 ${RIGHT_ON_LARGE_STYLE.toString()}`}>
            {!contactInfoRequirementsMet && <span>Please fill out <span className="t--req">required</span> fields to continue</span>}
          </div>
          <button className="btn g--4" onClick={this.continueWithContactInfo} disabled={!contactInfoRequirementsMet}>Submit Report</button>
        </div>
      </div>
    );
  }
}
