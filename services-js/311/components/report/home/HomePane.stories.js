// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { AppStore } from '../../../data/store';
import HomePane from './HomePane';
import FormDialog from '../../common/FormDialog';

const SERVICE_SUMMARIES = [
  {
    name: 'Needle Removal',
    code: 'SRTV-00000057',
    description: 'Remove needles',
    group: null,
    hasMetadata: true,
    locationRequired: true,
  },
  {
    name: 'Park Lighting Issues',
    code: 'SRTV-00000066',
    description: 'Light the park',
    group: null,
    hasMetadata: true,
    locationRequired: true,
  },
  {
    name: 'Illegal Vending',
    code: 'SRTV-00000080',
    description: 'Vend illegally',
    group: null,
    hasMetadata: true,
    locationRequired: true,
  },
  {
    name: 'Empty Litter Basket',
    code: 'SRTV-00000086',
    description: 'Empty a litter basket',
    group: null,
    hasMetadata: true,
    locationRequired: true,
  },
  {
    name: 'Sidewalk Repair',
    code: 'SRTV-00000092',
    description: 'Sidewalk a repair',
    group: null,
    hasMetadata: true,
    locationRequired: true,
  },
];

storiesOf('HomePane', module)
  .add('Home', () => (
    <FormDialog>
      <HomePane store={new AppStore()} description="Dead raccoon on the sidewalk" topServiceSummaries={SERVICE_SUMMARIES} nextFn={action('Next')} handleDescriptionChanged={action('Description changed')} />
    </FormDialog>
  ));
