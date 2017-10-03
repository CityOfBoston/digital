// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import FeedbackForm from './FeedbackForm';

storiesOf('FeedbackForm', module).add('default', () =>
  <FeedbackForm close={action('close')} userAgent="Test User Agent" />
);
