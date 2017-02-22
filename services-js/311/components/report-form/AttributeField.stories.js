// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import FormDialog from '../common/FormDialog';
import AttributeField from './AttributeField';

const Container = FormDialog;

storiesOf('AttributeField', module)
  .add('Text', () => (
    <Container>
      <AttributeField
        attribute={{
          required: false,
          type: 'TEXT',
          code: 'ST-CMTS',
          description: 'Please provide any other relevant information:',
          values: null,
        }}
        attributeChanged={action('Attribute Changed')}
      />
    </Container>
  ))
  .add('Informational', () => (
    <Container>
      <AttributeField
        attribute={{
          required: false,
          type: 'INFORMATIONAL',
          code: 'INFO-NEDRMV1',
          description: '**All needle pickup cases should be followed up with a phone call to one of the below agencies.**',
          values: null,
        }}
        attributeChanged={action('Attribute Changed')}
      />
    </Container>
  ))
  .add('Picklist', () => (
    <Container>
      <AttributeField
        attribute={{
          required: true,
          type: 'PICKLIST',
          code: 'SR-NEDRMV1',
          description: 'How many needles are at the location?',
          values: [{ key: 'One', name: 'One' }, { key: 'Two', name: 'Two' }, { key: 'Three', name: 'Three' }, { key: 'More than Three', name: 'More than Three' }],
        }}
        attributeChanged={action('Attribute Changed')}
      />
    </Container>
  ));
