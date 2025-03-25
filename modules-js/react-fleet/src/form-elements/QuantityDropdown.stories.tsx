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
        id={'quantityDropDown__1'}
        label={'Quantity1'}
        handleQuantityChange={() => {}}
        quantity={1} // Quantity = [Input] && || [Selecte] value
        selectOptions={{ start: 1, total: 10 }}
      />

      <br />

      <h4>Default (Q: 10)</h4>
      <QuantityDropdown
        id={'quantityDropDown__2'}
        label={'Quantity2'}
        handleQuantityChange={() => {}}
        quantity={11} // Quantity = [Input] && || [Selecte] value
        selectOptions={{ start: 1, total: 11 }}
      />

      <br />

      <h4>Default (Q: 100)</h4>
      <QuantityDropdown
        id={'quantityDropDown__3'}
        label={'Quantity3'}
        handleQuantityChange={() => {}}
        quantity={100} // Quantity = [Input] && || [Selecte] value
        selectOptions={{ start: 1, total: 12 }}
      />
    </>
  ));
