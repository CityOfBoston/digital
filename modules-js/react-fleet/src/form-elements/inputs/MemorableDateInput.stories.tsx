import React from 'react';

import { storiesOf } from '@storybook/react';

import MemorableDateInput from './MemorableDateInput';

storiesOf('Form Elements/Memorable date input', module)
  .add('default', () => (
    <MemorableDateInput handleDate={() => {}} legend={<h2>Date</h2>} />
  ))
  .add('earliestDate: 9/7/1630', () => (
    <MemorableDateInput
      earliestDate="9/7/1630"
      handleDate={() => {}}
      legend={<h2>Date</h2>}
    />
  ))
  .add('latestDate: 12/31/2025', () => (
    <MemorableDateInput
      latestDate="12/31/2025"
      handleDate={() => {}}
      legend={<h2>Date</h2>}
    />
  ))
  .add('with an initialDate', () => (
    <MemorableDateInput
      initialDate="12/31/1999"
      onlyAllowPast={true}
      handleDate={() => {}}
      legend={<h2>Date</h2>}
    />
  ))
  .add('onlyAllowPast', () => (
    <MemorableDateInput
      onlyAllowPast={true}
      handleDate={() => {}}
      legend={<h2>Date</h2>}
    />
  ))
  .add('onlyAllowFuture', () => (
    <MemorableDateInput
      onlyAllowFuture={true}
      handleDate={() => {}}
      legend={<h2>Date</h2>}
    />
  ))
  .add('onlyAllowFuture and latestDate: 1/1/2040', () => (
    <MemorableDateInput
      latestDate="1/1/2040"
      onlyAllowFuture={true}
      handleDate={() => {}}
      legend={<h2>Date</h2>}
    />
  ));
