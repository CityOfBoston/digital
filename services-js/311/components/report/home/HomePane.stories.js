// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import HomePane from './HomePane';
import FormDialog from '../../common/FormDialog';

const SERVICE_SUMMARIES = [
  {
    name: 'General Request',
    code: 'SRTV-00000054',
    hasMetadata: true,
    locationRequired: true,
  },
  {
    name: 'Needle Removal',
    code: 'SRTV-00000057',
    hasMetadata: true,
    locationRequired: true,
  },
  {
    name: 'Park Lighting Issues',
    code: 'SRTV-00000066',
    hasMetadata: true,
    locationRequired: true,
  },
  {
    name: 'Illegal Vending',
    code: 'SRTV-00000080',
    hasMetadata: true,
    locationRequired: true,
  },
  {
    name: 'Empty Litter Basket',
    code: 'SRTV-00000086',
    hasMetadata: true,
    locationRequired: true,
  },
  {
    name: 'Sidewalk Repair',
    code: 'SRTV-00000092',
    hasMetadata: true,
    locationRequired: true,
  },
];

storiesOf('HomePane', module)
  .add('Home', () => (
    <FormDialog>
      <HomePane description="Dead raccoon on the sidewalk" topServiceSummaries={SERVICE_SUMMARIES} handleDescriptionChanged={action('Description changed')} />
    </FormDialog>
  ));
