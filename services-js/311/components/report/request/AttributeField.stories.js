// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import FormDialog from '../../common/FormDialog';
import AttributeField from './AttributeField';

storiesOf('AttributeField', module)
  .addDecorator((story) => (
    <FormDialog>{ story() }</FormDialog>
  ))
  .add('Boolean Checkbox', () => (
    <AttributeField
      attribute={{
        required: false,
        type: 'BOOLEAN_CHECKBOX',
        code: 'ST-CMTS',
        description: 'I solemnly swear that I am up to no good',
        values: null,
      }}
      currentValue="false"
      attributeChanged={action('Attribute Changed')}
    />
  ))
  .add('Text', () => (
    <AttributeField
      attribute={{
        required: false,
        type: 'TEXT',
        code: 'ST-CMTS',
        description: 'Please provide any other relevant information:',
        values: null,
      }}
      currentValue={'Things got bad after Thanos showed up.\n\nPlease send immediate assistance.'}
      attributeChanged={action('Attribute Changed')}
    />
  ))
  .add('Informational', () => (
    <AttributeField
      attribute={{
        required: false,
        type: 'INFORMATIONAL',
        code: 'INFO-NEDRMV1',
        description: '**All cosmic incursion cases should be followed up with a phone call to Alpha Flight.**',
        values: null,
      }}
      currentValue={null}
      attributeChanged={action('Attribute Changed')}
    />
  ))
  .add('String', () => (
    <AttributeField
      attribute={{
        required: false,
        type: 'STRING',
        code: 'INFO-NEDRMV1',
        description: 'What Earth timeline does this problem appear in?',
        values: null,
      }}
      currentValue="Post–Zero Day"
      attributeChanged={action('Attribute Changed')}
    />
  ))
  .add('Date', () => (
    <AttributeField
      attribute={{
        required: false,
        type: 'DATETIME',
        code: 'INFO-NEDRMV1',
        description: 'When are you currently in time?',
        values: null,
      }}
      currentValue="1965-12-31"
      attributeChanged={action('Attribute Changed')}
    />
  ))
  .add('Number', () => (
    <AttributeField
      attribute={{
        required: false,
        type: 'NUMBER',
        code: 'INFO-NEDRMV1',
        description: 'How many Doombots are at your present location?',
        values: null,
      }}
      currentValue="15"
      attributeChanged={action('Attribute Changed')}
    />
  ))
  .add('Single Value List', () => (
    <AttributeField
      attribute={{
        required: true,
        type: 'SINGLEVALUELIST',
        code: 'SR-NEDRMV1',
        description: 'How many dimensions were breached?',
        values: [{ key: 'One', name: 'One' }, { key: 'Two', name: 'Two' }, { key: 'Three', name: 'Three' }, { key: 'More than Three', name: 'More than Three' }],
      }}
      currentValue="Three"
      attributeChanged={action('Attribute Changed')}
    />
  ))
  .add('Multi Value List', () => (
    <AttributeField
      attribute={{
        required: true,
        type: 'MULTIVALUELIST',
        code: 'SR-NEDRMV1',
        description: 'Which Avengers should be notified?',
        values: [
            { key: 'captain-america', name: 'Captain America' },
            { key: 'hercules', name: 'Hercules' },
            { key: 'thor', name: 'Thor' },
            { key: 'wasp', name: 'Wasp' },
            { key: 'vision', name: 'Vision' },
            { key: 'ms-marvel', name: 'Ms. Marvel' },
            { key: 'spider-man', name: 'Spider-Man' },
            { key: 'captain-marvel', name: 'Captain Marvel' },
        ],
      }}
      currentValue={['wasp', 'spider-man', 'captain-marvel']}
      attributeChanged={action('Attribute Changed')}
    />
    ));
