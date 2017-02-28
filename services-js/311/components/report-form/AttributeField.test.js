// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import jsc from 'jsverify';
import TestUtils from 'react-addons-test-utils';

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

// used to wrap AttributeField because it's a functional component
class Wrapper extends React.Component {
  render() {
    return this.props.children;
  }
}

test('string change event', () => {
  const attribute = {
    code: 'STRNGINPUT',
    type: 'STRING',
    description: '',
    required: true,
    values: null,
  };
  const attributeChanged = jest.fn();
  const wrapper = TestUtils.renderIntoDocument(
    <Wrapper><AttributeField attribute={attribute} currentValue="" attributeChanged={attributeChanged} /></Wrapper>,
  );
  const input = TestUtils.findRenderedDOMComponentWithTag(wrapper, 'input');
  input.value = 'hello';
  TestUtils.Simulate.input(input);
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
  const wrapper = TestUtils.renderIntoDocument(
    <Wrapper><AttributeField attribute={attribute} currentValue="false" attributeChanged={attributeChanged} /></Wrapper>,
  );
  const input = TestUtils.findRenderedDOMComponentWithTag(wrapper, 'input');

  input.checked = true;
  TestUtils.Simulate.change(input);
  expect(attributeChanged).toHaveBeenCalledWith('CHKINPUT', 'true');

  input.checked = false;
  TestUtils.Simulate.change(input);
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
  const wrapper = TestUtils.renderIntoDocument(
    <Wrapper><AttributeField attribute={attribute} currentValue={['hercules', 'vision']} attributeChanged={attributeChanged} /></Wrapper>,
  );
  const inputs = TestUtils.scryRenderedDOMComponentsWithTag(wrapper, 'input');

  const herculesInput = inputs.find((i) => i.value === 'hercules');
  expect(herculesInput.checked).toEqual(true);

  const msMarvelInput = inputs.find((i) => i.value === 'ms-marvel');
  expect(msMarvelInput.checked).toEqual(false);

  msMarvelInput.checked = true;
  TestUtils.Simulate.change(msMarvelInput);
  expect(attributeChanged).toHaveBeenCalledWith('AVENGERS', ['hercules', 'vision', 'ms-marvel']);

  herculesInput.checked = false;
  TestUtils.Simulate.change(herculesInput);
  // ms marvel isn't considered checked here because the value is relative to how
  // we were originally rendered. In practice, the above attribute change would
  // cause a re-rerender.
  expect(attributeChanged).toHaveBeenCalledWith('AVENGERS', ['vision']);
});
