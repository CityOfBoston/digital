// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import ServiceList from './ServiceList';
import FormDialog from '../common/FormDialog';

const SERVICE_SUMMARIES = [
  {
    name: 'General Request',
    code: 'SRTV-00000054',
    hasMetadata: true,
  },
  {
    name: 'Needle Removal',
    code: 'SRTV-00000057',
    hasMetadata: true,
  },
  {
    name: 'Park Lighting Issues',
    code: 'SRTV-00000066',
    hasMetadata: true,
  },
  {
    name: 'Illegal Vending',
    code: 'SRTV-00000080',
    hasMetadata: true,
  },
  {
    name: 'Empty Litter Basket',
    code: 'SRTV-00000086',
    hasMetadata: true,
  },
  {
    name: 'Sidewalk Repair',
    code: 'SRTV-00000092',
    hasMetadata: true,
  },
  {
    name: 'Missed Trash, Recycling, Yard Waste, Bulk Item',
    code: 'SRTV-00000100',
    hasMetadata: true,
  },
  {
    name: 'Animal Control Generic',
    code: 'SRTV-00000132',
    hasMetadata: true,
  },
  {
    name: 'DEMO SERVICE TYPE',
    code: 'SRTV-00000146',
    hasMetadata: true,
  },
];

storiesOf('ServiceList', module)
  .add('List', () => (
    <FormDialog>
      <ServiceList serviceSummaries={SERVICE_SUMMARIES} onCodeChosen={action('Code Chosen')} />
    </FormDialog>
  ));
