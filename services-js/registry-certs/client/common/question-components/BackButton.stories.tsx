import React from 'react';

import { storiesOf } from '@storybook/react';

import { CenterWrapper } from '@cityofboston/storybook-common';

import BackButton from './BackButton';

storiesOf('Common Components/Question Components/BackButton', module)
  .addDecorator(storyFn => (
    <div style={{ color: '#000', display: 'flex', justifyContent: 'center' }}>
      <CenterWrapper>{storyFn()}</CenterWrapper>
    </div>
  ))

  .add('default', () => <BackButton handleClick={() => {}} />);
