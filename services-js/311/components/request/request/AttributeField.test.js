// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import jsc from 'jsverify';
import { mount } from 'enzyme';

import Question from '../../../data/store/Question';

import AttributeField from './AttributeField';

const TYPES = [
  'BOOLEAN_CHECKBOX',
  'INFORMATIONAL',
  'MULTIVALUELIST',
  'NUMBER',
  'SINGLEVALUELIST',
  'STRING',
  'TEXT',
];

jsc.property(
  'renders',
  jsc.record({
    question: jsc.record({
      required: jsc.bool,
      type: jsc.elements(TYPES),
      code: jsc.nestring,
      description: jsc.string,
      visible: jsc.bool,
      value: jsc.oneof(jsc.constant(null), jsc.string, jsc.array(jsc.string)),
      values: jsc.array(jsc.record({ key: jsc.nestring, value: jsc.string })),
    }),
  }),
  (props) => renderer.create(<AttributeField {...props} />).toJSON() !== null || !props.visible,
);

test('string change event', () => {
  const question = new Question({
    code: 'STRNGINPUT',
    type: 'STRING',
    description: '',
    required: true,
    values: null,
    conditionalValues: null,
    dependencies: null,
  });

  const wrapper = mount(<AttributeField question={question} />);
  wrapper.find('input').simulate('change', { target: { value: 'hello' } });

  expect(question.value).toEqual('hello');
});

test('checkbox click event', () => {
  const question = new Question({
    code: 'CHKINPUT',
    type: 'BOOLEAN_CHECKBOX',
    description: '',
    required: true,
    values: null,
    conditionalValues: null,
    dependencies: null,
  });

  const wrapper = mount(<AttributeField question={question} />);
  const input = wrapper.find('input');

  input.simulate('change', { target: { checked: true } });
  expect(question.value).toEqual('true');

  input.simulate('change', { target: { checked: false } });
  expect(question.value).toEqual('false');
});

test('multivaluelist', () => {
  const question = new Question({
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
    conditionalValues: [],
    dependencies: null,
  });

  question.value = ['hercules', 'vision'];

  const wrapper = mount(<AttributeField question={question} />);

  const inputs = wrapper.find('input');
  const herculesInput = inputs.findWhere((i) => i.getDOMNode().value === 'hercules');
  const msMarvelInput = inputs.findWhere((i) => i.getDOMNode().value === 'ms-marvel');

  expect(herculesInput.getDOMNode().checked).toEqual(true);
  expect(msMarvelInput.getDOMNode().checked).toEqual(false);

  msMarvelInput.simulate('change', { target: { checked: true, value: 'ms-marvel' } });
  expect((question.value || []).slice()).toEqual(['hercules', 'vision', 'ms-marvel']);

  herculesInput.simulate('change', { target: { checked: false, value: 'hercules' } });
  expect((question.value || []).slice()).toEqual(['vision', 'ms-marvel']);
});
