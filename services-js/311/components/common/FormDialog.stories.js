import React from 'react';
import { storiesOf } from '@kadira/storybook';
import FormDialog from './FormDialog';
import SectionHeader from './SectionHeader';

storiesOf('FormDialog', module)
  .add('Dialog', () => (
    <FormDialog>
      <SectionHeader>311: Boston City Services</SectionHeader>
    </FormDialog>
  ))
  .add('Small Dialog', () => (
    <FormDialog small>
      <SectionHeader>311: Boston City Services</SectionHeader>
    </FormDialog>
  ));
