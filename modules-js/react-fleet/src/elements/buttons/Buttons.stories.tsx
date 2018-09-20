import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';


import CloseButton from '../buttons/CloseButton';

storiesOf('Elements/Buttons', module)
  .add('close', () => <CloseButton size={'50px'} handleClick={action('clicked')} />);
