import React from 'react';
import { storiesOf } from '@storybook/react';

import CollapsibleSection from './CollapsibleSection';

const sampleContent = (
  <React.Fragment>
    <p>
      Please note that many of these Boards and Commissions require City of
      Boston residency.
    </p>
    <p>
      You can still apply for a board or commission that does not currently have
      any open positions, and we will review your application when a seat opens.
    </p>
  </React.Fragment>
);

storiesOf('Content Sections|CollapsibleSection', module)
  .add('default (open)', () => (
    <CollapsibleSection title="Boards and Commissions">
      {sampleContent}
    </CollapsibleSection>
  ))
  .add('initially collapsed', () => (
    <CollapsibleSection title="Initially Collapsed" startCollapsed>
      {sampleContent}
    </CollapsibleSection>
  ))
  .add('subheader variant', () => (
    <CollapsibleSection title="Boards and Commissions" subheader>
      {sampleContent}
    </CollapsibleSection>
  ))
  .add('disabled', () => (
    <React.Fragment>
      <CollapsibleSection title="Disabled / Open" disabled>
        {sampleContent}
      </CollapsibleSection>
      <CollapsibleSection title="Disabled / Closed" disabled startCollapsed>
        {sampleContent}
      </CollapsibleSection>
    </React.Fragment>
  ));
