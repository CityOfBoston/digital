// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import { DEFAULT_REQUEST, REQUEST_WITH_METADATA } from './QuestionsPane.test';
import QuestionsPane from './QuestionsPane';
import FormDialog from '../../common/FormDialog';

storiesOf('QuestionsPane', module)
.addDecorator((story) => (
  <FormDialog>{ story() }</FormDialog>
))
.add('No Metadata', () => (
  <QuestionsPane
    request={DEFAULT_REQUEST}
    nextFunc={action('Next Step')}
    setAttribute={action('Attribute Changed')}
  />
))
.add('With Metadata', () => (
  <QuestionsPane
    request={REQUEST_WITH_METADATA}
    nextFunc={action('Next Step')}
    setAttribute={action('Attribute Changed')}
  />
));
