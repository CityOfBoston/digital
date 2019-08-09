import React from 'react';

import { storiesOf } from '@storybook/react';

import { NarrowWrapper } from '@cityofboston/storybook-common';

import AltSpellings from './AltSpellings';

storiesOf('Common Components/Question Components/AltSpellings', module)
  .addDecorator(storyFn => <NarrowWrapper>{storyFn()}</NarrowWrapper>)

  .add('default', () => (
    <AltSpellings handleChange={() => {}} person="person1" values="" />
  ))
  .add('with existing values', () => (
    <AltSpellings
      handleChange={() => {}}
      person="person1"
      values="Robert, Roberts, Roberto"
    />
  ));
