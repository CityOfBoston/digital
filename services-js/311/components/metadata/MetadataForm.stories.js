// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';
import MetadataForm from './MetadataForm';
import FormDialog from '../common/FormDialog';

const ATTRIBUTES = [
  {
    required: false,
    type: 'text',
    order: null,
    description: 'Please provide any other relevant information:',
    code: 'ST-CMTS',
    values: null,
  }, {
    required: false,
    type: 'informational',
    order: 1,
    description: '**All needle pickup cases should be followed up with a phone call to one of the below agencies.**',
    code: 'INFO-NEDRMV1',
    values: null,
  }, {
    required: false,
    type: 'informational',
    order: 2,
    description: 'Mobile Sharps Collection Team: 617-534-7123 (Monday-Friday 8am-6pm)',
    code: 'INFO-NEDRMV2',
    values: null,
  }, {
    required: false,
    type: 'informational',
    order: 3,
    description: 'Boston EMS: 617-343-1400 (All hours outside of Monday-Friday 8am-6pm)',
    code: 'INFO-NEDRMV3',
    values: null,
  }, {
    required: true,
    type: 'picklist',
    order: 4,
    description: 'How many needles are at the location?',
    code: 'SR-NEDRMV1',
    values: [{
      key: 'One',
      value: 'One',
    }, {
      key: 'Two',
      value: 'Two',
    }, {
      key: 'Three',
      value: 'Three',
    }, {
      key: 'More than Three',
      value: 'More than Three',
    }],
  }, {
    required: true,
    type: 'picklist',
    order: 5,
    description: 'Property location type',
    code: 'ST-PROPLOC',
    values: [{
      key: 'Private',
      value: 'Private',
    }, {
      key: 'Public',
      value: 'Public',
    }, {
      key: 'Unknown',
      value: 'Unknown',
    }],
  },
];

storiesOf('MetadataForm', module)
  .add('Dialog', () => (
    <FormDialog>
      <MetadataForm attributes={ATTRIBUTES} />
    </FormDialog>
  ));
