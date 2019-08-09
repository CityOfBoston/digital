import React from 'react';

import { storiesOf } from '@storybook/react';

import { NarrowWrapper } from '@cityofboston/storybook-common';

import DateRangePicker, { DateSet } from './DateRangePicker';

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

storiesOf('Common Components/DateRangePicker/DateSet', module)
  .add('default', () => (
    <NarrowWrapper>
      <DateSet handleChange={() => {}} dateName="date1" />
    </NarrowWrapper>
  ))
  .add('with values', () => (
    <NarrowWrapper>
      <DateSet
        handleChange={() => {}}
        dateName="date2"
        initialDate={[2, 2013]}
      />
    </NarrowWrapper>
  ));
