// @flow

import React from 'react';
import { css } from 'glamor';
import { action } from 'mobx';
import { observer } from 'mobx-react';

import type { AppStore } from '../../../data/store';

export type Props = {
  store: AppStore,
  nextFunc: () => void,
}

const CONTACT_HEADER_STYLE = css({
  fontSize: 30,
  textTransform: 'uppercase',
  marginTop: 20,
});

const CONTACT_SUBHEADER_STYLE = css({
  fontFamily: '"Lora", Georgia, serif',
  fontStyle: 'italic',
  fontSize: 22,
  marginBottom: 20,
});

const CONTACT_LABEL_STYLE = css({
  display: 'block',
  marginBottom: 15,
  '& > span': {
    display: 'block',
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 2,
  },
});

const TEXT_INPUT_STYLE = css({
  border: '3px solid black',
  padding: 20,
  display: 'block',
  fontFamily: '"Lora", Georgia, serif',
  fontStyle: 'italic',
  fontSize: 18,
  width: '100%',
});

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
        <h2 className={CONTACT_HEADER_STYLE}>CONTACT FORM</h2>
        <div className={CONTACT_SUBHEADER_STYLE}>(will not be shared with public; leave blank to submit anonymously)</div>

        <label className={CONTACT_LABEL_STYLE}>
          <span>First Name {required && '(required)'}</span>
          <input className={TEXT_INPUT_STYLE} placeholder="First Name" name="firstName" value={firstName} onChange={onChange} />
        </label>

        <label className={CONTACT_LABEL_STYLE}>
          <span>Last Name {required && '(required)'}</span>
          <input className={TEXT_INPUT_STYLE} placeholder="Last Name" name="lastName" value={lastName} onChange={onChange} />
        </label>

        <label className={CONTACT_LABEL_STYLE}>
          <span>Email</span>
          <input className={TEXT_INPUT_STYLE} type="email" placeholder="Email" name="email" value={email} onChange={onChange} />
        </label>

        <label className={CONTACT_LABEL_STYLE}>
          <span>Phone</span>
          <input className={TEXT_INPUT_STYLE} type="tel" placeholder="Phone" name="phone" value={phone} onChange={onChange} />
        </label>
      </div>

      <button onClick={nextFunc} disabled={!allowSubmit}>Submit</button>
    </div>
  );
});
