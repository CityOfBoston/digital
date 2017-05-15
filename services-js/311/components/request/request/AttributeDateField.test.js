// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import Question from '../../../data/store/Question';
import AttributeDateField from './AttributeDateField';

describe('rendering', () => {
  it('renders date', () => {
    const question = new Question({
      code: 'DATE-SEEN',
      type: 'DATE',
      description: '',
      required: true,
      values: null,
      conditionalValues: null,
      dependencies: null,
    });

    question.value = '2017-12-31';

    const component = renderer.create(
      <AttributeDateField question={question} />,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders time', () => {
    const question = new Question({
      code: 'DATE-SEEN',
      type: 'DATETIME',
      description: '',
      required: true,
      values: null,
      conditionalValues: null,
      dependencies: null,
    });

    // we don't set the time because of timezone issues on the testing environment

    const component = renderer.create(
      <AttributeDateField question={question} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
