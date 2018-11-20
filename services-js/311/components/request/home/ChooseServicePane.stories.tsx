import React from 'react';
import { storiesOf } from '@storybook/react';
import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import ChooseServicePane from './ChooseServicePane';
import FormDialog from '../../common/FormDialog';
import Ui from '../../../data/store/Ui';

const SERVICE_SUMMARIES = [
  {
    name: 'Needle Removal',
    code: 'SRTV-00000057',
    description: 'Remove needles',
    group: null,
  },
  {
    name: 'Park Lighting Issues',
    code: 'SRTV-00000066',
    description: 'Light the park',
    group: null,
  },
  {
    name: 'Illegal Vending',
    code: 'SRTV-00000080',
    description: 'Vend illegally',
    group: null,
  },
  {
    name: 'Empty Litter Basket',
    code: 'SRTV-00000086',
    description: 'Empty a litter basket',
    group: null,
  },
  {
    name: 'Sidewalk Repair',
    code: 'SRTV-00000092',
    description: 'Sidewalk a repair',
    group: null,
  },
];

storiesOf('ChooseServicePane', module)
  .addDecorator(story => (
    <FormDialog narrow noPadding>
      {story()}
    </FormDialog>
  ))
  .add('Loading matches', () => (
    <ChooseServicePane
      description="Dead raccoon on the sidewalk"
      suggestedServiceSummaries={null}
      ui={new Ui()}
      siteAnalytics={new GaSiteAnalytics()}
    />
  ))
  .add('Some matches', () => (
    <ChooseServicePane
      description="Dead raccoon on the sidewalk"
      suggestedServiceSummaries={SERVICE_SUMMARIES}
      ui={new Ui()}
      siteAnalytics={new GaSiteAnalytics()}
    />
  ))
  .add('No matches', () => (
    <ChooseServicePane
      description="Dead raccoon on the sidewalk"
      suggestedServiceSummaries={[]}
      ui={new Ui()}
      siteAnalytics={new GaSiteAnalytics()}
    />
  ));
