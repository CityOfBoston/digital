import React from 'react';

interface Props {
  defaultSubject: string;
  token: string | undefined;
  action: string | undefined;
}

// This matches the processing that happens in fetch-templates.ts
const CONTACT_FORM_ID = 'contactForm';

/**
 * Adds the <cob-contact-form> web component to the page.
 *
 * Follow the instructions in the cob-contact README for generating the token
 * prop.
 */
export default function ContactForm({
  defaultSubject,
  token,
  action,
}: Props): JSX.Element {
  return (
    <cob-contact-form
      id={CONTACT_FORM_ID}
      default-subject={defaultSubject}
      token={token || ''}
      action={action}
    />
  );
}
