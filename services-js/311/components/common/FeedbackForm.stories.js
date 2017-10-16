// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { FeedbackFormContent } from './FeedbackForm';

storiesOf('FeedbackForm', module)
  .add('form', () =>
    <FeedbackFormContent
      close={action('close')}
      submit={action('submit')}
      userAgent="Test User Agent"
      loading={false}
      success={false}
      errorMessage={null}
    />
  )
  .add('loading', () =>
    <FeedbackFormContent
      close={action('close')}
      submit={action('submit')}
      userAgent="Test User Agent"
      loading={true}
      success={false}
      errorMessage={null}
    />
  )
  .add('error', () =>
    <FeedbackFormContent
      close={action('close')}
      submit={action('submit')}
      userAgent="Test User Agent"
      loading={false}
      success={false}
      errorMessage={'Network connection lost'}
    />
  )
  .add('success', () =>
    <FeedbackFormContent
      close={action('close')}
      submit={action('submit')}
      userAgent="Test User Agent"
      loading={false}
      success={true}
      errorMessage={null}
    />
  );
