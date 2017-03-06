// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import { DEFAULT_SERVICE, DEFAULT_REQUEST, SERVICE_WITH_METADATA, REQUEST_WITH_METADATA } from './QuestionsPane.test';
import QuestionsPane from './QuestionsPane';
import FormDialog from '../../common/FormDialog';

storiesOf('QuestionsPane', module)
.addDecorator((story) => (
  <FormDialog>{ story() }</FormDialog>
))
.add('No Metadata', () => (
  <QuestionsPane
    service={DEFAULT_SERVICE}
    request={DEFAULT_REQUEST}
    nextFunc={action('Next Step')}
    setAttribute={action('Attribute Changed')}
  />
))
.add('With Metadata', () => (
  <QuestionsPane
    service={SERVICE_WITH_METADATA}
    request={REQUEST_WITH_METADATA}
    nextFunc={action('Next Step')}
    setAttribute={action('Attribute Changed')}
  />
));
