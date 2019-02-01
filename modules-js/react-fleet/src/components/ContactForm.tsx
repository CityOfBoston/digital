import React from 'react';

interface Props {
  defaultSubject: string;
  to?: string;
  id?: string;
  token: string | undefined;
  action: string | undefined;
}

// This matches the processing that happens in fetch-templates.ts for hooking
// the feedback component up to the "Feedback" link in the default header.
const DEFAULT_CONTACT_FORM_ID = 'contactForm';

/**
 * Adds the <cob-contact-form> web component to the page.
 *
 * Follow the instructions in the cob-contact README for generating the token
 * prop.
 */
export default class ContactForm extends React.Component<Props> {
  public static makeMailtoClickHandler(contactFormId: string) {
    return (ev: React.MouseEvent) => {
      const contactFormEl: unknown = document.getElementById(contactFormId);

      if (contactFormEl) {
        (contactFormEl as StencilComponents.CobContactForm).show();
        ev.preventDefault();
      }
    };
  }

  render() {
    const { id, defaultSubject, to, token, action } = this.props;

    return (
      <cob-contact-form
        id={id || DEFAULT_CONTACT_FORM_ID}
        default-subject={defaultSubject}
        to={to}
        token={token || ''}
        action={action}
      />
    );
  }
}
