import React from 'react';
import { mount } from 'enzyme';

import Question from '../../../data/store/Question';

import AttributeField from './AttributeField';
import { ServiceAttributeDatatype } from '../../../data/queries/types';

test('string change event', () => {
  const question = new Question({
    code: 'STRNGINPUT',
    type: ServiceAttributeDatatype.STRING,
    description: '',
    required: true,
    values: null,
    validations: [],
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
    type: ServiceAttributeDatatype.BOOLEAN_CHECKBOX,
    description: '',
    required: true,
    values: null,
    validations: [],
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
    type: ServiceAttributeDatatype.MULTIVALUELIST,
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
    validations: [],
    conditionalValues: [],
    dependencies: null,
  });

  question.value = ['hercules', 'vision'];

  const wrapper = mount(<AttributeField question={question} />);

  const inputs = wrapper.find('input');
  const herculesInput = inputs.findWhere(
    i => (i.getDOMNode() as HTMLInputElement).value === 'hercules'
  );
  const msMarvelInput = inputs.findWhere(
    i => (i.getDOMNode() as HTMLInputElement).value === 'ms-marvel'
  );

  expect((herculesInput.getDOMNode() as HTMLInputElement).checked).toEqual(
    true
  );

  expect((msMarvelInput.getDOMNode() as HTMLInputElement).checked).toEqual(
    false
  );

  msMarvelInput.simulate('change', {
    target: { checked: true, value: 'ms-marvel' },
  });
  expect((question.value || []).slice()).toEqual([
    'hercules',
    'vision',
    'ms-marvel',
  ]);

  herculesInput.simulate('change', {
    target: { checked: false, value: 'hercules' },
  });
  expect((question.value || []).slice()).toEqual(['vision', 'ms-marvel']);
});
