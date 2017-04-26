// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';
import ChooseServicePane from './ChooseServicePane';
import FormDialog from '../../common/FormDialog';

const SERVICE_SUMMARIES = [
  {
    name: 'Needle Removal',
    code: 'SRTV-00000057',
    description: 'Remove needles',
    hasMetadata: true,
    locationRequired: true,
    group: null,
  },
  {
    name: 'Park Lighting Issues',
    code: 'SRTV-00000066',
    description: 'Light the park',
    hasMetadata: true,
    locationRequired: true,
    group: null,
  },
  {
    name: 'Illegal Vending',
    code: 'SRTV-00000080',
    description: 'Vend illegally',
    hasMetadata: true,
    locationRequired: true,
    group: null,
  },
  {
    name: 'Empty Litter Basket',
    code: 'SRTV-00000086',
    description: 'Empty a litter basket',
    hasMetadata: true,
    locationRequired: true,
    group: null,
  },
  {
    name: 'Sidewalk Repair',
    code: 'SRTV-00000092',
    description: 'Sidewalk a repair',
    hasMetadata: true,
    locationRequired: true,
    group: null,
  },
];

storiesOf('ChooseServicePane', module)
  .addDecorator((story) => (
    <FormDialog narrow noPadding>{story()}</FormDialog>
  ))
  .add('Loading matches', () => (
    <ChooseServicePane description="Dead raccoon on the sidewalk" suggestedServiceSummaries={null} />
  ))
  .add('Some matches', () => (
    <ChooseServicePane description="Dead raccoon on the sidewalk" suggestedServiceSummaries={SERVICE_SUMMARIES} />
  ))
  .add('No matches', () => (
    <ChooseServicePane description="Dead raccoon on the sidewalk" suggestedServiceSummaries={[]} />
  ))
  .add('No description', () => (
    <ChooseServicePane description="" suggestedServiceSummaries={[]} />
  ));
