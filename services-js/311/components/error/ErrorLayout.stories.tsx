import React from 'react';
import { storiesOf } from '@storybook/react';

import page from '../../.storybook/page';
import ErrorLayout from './ErrorLayout';

storiesOf('ErrorLayout', module)
  .addDecorator(page)
  .add('404', () => <ErrorLayout statusCode={404} />)
  .add('500', () => <ErrorLayout statusCode={500} />);
