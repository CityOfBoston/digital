import React from 'react';
import { storiesOf } from '@storybook/react';

import SubmitPane from './SubmitPane';
import FormDialog from '../../common/FormDialog';
import Ui from '../../../data/store/Ui';

const makeError = (message, errors) => {
  const error: any = new Error(message);
  error.errors = errors;
  return error;
};

storiesOf('SubmitPane', module)
  .addDecorator(story => (
    <div className="b-c">
      <FormDialog>{story()}</FormDialog>
    </div>
  ))
  .add('Submitting', () => <SubmitPane state="submitting" ui={new Ui()} />)
  .add('Network Error', () => (
    <SubmitPane
      state="error"
      backUrl="/requests?code=CSMCINC"
      backUrlAs="/requests/CSMCINC"
      error={new TypeError('Failed to fetch')}
    />
  ))
  .add('GraphQL Error', () => (
    <SubmitPane
      state="error"
      backUrl="/requests?code=CSMCINC"
      backUrlAs="/requests/CSMCINC"
      error={makeError('GraphQL Server Error', [
        { message: 'firstName is a required field' },
        { message: 'lastName is a required field' },
      ])}
    />
  ));
