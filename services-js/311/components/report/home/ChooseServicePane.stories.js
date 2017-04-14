// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import ChooseServicePane from './ChooseServicePane';
import FormDialog from '../../common/FormDialog';

const SERVICE_SUMMARIES = [
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

storiesOf('ChooseServicePane', module)
  .addDecorator((story) => (
    <FormDialog narrow noPadding>{story()}</FormDialog>
  ))
  .add('Loading matches', () => (
    <ChooseServicePane description="Dead raccoon on the sidewalk" suggestedServiceSummaries={null} handleDescriptionChanged={action('Description changed')} />
  ))
  .add('Some matches', () => (
    <ChooseServicePane description="Dead raccoon on the sidewalk" suggestedServiceSummaries={SERVICE_SUMMARIES} handleDescriptionChanged={action('Description changed')} />
  ))
  .add('No matches', () => (
    <ChooseServicePane description="Dead raccoon on the sidewalk" suggestedServiceSummaries={[]} handleDescriptionChanged={action('Description changed')} />
  ))
  .add('No description', () => (
    <ChooseServicePane description="" suggestedServiceSummaries={[]} handleDescriptionChanged={action('Description changed')} />
  ));
