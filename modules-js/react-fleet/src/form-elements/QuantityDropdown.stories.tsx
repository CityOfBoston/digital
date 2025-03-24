import React from 'react';

import { storiesOf } from '@storybook/react';
import { NarrowWrapper } from '@cityofboston/storybook-common';
import { withKnobs } from '@storybook/addon-knobs';

import QuantityDropdown from './QuantityDropdown';

storiesOf('Form Elements | Checkout / QuantityDropdown', module)
  .addDecorator(story => <NarrowWrapper>{story()}</NarrowWrapper>)
  .addDecorator(withKnobs)
  .add('variants', () => (
    <>
      <h4>Default (Q: 1)</h4>
      <QuantityDropdown
        handleQuantityChange={() => {}}
        quantity={1}
        largeQ={false}
        data-type="select"
      />

      <br />

      <h4>Default (Q: 10)</h4>
      <QuantityDropdown
        handleQuantityChange={() => {}}
        quantity={10}
        largeQ={true}
        data-type="input"
      />

      <br />

      <h4>Default (Q: 100)</h4>
      <QuantityDropdown
        handleQuantityChange={() => {}}
        quantity={100}
        largeQ={true}
        data-type="input"
      />
    </>
  ));
