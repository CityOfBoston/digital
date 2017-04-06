// @flow

import React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';

import SectionHeader from '../../common/SectionHeader';
import type { AppStore } from '../../../data/store';

const FIELD_STYLE = {
  width: '100%',
};

export type Props = {
  store: AppStore,
  nextFunc: () => void,
}

export default observer(function ContactPane({ store, nextFunc }: Props) {
  const { currentService, requestForm: { contactInfo } } = store;
  const { firstName, lastName, email, phone, required, requirementsMet } = contactInfo;
  const allowSubmit = !required || requirementsMet;

  const onChange = action((ev) => {
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
      default:
        break;
    }
  });

  const title = currentService ? currentService.name : 'Contact Info';

  return (
    <div>
      <div>
        <SectionHeader>{ title }</SectionHeader>
        <p className="m-v300 t--info">Contact info will not be shared with public. Leave blank to submit anonymously.</p>

        <label className="txt">
          <span className="txt-l">First Name {required && '(required)'}</span>
          <input type="text" className="txt-f" placeholder="First Name" name="firstName" value={firstName} onChange={onChange} style={FIELD_STYLE} />
        </label>

        <label className="txt">
          <span className="txt-l">Last Name {required && '(required)'}</span>
          <input type="text" className="txt-f" placeholder="Last Name" name="lastName" value={lastName} onChange={onChange} style={FIELD_STYLE} />
        </label>

        <label className="txt">
          <span className="txt-l">Email</span>
          <input className="txt-f" type="email" placeholder="Email" name="email" value={email} onChange={onChange} style={FIELD_STYLE} />
        </label>

        <label className="txt">
          <span className="txt-l">Phone</span>
          <input className="txt-f" type="tel" placeholder="Phone" name="phone" value={phone} onChange={onChange} style={FIELD_STYLE} />
        </label>
      </div>

      <div className="g">
        <div className="g--9" />
        <button className="btn g--3 m-v300" onClick={nextFunc} disabled={!allowSubmit}>Submit</button>
      </div>
    </div>
  );
});
