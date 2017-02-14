import React from 'react';
import { storiesOf } from '@kadira/storybook';
import FormDialog from './FormDialog';

storiesOf('FormDialog', module)
  .add('Dialog', () => (
    <FormDialog title="311: Boston City Services" />
  ));

