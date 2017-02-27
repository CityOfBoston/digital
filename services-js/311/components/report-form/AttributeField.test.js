// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import AttributeField from './AttributeField';

test('Text', () => {
  const component = renderer.create(
    <AttributeField
      attribute={{
        required: false,
        type: 'TEXT',
        code: 'ST-CMTS',
        description: 'Please provide any other relevant information:',
        values: null,
      }}
      attributeChanged={jest.fn()}
    />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});

test('Informational', () => {
  const component = renderer.create(
    <AttributeField
      attribute={{
        required: false,
        type: 'STRING',
        code: 'INFO-NEDRMV1',
        description: '**All needle pickup cases should be followed up with a phone call to one of the below agencies.**',
        values: null,
      }}
      attributeChanged={jest.fn()}
    />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});

test('Picklist', () => {
  const component = renderer.create(
    <AttributeField
      attribute={{
        required: true,
        type: 'SINGLEVALUELIST',
        code: 'SR-NEDRMV1',
        description: 'How many needles are at the location?',
        values: [{ key: 'One', name: 'One' }, { key: 'Two', name: 'Two' }, { key: 'Three', name: 'Three' }, { key: 'More than Three', name: 'More than Three' }],
      }}
      attributeChanged={jest.fn()}
    />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});
