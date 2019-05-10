import React from 'react';
import { SectionHeader } from '@cityofboston/react-fleet';

export default function ApplicationSubmitted(): JSX.Element {
  return (
    <section role="alert">
      <SectionHeader title="Your application has been received" />

      <div className="t--intro">
        Thank you for applying to serve on a board or commission!
      </div>

      <p className="t--s400 lh--400">
        We appreciate your willingness to make a difference in the City of
        Boston. If you have any questions about your application, contact{' '}
        <a href="mailto:boardsandcommissions@boston.gov">
          boardsandcommissions@boston.gov
        </a>
        .
      </p>
    </section>
  );
}
