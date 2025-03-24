import React from 'react';

import { storiesOf } from '@storybook/react';
import { NarrowWrapper } from '@cityofboston/storybook-common';
import { withKnobs } from '@storybook/addon-knobs';

import RegistryCCSelectDropDown from './RegistryCCSelectDropdown';

storiesOf('Form Elements | Checkout / SelectDropdown', module)
  .addDecorator(story => <NarrowWrapper>{story()}</NarrowWrapper>)
  .addDecorator(withKnobs)
  .add('default', () => (
    <RegistryCCSelectDropDown
      label={'Service fee'}
      options={[
        { value: '-1', label: 'Select card' },
        { value: '0', label: 'credit card' },
        { value: '1', label: 'debit card' },
      ]}
    />
  ));
