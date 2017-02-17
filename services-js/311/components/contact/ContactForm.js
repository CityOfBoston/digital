// @flow

import React from 'react';
import { css } from 'glamor';

import { GraphQLError } from '../../data/graphql/loopback-graphql';

export type ValueProps = {
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  submitting: boolean,
  submitError: ?(GraphQLError | Error),
};

export type ActionProps = {
  onFirstNameChange: (SyntheticInputEvent) => void,
  onLastNameChange: (SyntheticInputEvent) => void,
  onEmailChange: (SyntheticInputEvent) => void,
  onPhoneChange: (SyntheticInputEvent) => void,
  onSubmit: (SyntheticInputEvent) => void,
};

const STYLE = {
  error: css({
    background: 'red',
    color: 'white',
    borderRadius: 5,
    margin: '10px 0',
    padding: '5',
  }),

  label: css({
    display: 'block',
    marginBottom: 15,
    '& > span': {
      display: 'block',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      fontSize: 11,
    },
  }),

  textInput: css({
    border: '2px solid black',
    padding: 10,
    display: 'block',
    width: '100%',
  }),
};

// TODO(finh): When object spread operator lands for Flow, can turn this into:
// export type Props = {| ...ValueProps, ...ActionProps |} and also make the two types above
// exact w/ {| |}
//
// https://github.com/facebook/flow/issues/2626

export default function ContactForm(props: ValueProps & ActionProps) {
  return (
    <div>
      <h2>CONTACT FORM</h2>
      <p>(will not be shared with public; leave blank to submit anonymously)</p>

      { props.submitError &&
        props.submitError instanceof GraphQLError &&
        props.submitError.errors.map((e, i) => <div key={i} className={STYLE.error}>{e.message}</div>)}

      <label className={STYLE.label}>
        <span>First Name</span>
        <input className={STYLE.textInput} placeholder="First Name" name="firstName" value={props.firstName} onChange={props.onFirstNameChange} />
      </label>

      <label className={STYLE.label}>
        <span>Last Name</span>
        <input className={STYLE.textInput} placeholder="Last Name" name="lastName" value={props.lastName} onChange={props.onLastNameChange} />
      </label>

      <label className={STYLE.label}>
        <span>Email</span>
        <input className={STYLE.textInput} type="email" placeholder="Email" name="email" value={props.email} onChange={props.onEmailChange} />
      </label>

      <label className={STYLE.label}>
        <span>Phone</span>
        <input className={STYLE.textInput} type="tel" placeholder="Phone" name="phone" value={props.phone} onChange={props.onPhoneChange} />
      </label>

      <button type="submit" onClick={props.onSubmit} disabled={props.submitting}>Submit</button>
    </div>
  );
}
