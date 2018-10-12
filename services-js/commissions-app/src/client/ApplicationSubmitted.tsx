import React from 'react';
import { SectionHeader } from '@cityofboston/react-fleet';

interface Props {
  error?: any;
}

function successMessage(): JSX.Element {
  return (
    <p>
      Thank you for applying to serve on a Board or Commission. We appreciate
      your willingness to make a difference in the City of Boston. If you have
      any questions about your application, contact{' '}
      <a href="mailto:boardsandcommissions@boston.gov">
        boardsandcommissions@boston.gov
      </a>.
    </p>
  );
}

function errorMessage(error: any): JSX.Element {
  return (
    <>
      <p>There was a problem submitting your application.</p>

      <p>{error}</p>
    </>
  );
}

export default function ApplicationSubmitted(props: Props): JSX.Element {
  const headerText = props.error
    ? 'There was a problem with your application'
    : 'Your application has been received';

  return (
    <section role="alert">
      <SectionHeader title={headerText} />

      {props.error ? errorMessage(props.error) : successMessage()}
    </section>
  );
}
