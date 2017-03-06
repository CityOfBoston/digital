// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import jsc from 'jsverify';
import { mount } from 'enzyme';

import AttributeField from './AttributeField';

const TYPES = [
  'BOOLEAN_CHECKBOX',
  'INFORMATIONAL',
  'MULTIVALUELIST',
  'NUMBER',
  'DATETIME',
  'SINGLEVALUELIST',
  'STRING',
  'TEXT',
];

jsc.property(
  'renders',
  jsc.record({
    attribute: jsc.record({
      required: jsc.bool,
      type: jsc.elements(TYPES),
      code: jsc.nestring,
      description: jsc.string,
      values: jsc.array(jsc.record({ key: jsc.nestring, value: jsc.string })),
    }),
    currentValue: jsc.oneof(jsc.elements([undefined, null]), jsc.string),
    attributeChanged: jsc.constant(jest.fn()),
  }),
  (props) => renderer.create(<AttributeField {...props} />).toJSON() !== null,
);

test('string change event', () => {
  const attribute = {
    code: 'STRNGINPUT',
    type: 'STRING',
    description: '',
    required: true,
    values: null,
  };
  const attributeChanged = jest.fn();
  const wrapper = mount(
    <AttributeField attribute={attribute} currentValue="" attributeChanged={attributeChanged} />,
  );
  const input = wrapper.find('input');
  input.simulate('change', { target: { value: 'hello' } });
  expect(attributeChanged).toHaveBeenCalledWith('STRNGINPUT', 'hello');
});

test('checkbox click event', () => {
  const attribute = {
    code: 'CHKINPUT',
    type: 'BOOLEAN_CHECKBOX',
    description: '',
    required: true,
    values: null,
  };
  const attributeChanged = jest.fn();
  const wrapper = mount(
    <AttributeField attribute={attribute} currentValue="false" attributeChanged={attributeChanged} />,
  );
  const input = wrapper.find('input');

  input.simulate('change', { target: { checked: true } });
  expect(attributeChanged).toHaveBeenCalledWith('CHKINPUT', 'true');

  input.simulate('change', { target: { checked: false } });
  expect(attributeChanged).toHaveBeenCalledWith('CHKINPUT', 'false');
});

test('multivaluelist', () => {
  const attribute = {
    code: 'AVENGERS',
    type: 'MULTIVALUELIST',
    description: '',
    required: true,
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
  };
  const attributeChanged = jest.fn();
  const wrapper = mount(
    <AttributeField attribute={attribute} currentValue={['hercules', 'vision']} attributeChanged={attributeChanged} />,
  );
  const inputs = wrapper.find('input');
  const herculesInput = inputs.findWhere((i) => i.getDOMNode().value === 'hercules');
  expect(herculesInput.getDOMNode().checked).toEqual(true);

  const msMarvelInput = inputs.findWhere((i) => i.getDOMNode().value === 'ms-marvel');
  expect(msMarvelInput.getDOMNode().checked).toEqual(false);

  msMarvelInput.simulate('change', { target: { checked: true, value: 'ms-marvel' } });
  expect(attributeChanged).toHaveBeenCalledWith('AVENGERS', ['hercules', 'vision', 'ms-marvel']);

  herculesInput.simulate('change', { target: { checked: false, value: 'hercules' } });
  // ms marvel isn't considered checked here because the value is relative to how
  // we were originally rendered. In practice, the above attribute change would
  // cause a re-rerender.
  expect(attributeChanged).toHaveBeenCalledWith('AVENGERS', ['vision']);
});
