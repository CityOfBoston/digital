import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import HomePane from './HomePane';
import FormDialog from '../../common/FormDialog';
import Ui from '../../../data/store/Ui';
import LiveAgent from '../../../data/store/LiveAgent';

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

storiesOf('HomePane', module)
  .addDecorator(next => <div className="b-c">{next()}</div>)
  .add('Home', () => (
    <FormDialog noPadding>
      <HomePane
        ui={new Ui()}
        liveAgent={new LiveAgent('')}
        description="Dead raccoon on the sidewalk"
        topServiceSummaries={SERVICE_SUMMARIES}
        nextFn={action('Next')}
        handleDescriptionChanged={action('Description changed')}
      />
    </FormDialog>
  ));
