// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
// We use the container rather than the component itself in order to get
// the apiKey and API script loaded.
import LocationMap from '.';

storiesOf('LocationMap', module)
  .add('inactive', () => (
    <LocationMap active={false} goToReportForm={action('Go to Report')} />
  ))
  .add('active', () => (
    <LocationMap active goToReportForm={action('Go to Report')} />
  ));
