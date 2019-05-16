import React from 'react';

import { storiesOf } from '@storybook/react';
import { withKnobs, text } from '@storybook/addon-knobs';

import { NarrowWrapper } from '@cityofboston/storybook-common';

import DetailsDisclosure from './DetailsDisclosure';

const summaryText =
  'Are you requesting a certificate for international use that requires an Apostille from the Massachusetts Secretary of State?';

storiesOf('DetailsDisclosure', module)
  .addDecorator(story => <NarrowWrapper>{story()}</NarrowWrapper>)
  .addDecorator(withKnobs)
  .add('default', () => (
    <DetailsDisclosure
      summaryContent={text('summaryContent', summaryText)}
      id="storybook"
    >
      {detailsContent()}
    </DetailsDisclosure>
  ));

function detailsContent(): React.ReactChild {
  return (
    <>
      <p>
        You need to have a hand signature from the Registry. After you finish
        your order, please email birth@boston.gov with:
      </p>

      <ul>
        <li>the name of the person on the record</li>
        <li>their date of birth, and</li>
        <li>let us know that you need the signature for an Apostille.</li>
      </ul>
    </>
  );
}
