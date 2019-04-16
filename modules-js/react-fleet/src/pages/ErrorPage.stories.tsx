import React from 'react';
import { storiesOf } from '@storybook/react';

import ErrorPage from './ErrorPage';

storiesOf('UI|Pages/ErrorPage', module)
  .add('404', () => <ErrorPage statusCode={404} />)
  .add('500', () => <ErrorPage statusCode={500} />);
