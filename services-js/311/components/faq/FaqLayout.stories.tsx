import React from 'react';
import { storiesOf } from '@storybook/react';

import page from '../../.storybook/page';
import FaqLayout from './FaqLayout';

storiesOf('FaqLayout', module)
  .addDecorator(page)
  .add('FAQ', () => (
    <FaqLayout suppressQuestions={process.env.NODE_ENV === 'test'} />
  ));
