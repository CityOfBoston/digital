import React from 'react';

import { storiesOf } from '@storybook/react';

import { NarrowWrapper } from '@cityofboston/storybook-common';

import DateRangePicker, { DateComponent } from './DateRangePicker';

storiesOf('Common Components/DateRangePicker', module)
  .add('default', () => (
    <NarrowWrapper>
      <DateRangePicker onChange={() => {}} />
    </NarrowWrapper>
  ))
  .add('with values', () => (
    <NarrowWrapper>
      <DateRangePicker onChange={() => {}} dateRange="12/2001 - 11/2004" />
    </NarrowWrapper>
  ))
  .add('range too vast', () => (
    <NarrowWrapper>
      <DateRangePicker onChange={() => {}} dateRange="12/1990 - 11/2004" />
    </NarrowWrapper>
  ));

storiesOf('Common Components/DateRangePicker/DateComponent', module)
  .add('default', () => (
    <NarrowWrapper>
      <DateComponent handleChange={() => {}} dateName="date1" />
    </NarrowWrapper>
  ))
  .add('with values', () => (
    <NarrowWrapper>
      <DateComponent
        handleChange={() => {}}
        dateName="date2"
        initialDate={[2, 2013]}
      />
    </NarrowWrapper>
  ));
