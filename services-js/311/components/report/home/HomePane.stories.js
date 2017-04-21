// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import HomePane from './HomePane';
import FormDialog from '../../common/FormDialog';

const SERVICE_SUMMARIES = [
  {
    name: 'Needle Removal',
    code: 'SRTV-00000057',
    description: 'Remove needles',
    hasMetadata: true,
    locationRequired: true,
  },
  {
    name: 'Park Lighting Issues',
    code: 'SRTV-00000066',
    description: 'Light the park',
    hasMetadata: true,
    locationRequired: true,
  },
  {
    name: 'Illegal Vending',
    code: 'SRTV-00000080',
    description: 'Vend illegally',
    hasMetadata: true,
    locationRequired: true,
  },
  {
    name: 'Empty Litter Basket',
    code: 'SRTV-00000086',
    description: 'Empty a litter basket',
    hasMetadata: true,
    locationRequired: true,
  },
  {
    name: 'Sidewalk Repair',
    code: 'SRTV-00000092',
    description: 'Sidewalk a repair',
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
