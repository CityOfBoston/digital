// @flow

import React from 'react';
import { css } from 'glamor';

import type { State as Request } from '../../../data/store/request';

export type ExternalProps = {
  nextFunc: () => void,
}

export type ValueProps = {
  request: Request,
}

export type ActionProps = {
  setRequestFirstName: (string) => void,
  setRequestLastName: (string) => void,
  setRequestEmail: (string) => void,
  setRequestPhone: (string) => void,
}

export type Props = ExternalProps & ValueProps & ActionProps;

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


const wrapOnChange = (setter) => (ev) => { setter(ev.target.value); };

export default function ContactPane({ request, setRequestFirstName, setRequestLastName, setRequestEmail, setRequestPhone, nextFunc }: Props) {
  const allowSubmit = request.lastName && request.firstName && request.email;

  const { firstName, lastName, email, phone } = request;

  return (
    <div>
      <div>
        <h2 className={CONTACT_HEADER_STYLE}>CONTACT FORM</h2>
        <div className={CONTACT_SUBHEADER_STYLE}>(will not be shared with public; leave blank to submit anonymously)</div>

        <label className={CONTACT_LABEL_STYLE}>
          <span>First Name (required)</span>
          <input className={TEXT_INPUT_STYLE} placeholder="First Name" name="firstName" value={firstName} onChange={wrapOnChange(setRequestFirstName)} />
        </label>

        <label className={CONTACT_LABEL_STYLE}>
          <span>Last Name (required)</span>
          <input className={TEXT_INPUT_STYLE} placeholder="Last Name" name="lastName" value={lastName} onChange={wrapOnChange(setRequestLastName)} />
        </label>

        <label className={CONTACT_LABEL_STYLE}>
          <span>Email (required)</span>
          <input className={TEXT_INPUT_STYLE} type="email" placeholder="Email" name="email" value={email} onChange={wrapOnChange(setRequestEmail)} />
        </label>

        <label className={CONTACT_LABEL_STYLE}>
          <span>Phone</span>
          <input className={TEXT_INPUT_STYLE} type="tel" placeholder="Phone" name="phone" value={phone} onChange={wrapOnChange(setRequestPhone)} />
        </label>
      </div>

      <button onClick={nextFunc} disabled={!allowSubmit}>Submit</button>
    </div>
  );
}
