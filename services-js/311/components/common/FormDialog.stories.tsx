import React from 'react';
import { storiesOf } from '@storybook/react';
import FormDialog from './FormDialog';
import SectionHeader from './SectionHeader';

storiesOf('FormDialog', module)
  .addDecorator(next => <div className="b-c">{next()}</div>)
  .add('Dialog', () => (
    <FormDialog>
      <SectionHeader>311: Boston City Services</SectionHeader>
    </FormDialog>
  ))
  .add('Narrow Dialog', () => (
    <FormDialog narrow>
      <SectionHeader>311: Boston City Services</SectionHeader>
    </FormDialog>
  ))
  .add('No Padding', () => (
    <FormDialog noPadding>
      <SectionHeader>311: Boston City Services</SectionHeader>
    </FormDialog>
  ));
