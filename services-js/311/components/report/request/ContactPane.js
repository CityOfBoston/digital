// @flow

import React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';

import type { AppStore } from '../../../data/store';

const FIELD_STYLE = {
  width: '100%',
};

export type Props = {
  store: AppStore,
  nextFunc: () => void,
}

export default observer(function ContactPane({ store, nextFunc }: Props) {
  const { firstName, lastName, email, phone, required, requirementsMet } = store.contactInfo;
  const allowSubmit = !required || requirementsMet;

  const onChange = action((ev) => {
    const value = ev.target.value;
    switch (ev.target.name) {
      case 'firstName':
        store.contactInfo.firstName = value;
        break;
      case 'lastName':
        store.contactInfo.lastName = value;
        break;
      case 'email':
        store.contactInfo.email = value;
        break;
      case 'phone':
        store.contactInfo.phone = value;
        break;
      default:
        break;
    }
  });

  return (
    <div>
      <div>
        <h2 className="step">Contact Form</h2>
        <div className="t--info">(will not be shared with public; leave blank to submit anonymously)</div>

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
        <button className="btn g--33 m-v300" onClick={nextFunc} disabled={!allowSubmit}>Submit</button>
      </div>
    </div>
  );
});
